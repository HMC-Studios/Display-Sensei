// =========================
// Armor preview (back end)
// =========================

// =========================
// State
// =========================
const ARMOR_OVERLAY_DEFAULTS = { show: false, outerLayer: true, otherSlots: 'none', flatTexture: null, xray: false };
const ARMOR_OTHER_SLOT_MODES = ['none', 'grey', 'flat'];

let armorWearerId = DEFAULT_WEARER_ID;
let armorOverlayOptions = Object.assign({}, ARMOR_OVERLAY_DEFAULTS);
let armorPreviewSlot = null;
let activeArmorPose = null;
let armorFitPreview = false;
let armorOverlay = null;
let placedArmorMeshes = [];
let armorCompileDepth = 0;
let savedArmorCamera = null;
let armorCameraView = null;

// =========================
// Wearers and options
// =========================
function getWearerChoices() {
    return WEARER_RIGS.map(rig => ({ id: rig.id, label: i18n(rig.label), textured: !!rig.texture }));
}

function getWearer() {
    return armorWearerId;
}

function getArmorWearerRig() {
    return findWearerRig(armorWearerId) || findWearerRig(DEFAULT_WEARER_ID);
}

function setWearer(id) {
    if (!findWearerRig(id)) return false;
    armorWearerId = id;
    if (activeArmorPose && !resolveArmorPose(id, activeArmorPose)) activeArmorPose = null;
    refreshArmorPreviewSafely();
    return true;
}

function getOverlayOptions() {
    return Object.assign({}, armorOverlayOptions);
}

function setOverlayOptions(partial) {
    let options = isPlainObject(partial) ? partial : {};
    for (let key of ['show', 'outerLayer', 'xray']) {
        if (typeof options[key] === 'boolean') armorOverlayOptions[key] = options[key];
    }
    if (ARMOR_OTHER_SLOT_MODES.includes(options.otherSlots)) armorOverlayOptions.otherSlots = options.otherSlots;
    if (options.flatTexture === null || typeof options.flatTexture === 'string') armorOverlayOptions.flatTexture = options.flatTexture;
    refreshArmorPreviewSafely();
    return getOverlayOptions();
}

function setArmorPreviewSlot(slotId) {
    let slot = isArmorSlotId(slotId) ? slotId : null;
    if (slot === armorPreviewSlot) return slot !== null;
    armorPreviewSlot = slot;
    refreshArmorPreviewSafely();
    return slot !== null;
}

function getArmorPreviewSlotId() {
    if (armorPreviewSlot) return armorPreviewSlot;
    let found = Project ? getWearInfo().slot : null;
    return isArmorSlotId(found) ? found : null;
}

function isArmorPreviewContext() {
    if (!Project || Project.multi_file_ruleset) return false;
    return getRoute() === 'attachable' && (Modes.edit || Modes.paint);
}

// =========================
// Box UV
// =========================
const ARMOR_FACE_ORDER = ['east', 'west', 'up', 'down', 'south', 'north'];

const BUNDLED_WEARER_TEXTURE_SIZE = [64, 64];

function getBoxUvFaces(size, offset, mirror = false) {
    let [x, y, z] = size.map(value => Math.floor(value + 0.0000001));
    let list = [
        { face: 'east', from: [0, z], size: [z, y] },
        { face: 'west', from: [z + x, z], size: [z, y] },
        { face: 'up', from: [z + x, z], size: [-x, -z] },
        { face: 'down', from: [z + x * 2, 0], size: [-x, z] },
        { face: 'south', from: [z * 2 + x, z], size: [x, y] },
        { face: 'north', from: [z, z], size: [x, y] }
    ];
    if (mirror) {
        for (let entry of list) {
            entry.from[0] += entry.size[0];
            entry.size[0] *= -1;
        }
        [list[0].from, list[0].size, list[1].from, list[1].size] = [list[1].from, list[1].size, list[0].from, list[0].size];
    }
    let faces = {};
    for (let entry of list) {
        faces[entry.face] = [
            entry.from[0] + offset[0],
            entry.from[1] + offset[1],
            entry.from[0] + entry.size[0] + offset[0],
            entry.from[1] + entry.size[1] + offset[1]
        ];
    }
    return faces;
}

function getBoxUvCorners(rectangle, textureSize) {
    let uv = rectangle.slice();
    for (let side = 0; side < 2; side++) {
        let margin = uv[side] > uv[side + 2] ? -1 / 64 : 1 / 64;
        uv[side] += margin;
        uv[side + 2] -= margin;
    }
    let [width, height] = textureSize;
    return [
        [uv[0] / width, 1 - uv[1] / height],
        [uv[2] / width, 1 - uv[1] / height],
        [uv[0] / width, 1 - uv[3] / height],
        [uv[2] / width, 1 - uv[3] / height]
    ];
}

function setBoxUv(geometry, cube, textureSize) {
    let faces = getBoxUvFaces(cube.size, cube.uv, !!cube.mirror);
    let attribute = geometry.attributes.uv;
    ARMOR_FACE_ORDER.forEach((face, faceIndex) => {
        getBoxUvCorners(faces[face], textureSize).forEach(([u, v], corner) => {
            attribute.setXY(faceIndex * 4 + corner, u, v);
        });
    });
    attribute.needsUpdate = true;
}

// =========================
// Building the wearer
// =========================
function createArmorNode(name) {
    let node = new THREE.Object3D();
    node.name = name;
    node.no_export = true;
    node.rotation.order = 'ZYX';
    return node;
}

function addArmorBoxMesh(overlay, parent, cube, pivot, material, uvSize) {
    let inflate = typeof cube.inflate === 'number' ? cube.inflate : 0;
    let size = cube.size;
    let geometry = new THREE.BoxGeometry(size[0] + inflate * 2, size[1] + inflate * 2, size[2] + inflate * 2);
    if (uvSize && Array.isArray(cube.uv)) setBoxUv(geometry, cube, uvSize);
    overlay.disposables.push(geometry);
    let mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'display_sensei_wearer_cube';
    mesh.no_export = true;
    let centre = [-(cube.origin[0] + size[0] / 2), cube.origin[1] + size[1] / 2, cube.origin[2] + size[2] / 2];
    let origin = pivot;
    if (Array.isArray(cube.rotation) && Array.isArray(cube.pivot)) {
        let cubePivot = toBlockbenchPosition(cube.pivot);
        let turn = createArmorNode('display_sensei_wearer_turn');
        turn.position.set(cubePivot[0] - pivot[0], cubePivot[1] - pivot[1], cubePivot[2] - pivot[2]);
        setMeshRotation(turn, toBlockbenchRotation(cube.rotation));
        parent.add(turn);
        parent = turn;
        origin = cubePivot;
    }
    mesh.position.set(centre[0] - origin[0], centre[1] - origin[1], centre[2] - origin[2]);
    parent.add(mesh);
    return mesh;
}

function loadBundledWearerTexture(overlay, path) {
    let image = new Image();
    let texture = new THREE.Texture(image);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    image.onload = () => {
        texture.needsUpdate = true;
    };
    image.src = path;
    overlay.disposables.push(texture);
    return texture;
}

function getProjectTextureMap(overlay, uuid) {
    let texture = uuid && Project ? Texture.all.find(entry => entry.uuid === uuid) : null;
    if (!texture) return null;
    let material = typeof texture.getOwnMaterial === 'function' ? texture.getOwnMaterial() : null;
    let shared = material && material.uniforms && material.uniforms.map ? material.uniforms.map.value : null;
    if (shared) return shared;
    if (!texture.canvas) return null;
    let copy = new THREE.Texture(texture.canvas);
    copy.magFilter = THREE.NearestFilter;
    copy.minFilter = THREE.NearestFilter;
    copy.needsUpdate = true;
    overlay.disposables.push(copy);
    return copy;
}

function createArmorMaterial(overlay, settings) {
    let material = new THREE.MeshLambertMaterial(Object.assign({ side: THREE.DoubleSide }, settings));
    material.userData.normal = { transparent: material.transparent, opacity: material.opacity, depthWrite: material.depthWrite };
    overlay.disposables.push(material);
    return material;
}

function findWearerParentKey(wearer, key) {
    let parentKey = findRigBoneName(wearer, wearer.bones[key].parent);
    return parentKey && parentKey !== key ? parentKey : null;
}

function addWearerCube(overlay, joint, cube, pivot, materials, uvSize) {
    let isLayer = cube.layer === true;
    let mesh = addArmorBoxMesh(overlay, joint, cube, pivot, isLayer ? materials.layer : materials.skin, uvSize);
    (isLayer ? overlay.layerMeshes : overlay.wearerMeshes).push(mesh);
}

function buildWearerJoints(overlay, wearer) {
    let textured = !!wearer.texture;
    let map = textured ? loadBundledWearerTexture(overlay, wearer.texture) : null;
    let uvSize = textured ? BUNDLED_WEARER_TEXTURE_SIZE : null;
    let skin = createArmorMaterial(overlay, textured ? { map, alphaTest: 0.05 } : { color: 0xb4b9be });
    let layer = textured ? skin : createArmorMaterial(overlay, { color: 0xb4b9be, transparent: true, opacity: 0.3, depthWrite: false });
    let materials = { skin, layer };
    overlay.wearerMaterials.push(skin);
    if (layer !== skin) overlay.wearerMaterials.push(layer);
    let built = new Set();
    let build = (key, parentObject, parentPivot) => {
        if (built.has(key)) return;
        built.add(key);
        let bone = wearer.bones[key];
        let pivot = toBlockbenchPosition(bone.pivot || [0, 0, 0]);
        let joint = createArmorNode(`display_sensei_wearer_${key}`);
        joint.position.set(pivot[0] - parentPivot[0], pivot[1] - parentPivot[1], pivot[2] - parentPivot[2]);
        joint.userData.restPosition = joint.position.clone();
        joint.userData.restRotation = toBlockbenchRotation(bone.rotation || [0, 0, 0]);
        joint.userData.pivot = pivot;
        parentObject.add(joint);
        overlay.joints.set(key.toLowerCase(), joint);
        if (!bone.neverRender) {
            for (let cube of bone.cubes || []) addWearerCube(overlay, joint, cube, pivot, materials, uvSize);
        }
        for (let child of Object.keys(wearer.bones)) {
            if (findWearerParentKey(wearer, child) === key) build(child, joint, pivot);
        }
    };
    for (let key of Object.keys(wearer.bones)) {
        if (!findWearerParentKey(wearer, key)) build(key, overlay.poseRoot, [0, 0, 0]);
    }
    let overlayBones = wearer.overlay && wearer.overlay.bones ? wearer.overlay.bones : {};
    for (let key of Object.keys(overlayBones)) {
        let joint = overlay.joints.get(key.toLowerCase());
        let bone = overlayBones[key];
        if (!joint || bone.neverRender) continue;
        let pivot = toBlockbenchPosition(bone.pivot || [0, 0, 0]);
        for (let cube of bone.cubes || []) addWearerCube(overlay, joint, cube, pivot, { skin: layer, layer }, null);
    }
}

function buildFlatArmorPieces(overlay, wearer, slotId, mode, flatTexture) {
    if (mode === 'none') return;
    let flatArmor = isBabyWearer(wearer) ? FLAT_ARMOR_BABY : FLAT_ARMOR;
    let map = mode === 'flat' ? getProjectTextureMap(overlay, flatTexture) : null;
    let material = map
        ? createArmorMaterial(overlay, { map, alphaTest: 0.05 })
        : createArmorMaterial(overlay, { color: 0x8c99a6, transparent: true, opacity: 0.5, depthWrite: false });
    for (let slot of WEAR_SLOTS) {
        let piece = slot.flatPiece && isArmorSlotId(slot.id) && slot.id !== slotId ? flatArmor[slot.flatPiece] : null;
        if (!piece) continue;
        let uvSize = map ? [piece.textureWidth, piece.textureHeight] : null;
        let placed = new Set();
        let place = (key, parentObject, parentPivot) => {
            if (placed.has(key)) return;
            placed.add(key);
            let bone = piece.bones[key];
            let pivot = toBlockbenchPosition(bone.pivot || [0, 0, 0]);
            let holder = createArmorNode(`display_sensei_flat_${key}`);
            let joint = overlay.joints.get(key.toLowerCase());
            if (joint) {
                joint.add(holder);
            } else {
                parentObject.add(holder);
                holder.position.set(pivot[0] - parentPivot[0], pivot[1] - parentPivot[1], pivot[2] - parentPivot[2]);
            }
            for (let cube of bone.cubes || []) addArmorBoxMesh(overlay, holder, cube, pivot, material, uvSize);
            for (let child of Object.keys(piece.bones)) {
                if (findWearerParentKey(piece, child) === key) place(child, holder, pivot);
            }
        };
        for (let key of Object.keys(piece.bones)) {
            if (!findWearerParentKey(piece, key)) place(key, overlay.root, [0, 0, 0]);
        }
    }
}

function getArmorOverlayKey(wearer) {
    let options = armorOverlayOptions;
    return [wearer.id, getArmorPreviewSlotId(), options.otherSlots, options.otherSlots === 'flat' ? options.flatTexture : ''].join('|');
}

function buildArmorOverlay(wearer) {
    let overlay = {
        key: getArmorOverlayKey(wearer),
        root: createArmorNode('display_sensei_armor_overlay'),
        poseRoot: createArmorNode('display_sensei_armor_pose_root'),
        joints: new Map(),
        wearerMaterials: [],
        wearerMeshes: [],
        layerMeshes: [],
        disposables: []
    };
    overlay.root.add(overlay.poseRoot);
    buildWearerJoints(overlay, wearer);
    buildFlatArmorPieces(overlay, wearer, getArmorPreviewSlotId(), armorOverlayOptions.otherSlots, armorOverlayOptions.flatTexture);
    Canvas.scene.add(overlay.root);
    Canvas.gizmos.push(overlay.root);
    return overlay;
}

function disposeArmorOverlay() {
    if (!armorOverlay) return;
    let root = armorOverlay.root;
    if (root.parent) root.parent.remove(root);
    let index = Canvas.gizmos.indexOf(root);
    if (index >= 0) Canvas.gizmos.splice(index, 1);
    for (let item of armorOverlay.disposables) item.dispose();
    armorOverlay = null;
}

function applyArmorXray(overlay, on) {
    for (let material of overlay.wearerMaterials) {
        let normal = material.userData.normal;
        material.transparent = on || normal.transparent;
        material.opacity = on ? 0.35 : normal.opacity;
        material.depthWrite = !on && normal.depthWrite;
        material.depthTest = !on;
        material.needsUpdate = true;
    }
    for (let mesh of overlay.wearerMeshes.concat(overlay.layerMeshes)) mesh.renderOrder = on ? 2 : 0;
}

function applyArmorOverlayOptions(overlay) {
    let model = Project.model_3d;
    overlay.root.position.copy(model.position);
    overlay.root.quaternion.copy(model.quaternion);
    overlay.root.scale.copy(model.scale);
    overlay.root.visible = armorOverlayOptions.show;
    for (let mesh of overlay.layerMeshes) mesh.visible = armorOverlayOptions.outerLayer;
    applyArmorXray(overlay, armorOverlayOptions.xray);
}

// =========================
// Pose test
// =========================
function resolveArmorPose(wearerId, poseId) {
    if (!poseId) return null;
    return getWearerPoses(wearerId).find(pose => pose.id === poseId) || null;
}

function getPoseChoices(wearerId = armorWearerId) {
    return getWearerPoses(wearerId).map(pose => ({ id: pose.id, label: i18n(pose.label), chosen: !!pose.chosen }));
}

function startPoseTest(id) {
    if (!Modes.edit || !isArmorPreviewContext() || !resolveArmorPose(armorWearerId, id)) return false;
    activeArmorPose = id;
    refreshArmorPreviewSafely();
    return true;
}

function stopPoseTest() {
    if (!activeArmorPose) return false;
    activeArmorPose = null;
    refreshArmorPreviewSafely();
    return true;
}

function getActivePose() {
    return activeArmorPose;
}

function applyWearerPose(overlay, pose) {
    overlay.poseRoot.position.set(0, 0, 0);
    setMeshRotation(overlay.poseRoot, [0, 0, 0]);
    for (let joint of overlay.joints.values()) {
        joint.position.copy(joint.userData.restPosition);
        setMeshRotation(joint, joint.userData.restRotation);
    }
    if (pose) {
        for (let name of Object.keys(pose.bones || {})) {
            let joint = overlay.joints.get(name.toLowerCase());
            if (joint) setMeshRotation(joint, addVectors(joint.userData.restRotation, toBlockbenchRotation(pose.bones[name])));
        }
        for (let name of Object.keys(pose.positions || {})) {
            let joint = overlay.joints.get(name.toLowerCase());
            if (joint) joint.position.add(new THREE.Vector3().fromArray(toBlockbenchPosition(pose.positions[name])));
        }
        if (pose.root) {
            let pivot = new THREE.Vector3().fromArray(toBlockbenchPosition(pose.root.pivot || [0, 0, 0]));
            setMeshRotation(overlay.poseRoot, toBlockbenchRotation(pose.root.rotation || [0, 0, 0]));
            let turnedPivot = pivot.clone().applyEuler(overlay.poseRoot.rotation);
            overlay.poseRoot.position.fromArray(toBlockbenchPosition(pose.root.position || [0, 0, 0])).add(pivot).sub(turnedPivot);
        }
    }
    overlay.root.updateMatrixWorld(true);
}

// =========================
// Placing the model on the wearer
// =========================
function setFitPreview(on) {
    armorFitPreview = !!on;
    refreshArmorPreviewSafely();
    return true;
}

function restorePlacedMeshes() {
    for (let mesh of placedArmorMeshes) {
        if (mesh.fix_position) mesh.position.copy(mesh.fix_position);
        if (mesh.fix_rotation) mesh.rotation.copy(mesh.fix_rotation);
        mesh.scale.set(1, 1, 1);
        mesh.updateMatrixWorld(true);
    }
    placedArmorMeshes = [];
}

function placeArmorGroupMesh(group, overlay, fitOffsets, slotId) {
    let mesh = group.mesh;
    if (!mesh || !mesh.parent || !mesh.fix_position || !mesh.fix_rotation) return;
    let binding = parseBoneBinding(group.bedrock_binding);
    let joint = null;
    let offset = [0, 0, 0];
    if (binding.kind === 'none') {
        joint = overlay.joints.get(group.name.toLowerCase()) || null;
    } else {
        let target = getBindingTarget(binding, slotId);
        joint = target ? overlay.joints.get(target.toLowerCase()) || null : null;
        let anchor = group.parent instanceof Group ? group.parent.origin : BOUND_ROOT_ANCHOR;
        offset = subtractVectors(group.origin, anchor);
    }
    let fit = fitOffsets[group.name] ? toBlockbenchFitOffset(fitOffsets[group.name]) : null;
    if (!joint && !fit) return;
    let move = fit ? fit.position : [0, 0, 0];
    let turn = fit ? fit.rotation : [0, 0, 0];
    let rest = mesh.fix_rotation;
    let euler = new THREE.Euler(rest.x + turn[0] * DEGREES, rest.y + turn[1] * DEGREES, rest.z + turn[2] * DEGREES, rest.order);
    let quaternion = new THREE.Quaternion().setFromEuler(euler);
    let scale = new THREE.Vector3().fromArray(fit ? fit.scale : [1, 1, 1]);
    let local;
    if (joint) {
        let position = new THREE.Vector3(offset[0] + move[0], offset[1] + move[1], offset[2] + move[2]);
        let world = new THREE.Matrix4().compose(position, quaternion, scale).premultiply(joint.matrixWorld);
        local = new THREE.Matrix4().copy(mesh.parent.matrixWorld).invert().multiply(world);
    } else {
        let position = mesh.fix_position.clone().add(new THREE.Vector3().fromArray(move));
        local = new THREE.Matrix4().compose(position, quaternion, scale);
    }
    local.decompose(mesh.position, mesh.quaternion, mesh.scale);
    mesh.updateMatrixWorld(true);
    placedArmorMeshes.push(mesh);
}

function placeArmorModel(overlay) {
    let slotId = getArmorPreviewSlotId();
    let fitOffsets = armorFitPreview && slotId ? (getProjectData().armor.fit[slotId] || {}) : {};
    Project.model_3d.updateMatrixWorld(true);
    let visit = nodes => {
        for (let node of nodes) {
            if (!(node instanceof Group)) continue;
            placeArmorGroupMesh(node, overlay, fitOffsets, slotId);
            visit(node.children);
        }
    };
    visit(Outliner.root);
}

// =========================
// Held items on the holder
// =========================
const HELD_WEARER_IDS = ['player_wide', 'player_slim', 'zombie', 'baby_zombie', 'armor_stand'];
const HELD_CAMERAS = ['first', 'back', 'front'];
const HELD_ITEM_BONES = { main_hand: 'rightItem', off_hand: 'leftItem' };
const HELD_ARM_BONES = { main_hand: 'rightArm', off_hand: 'leftArm' };
const HOLDING_ARM = [-PLAYER_HOLD_ANGLE, 0, 0];

let heldPreview = null;
let heldWearerId = DEFAULT_WEARER_ID;

function getHeldWearerChoices() {
    return HELD_WEARER_IDS
        .map(findWearerRig)
        .filter(rig => rig && findRigBoneName(rig, 'rightItem') && findRigBoneName(rig, 'leftItem'))
        .map(rig => ({ id: rig.id, label: i18n(rig.label), textured: !!rig.texture }));
}

function getHeldWearer() {
    return heldWearerId;
}

function setHeldWearer(id) {
    if (!getHeldWearerChoices().some(choice => choice.id === id)) return false;
    heldWearerId = id;
    refreshArmorPreviewSafely();
    return true;
}

function setHeldPreview(request) {
    let slot = request ? findHoldSlot(request.slotId) : null;
    let next = slot ? { slotId: slot.slotId, camera: HELD_CAMERAS.includes(request.camera) ? request.camera : 'back' } : null;
    let changed = JSON.stringify(next) !== JSON.stringify(heldPreview);
    heldPreview = next;
    if (changed) refreshArmorPreviewSafely();
    return isHeldPreviewShown();
}

function isHeldPreviewShown() {
    return !!heldPreview && isArmorPreviewContext();
}

function getHeldWearerRig() {
    return findWearerRig(heldWearerId) || findWearerRig(DEFAULT_WEARER_ID);
}

function getHeldArmTurns(wearer, slot) {
    let turns = {};
    let other = getOtherHoldHand(slot.hand);
    if (wearer.id === 'armor_stand') {
        let pose = STAND_POSES[STAND_DEFAULT_POSE];
        turns.rightArm = pose.rightarm.slice();
        turns.leftArm = pose.leftarm.slice();
    } else if (RAISED_ARM_WEARERS.includes(wearer.id)) {
        let arms = getZombieArms(wearer.id, slot.hand === 'off_hand' ? 'thirdperson_lefthand' : 'thirdperson_righthand');
        turns.rightArm = arms.right.slice();
        turns.leftArm = arms.left.slice();
    } else {
        turns[HELD_ARM_BONES[slot.hand]] = HOLDING_ARM.slice();
        turns[HELD_ARM_BONES[other]] = [0, 0, 0];
    }
    return { bones: toRigBoneNames(wearer, turns), positions: {}, root: null };
}

function buildHeldOverlay(wearer) {
    let overlay = {
        key: `held|${wearer.id}`,
        root: createArmorNode('display_sensei_held_overlay'),
        poseRoot: createArmorNode('display_sensei_held_pose_root'),
        joints: new Map(),
        wearerMaterials: [],
        wearerMeshes: [],
        layerMeshes: [],
        disposables: []
    };
    overlay.root.add(overlay.poseRoot);
    buildWearerJoints(overlay, wearer);
    Canvas.scene.add(overlay.root);
    Canvas.gizmos.push(overlay.root);
    return overlay;
}

function mirrorFrameX(matrix) {
    let mirror = new THREE.Matrix4().makeScale(-1, 1, 1);
    return mirror.clone().multiply(matrix).multiply(mirror);
}

function getFirstPersonHeldFrame(hand) {
    let frame = composeFirstPersonFrame();
    if (hand === 'off_hand') frame = mirrorFrameX(frame);
    return new THREE.Matrix4().copy(Project.model_3d.matrixWorld).multiply(frame);
}

function getBindingHand(binding, slot) {
    if (binding.kind === 'item_slot') return slot.hand;
    if (binding.kind === 'bone' && binding.hand) return /^left/i.test(binding.target) ? 'off_hand' : 'main_hand';
    return null;
}

function getHeldFrame(overlay, slot, hand) {
    if (slot.view === 'first_person') return getFirstPersonHeldFrame(hand);
    let joint = overlay ? overlay.joints.get(HELD_ITEM_BONES[hand].toLowerCase()) : null;
    return joint ? joint.matrixWorld.clone() : null;
}

function placeHeldGroupMesh(group, frame, values, anchor) {
    let mesh = group.mesh;
    if (!mesh || !mesh.parent || !mesh.fix_position || !mesh.fix_rotation) return;
    let move = toBlockbenchPosition(values.position);
    let turn = toBlockbenchRotation(values.rotation);
    let rest = mesh.fix_rotation;
    let euler = new THREE.Euler(rest.x + turn[0] * DEGREES, rest.y + turn[1] * DEGREES, rest.z + turn[2] * DEGREES, rest.order);
    let quaternion = new THREE.Quaternion().setFromEuler(euler);
    let scale = new THREE.Vector3().fromArray(values.scale.map(value => (Math.abs(value) < 0.0001 ? 0.0001 : value)));
    let local;
    if (frame) {
        let offset = subtractVectors(group.origin, anchor);
        let position = new THREE.Vector3(offset[0] + move[0], offset[1] + move[1], offset[2] + move[2]);
        let world = new THREE.Matrix4().compose(position, quaternion, scale).premultiply(frame);
        local = new THREE.Matrix4().copy(mesh.parent.matrixWorld).invert().multiply(world);
    } else {
        let position = mesh.fix_position.clone().add(new THREE.Vector3().fromArray(move));
        local = new THREE.Matrix4().compose(position, quaternion, scale);
    }
    local.decompose(mesh.position, mesh.quaternion, mesh.scale);
    mesh.updateMatrixWorld(true);
    placedArmorMeshes.push(mesh);
}

function placeHeldModel(overlay, slot) {
    let pose = getHoldPose(slot.slotId);
    if (!pose) return;
    Project.model_3d.updateMatrixWorld(true);
    if (overlay) overlay.root.updateMatrixWorld(true);
    for (let group of Outliner.root) {
        if (!(group instanceof Group)) continue;
        let hand = getBindingHand(parseBoneBinding(group.bedrock_binding), slot);
        let held = group.uuid === pose.bone.uuid;
        let frame = hand ? getHeldFrame(overlay, slot, hand) : null;
        if (frame) {
            placeHeldGroupMesh(group, frame, held ? pose.values : HOLD_IDENTITY, BOUND_ROOT_ANCHOR);
        } else if (held) {
            placeHeldGroupMesh(group, null, pose.values, null);
        }
    }
}

function refreshHeldPreview() {
    let slot = findHoldSlot(heldPreview.slotId);
    let firstPerson = slot.view === 'first_person';
    let wearer = getHeldWearerRig();
    if (!wearer) {
        disposeArmorOverlay();
    } else {
        if (!armorOverlay || armorOverlay.key !== `held|${wearer.id}`) {
            disposeArmorOverlay();
            armorOverlay = buildHeldOverlay(wearer);
        }
        let model = Project.model_3d;
        armorOverlay.root.position.copy(model.position);
        armorOverlay.root.quaternion.copy(model.quaternion);
        armorOverlay.root.scale.copy(model.scale);
        armorOverlay.root.visible = !firstPerson;
        applyArmorXray(armorOverlay, false);
        applyWearerPose(armorOverlay, getHeldArmTurns(wearer, slot));
    }
    syncHeldCrosshair(firstPerson && heldPreview.camera === 'first');
    if (armorCompileDepth === 0 && !isArmorModelEditOpen()) placeHeldModel(armorOverlay, slot);
}

function withHeldPreview(request, fn) {
    let saved = heldPreview;
    heldPreview = request;
    try {
        refreshArmorPreview();
        return fn();
    } finally {
        heldPreview = saved;
        refreshArmorPreview();
    }
}

function getHeldHandPosition(slot) {
    if (slot.view === 'first_person') return new THREE.Vector3().setFromMatrixPosition(getFirstPersonHeldFrame(slot.hand)).toArray();
    let frame = getHeldFrame(armorOverlay, slot, slot.hand);
    if (frame) return new THREE.Vector3().setFromMatrixPosition(frame).toArray();
    let side = slot.hand === 'off_hand' ? -1 : 1;
    return [TUNED_ITEM_POSITION[0] * side, TUNED_ITEM_POSITION[1], TUNED_ITEM_POSITION[2]];
}

const HELD_FIRST_PERSON_RATIO = 16 / 9;

function getHeldCameraPlacement(slot, camera) {
    if (camera === 'first') {
        let eye = FIRST_PERSON_RIG_EYE.slice();
        return { position: eye, target: [eye[0], eye[1], eye[2] + 10], fov: FIRST_PERSON_RIG_VFOV, aspectRatio: HELD_FIRST_PERSON_RATIO };
    }
    let handId = slot.hand === 'off_hand' ? 'left' : 'right';
    let placement = computeThirdPersonCamera(camera, handId, getHeldHandPosition(slot), null);
    return placement ? Object.assign(placement, { aspectRatio: undefined }) : null;
}

function applyHeldCamera() {
    let preview = getArmorCameraPreview();
    if (!heldPreview || !preview || !isHeldPreviewShown()) return false;
    let slot = findHoldSlot(heldPreview.slotId);
    let placement = getHeldCameraPlacement(slot, heldPreview.camera);
    if (!placement) return false;
    if (!savedArmorCamera || savedArmorCamera.preview !== preview) savedArmorCamera = saveArmorCamera(preview);
    preview.loadAnglePreset({
        projection: 'perspective',
        position: placement.position,
        target: placement.target,
        fov: placement.fov,
        aspect_ratio: placement.aspectRatio
    });
    if (typeof preview.resize === 'function') preview.resize();
    armorCameraView = `held_${heldPreview.camera}`;
    return true;
}

function getHeldPreviewState() {
    return {
        shown: isHeldPreviewShown(),
        slotId: heldPreview ? heldPreview.slotId : null,
        camera: heldPreview ? heldPreview.camera : null,
        cameraShown: typeof armorCameraView === 'string' && armorCameraView.startsWith('held_'),
        wearer: heldWearerId,
        wearers: getHeldWearerChoices(),
        context: isArmorPreviewContext(),
        crosshair: !!heldCrosshair && !!heldCrosshair.parentNode
    };
}

// =========================
// Held items: crosshair
// =========================
let heldCrosshair = null;

function syncHeldCrosshair(on) {
    let preview = getArmorCameraPreview();
    let wanted = on && !!preview && !!preview.node;
    if (!wanted) {
        if (heldCrosshair) heldCrosshair.remove();
        heldCrosshair = null;
        return;
    }
    if (!heldCrosshair) {
        heldCrosshair = document.createElement('div');
        heldCrosshair.className = 'display_crosshair ds-held-crosshair';
    }
    if (heldCrosshair.parentNode !== preview.node) preview.node.append(heldCrosshair);
}

// =========================
// Keeping the preview in step
// =========================
function refreshArmorPreview() {
    restorePlacedMeshes();
    if (!isArmorPreviewContext()) activeArmorPose = null;
    if (heldPreview && isArmorPreviewContext()) {
        refreshHeldPreview();
        return;
    }
    syncHeldCrosshair(false);
    if (armorOverlay && armorOverlay.key.startsWith('held|')) disposeArmorOverlay();
    let wearer = getArmorWearerRig();
    let needed = isArmorPreviewContext() && (armorOverlayOptions.show || !!activeArmorPose || armorFitPreview);
    if (!needed || !wearer) {
        disposeArmorOverlay();
        return;
    }
    if (!armorOverlay || armorOverlay.key !== getArmorOverlayKey(wearer)) {
        disposeArmorOverlay();
        armorOverlay = buildArmorOverlay(wearer);
    }
    applyArmorOverlayOptions(armorOverlay);
    applyWearerPose(armorOverlay, activeArmorPose ? resolveArmorPose(wearer.id, activeArmorPose) : null);
    if (armorCompileDepth === 0 && !isArmorModelEditOpen()) placeArmorModel(armorOverlay);
}

function refreshArmorPreviewSafely() {
    try {
        refreshArmorPreview();
    } catch (error) {
        console.warn(LOG_PREFIX, 'The armor preview failed:', error);
    }
}

let armorRefreshTimer = null;

function scheduleArmorPreviewRefresh() {
    if (armorRefreshTimer !== null) return;
    armorRefreshTimer = setTimeout(() => {
        armorRefreshTimer = null;
        refreshArmorPreviewSafely();
        refreshPanelSafely();
    }, 0);
}

const ARMOR_MESH_KEEPING_ASPECTS = ['textures', 'layers', 'bitmap', 'selected_texture', 'texture_order', 'uv_mode', 'uv_only', 'animations', 'keyframes', PROJECT_DATA_UNDO_ASPECT];

function isMeshKeepingEdit(aspects) {
    let uvOnly = aspects.uv_only === true;
    return Object.keys(aspects).every(name => !aspects[name] || ARMOR_MESH_KEEPING_ASPECTS.includes(name) || (uvOnly && name === 'elements'));
}

let armorModelEditOpen = false;

function isArmorModelEditOpen() {
    if (armorModelEditOpen && !(typeof Undo !== 'undefined' && Undo && Undo.current_save)) armorModelEditOpen = false;
    return armorModelEditOpen;
}

function onArmorInitEdit(event) {
    let aspects = event && event.aspects ? event.aspects : {};
    if (isMeshKeepingEdit(aspects)) return;
    armorModelEditOpen = true;
    activeArmorPose = null;
    restorePlacedMeshes();
    if (armorOverlay) applyWearerPose(armorOverlay, null);
}

function wrapCancelledEdits() {
    if (typeof UndoSystem === 'undefined' || !UndoSystem.prototype || typeof UndoSystem.prototype.cancelEdit !== 'function') return { delete() {} };
    return wrapMethod(UndoSystem.prototype, 'cancelEdit', function(original, args) {
        let open = !!this.current_save;
        let result = original.apply(this, args);
        if (open) scheduleArmorPreviewRefresh();
        return result;
    });
}

function onArmorPoseStopEvent() {
    let stopped = activeArmorPose !== null;
    activeArmorPose = null;
    refreshArmorPreview();
    if (stopped) refreshPanelSafely();
}

function onArmorModeUnselected() {
    restorePlacedMeshes();
}

function onArmorProjectUnselected() {
    activeArmorPose = null;
    restorePlacedMeshes();
    disposeArmorOverlay();
    syncHeldCrosshair(false);
    restoreHeldAspectRatio();
    savedArmorCamera = null;
    armorCameraView = null;
}

function restoreHeldAspectRatio() {
    let saved = savedArmorCamera;
    if (!saved || !Preview.all.includes(saved.preview) || saved.preview.aspect_ratio === saved.aspectRatio) return;
    saved.preview.aspect_ratio = saved.aspectRatio;
    if (typeof saved.preview.resize === 'function') saved.preview.resize();
}

const ARMOR_MESH_READING_CODECS = ['bedrock', 'bedrock_old', 'obj', 'gltf', 'fbx', 'collada', 'stl'];

function wrapCodecCompileAtRest(codec) {
    return wrapMethod(codec, 'compile', function(original, args) {
        if (!placedArmorMeshes.length) return original.apply(this, args);
        armorCompileDepth++;
        restorePlacedMeshes();
        let result;
        try {
            result = original.apply(this, args);
        } catch (error) {
            finishCompileAtRest();
            throw error;
        }
        if (result && typeof result.then === 'function') {
            result.then(finishCompileAtRest, finishCompileAtRest);
        } else {
            finishCompileAtRest();
        }
        return result;
    });
}

function finishCompileAtRest() {
    armorCompileDepth = Math.max(0, armorCompileDepth - 1);
    if (armorCompileDepth === 0) refreshArmorPreviewSafely();
}

function wrapScreenshotsAtRest() {
    return wrapMethod(Canvas, 'withoutGizmos', function(original, args) {
        if (!placedArmorMeshes.length) return original.apply(this, args);
        restorePlacedMeshes();
        try {
            return original.apply(this, args);
        } finally {
            refreshArmorPreviewSafely();
        }
    });
}

function wrapThumbnailAtRest() {
    if (typeof ModelProject === 'undefined' || !ModelProject.prototype || typeof ModelProject.prototype.updateThumbnail !== 'function') return { delete() {} };
    return wrapMethod(ModelProject.prototype, 'updateThumbnail', function(original, args) {
        let preview = typeof Preview !== 'undefined' ? Preview.selected : null;
        let wearerShown = !!armorOverlay && armorOverlay.root.visible;
        if (this !== Project || !preview || (!wearerShown && !placedArmorMeshes.length)) return original.apply(this, args);
        restorePlacedMeshes();
        if (armorOverlay) armorOverlay.root.visible = false;
        try {
            preview.render();
            return original.apply(this, args);
        } finally {
            refreshArmorPreviewSafely();
        }
    });
}

// =========================
// Cameras
// =========================
const ARMOR_CAMERA_PRESETS = { front: 'north', back: 'south', right: 'east', left: 'west' };
const ARMOR_CAMERA_MARGIN = 1.6;

function getArmorCameraPreview() {
    return Preview.selected || Preview.all.find(preview => preview.id === 'main') || null;
}

function isArmorCameraElement(element) {
    return !!element.mesh && !!element.mesh.geometry && element.visibility !== false && element.export !== false;
}

function findArmorSlotElements(slot, slotId, wearer) {
    let wearerNames = new Set(Object.keys(wearer.bones).map(key => key.toLowerCase()));
    let slotNames = new Set(slot.bones.map(name => name.toLowerCase()));
    let elements = [];
    let visit = (nodes, inSlot) => {
        for (let node of nodes) {
            if (node instanceof Group) {
                let binding = parseBoneBinding(node.bedrock_binding);
                let target = String((binding.kind === 'none' ? node.name : getBindingTarget(binding, slotId)) || '').toLowerCase();
                visit(node.children || [], wearerNames.has(target) ? slotNames.has(target) : inSlot);
            } else if (inSlot && isArmorCameraElement(node)) {
                elements.push(node);
            }
        }
    };
    visit(Outliner.root, false);
    return elements;
}

function getArmorModelBox(elements) {
    Project.model_3d.updateMatrixWorld(true);
    let box = new THREE.Box3();
    for (let element of elements) {
        if (!isArmorCameraElement(element)) continue;
        element.mesh.geometry.computeBoundingBox();
        box.union(element.mesh.geometry.boundingBox.clone().applyMatrix4(element.mesh.matrixWorld));
    }
    return box.isEmpty() ? null : { min: box.min.toArray(), max: box.max.toArray() };
}

function getArmorCameraBox(wearer) {
    let slotId = getArmorPreviewSlotId();
    let slot = findWearSlot(slotId);
    let keys = Object.keys(wearer.bones);
    let wanted = slot ? keys.filter(key => slot.bones.some(name => name.toLowerCase() === key.toLowerCase())) : [];
    let boxes = [];
    for (let key of wanted.length ? wanted : keys) {
        for (let cube of wearer.bones[key].cubes || []) {
            let min = [-(cube.origin[0] + cube.size[0]), cube.origin[1], cube.origin[2]];
            let max = [-cube.origin[0], cube.origin[1] + cube.size[1], cube.origin[2] + cube.size[2]];
            boxes.push({ min, max });
        }
    }
    if (Project && Project.model_3d) {
        let elements = slot ? findArmorSlotElements(slot, slotId, wearer) : [];
        let model = getArmorModelBox(elements.length ? elements : Outliner.elements);
        if (model) boxes.push(model);
    }
    return boxes.length ? mergeBoxes(boxes) : { min: [-8, 0, -8], max: [8, 32, 8] };
}

function getArmorCameraFrame(preview, view, box) {
    let centre = box.min.map((value, axis) => (value + box.max[axis]) / 2);
    let height = box.max[1] - box.min[1];
    let across = (view === 'front' || view === 'back') ? box.max[0] - box.min[0] : box.max[2] - box.min[2];
    let ratio = preview.width > 0 && preview.height > 0 ? preview.height / preview.width : 1;
    let needed = Math.max(height, across * ratio, 1) * ARMOR_CAMERA_MARGIN;
    let zoom = preview.height > 0 ? (preview.height / 40) / needed : 0.5;
    return { centre, zoom };
}

function saveArmorCamera(preview) {
    return {
        preview,
        orthographic: preview.isOrtho,
        position: preview.camera.position.toArray(),
        target: preview.controls.target.toArray(),
        sideTarget: preview.side_view_target.toArray(),
        zoom: preview.camOrtho.zoom,
        fov: preview.camPers.fov,
        angle: preview.angle,
        aspectRatio: preview.aspect_ratio
    };
}

function applyArmorCamera(view) {
    let presetId = ARMOR_CAMERA_PRESETS[view];
    let preset = presetId ? DefaultCameraPresets.find(entry => entry.id === presetId) : null;
    let preview = getArmorCameraPreview();
    let wearer = getArmorWearerRig();
    if (!preset || !preview || !wearer || !Project || getRoute() !== 'attachable') return false;
    if (!savedArmorCamera || savedArmorCamera.preview !== preview) savedArmorCamera = saveArmorCamera(preview);
    let frame = getArmorCameraFrame(preview, view, getArmorCameraBox(wearer));
    preview.side_view_target.fromArray(frame.centre);
    preview.loadAnglePreset({
        projection: 'orthographic',
        position: preset.position.slice(),
        target: frame.centre,
        zoom: preset.zoom,
        locked_angle: preset.locked_angle
    });
    preview.camOrtho.zoom = frame.zoom;
    preview.camOrtho.updateProjectionMatrix();
    preview.controls.update();
    armorCameraView = view;
    return true;
}

function restoreArmorCamera() {
    let saved = savedArmorCamera;
    savedArmorCamera = null;
    armorCameraView = null;
    if (!saved || !Preview.all.includes(saved.preview)) return false;
    let preview = saved.preview;
    if (preview.aspect_ratio !== saved.aspectRatio) {
        preview.aspect_ratio = saved.aspectRatio;
        if (typeof preview.resize === 'function') preview.resize();
    }
    preview.setProjectionMode(saved.orthographic);
    preview.camera.position.fromArray(saved.position);
    preview.controls.target.fromArray(saved.target);
    preview.side_view_target.fromArray(saved.sideTarget);
    if (saved.orthographic) {
        preview.camOrtho.zoom = saved.zoom;
        preview.camOrtho.updateProjectionMatrix();
    } else {
        preview.setFOV(saved.fov);
    }
    preview.setLockedAngle(saved.angle || undefined);
    preview.controls.update();
    return true;
}

// =========================
// State for the panel
// =========================
function getArmorPreviewState() {
    let wearer = getArmorWearerRig();
    let context = isArmorPreviewContext();
    return {
        slot: Project ? getArmorPreviewSlotId() : null,
        shown: context && !!armorOverlay && armorOverlay.root.visible,
        wearer: armorWearerId,
        textured: !!(wearer && wearer.texture),
        options: getOverlayOptions(),
        pose: activeArmorPose,
        canPose: context && !!Modes.edit,
        fitPreview: armorFitPreview,
        camera: armorCameraView,
        textures: Project ? Texture.all.map(texture => ({ uuid: texture.uuid, name: texture.name })) : [],
        missing: wearer && Array.isArray(wearer.missing) ? wearer.missing.slice() : []
    };
}

// =========================
// Install
// =========================
function installArmorPreview() {
    let codecHooks = ARMOR_MESH_READING_CODECS
        .filter(id => Codecs[id] && typeof Codecs[id].compile === 'function')
        .map(id => () => wrapCodecCompileAtRest(Codecs[id]));
    let hooks = createDeletables(codecHooks.concat([
        wrapScreenshotsAtRest,
        wrapThumbnailAtRest,
        wrapCancelledEdits,
        () => Blockbench.on('init_edit', guardListener('init_edit', onArmorInitEdit)),
        () => Blockbench.on('finished_edit', guardListener('finished_edit', refreshArmorPreview)),
        () => Blockbench.on('load_undo_save', guardListener('load_undo_save', scheduleArmorPreviewRefresh)),
        () => Blockbench.on('undo', guardListener('undo', onArmorPoseStopEvent)),
        () => Blockbench.on('redo', guardListener('redo', onArmorPoseStopEvent)),
        () => Blockbench.on('unselect_mode', guardListener('unselect_mode', onArmorModeUnselected)),
        () => Blockbench.on('select_mode', guardListener('select_mode', onArmorPoseStopEvent)),
        () => Blockbench.on('unselect_project', guardListener('unselect_project', onArmorProjectUnselected)),
        () => Blockbench.on('select_project', guardListener('select_project', refreshArmorPreview))
    ]));
    return {
        delete() {
            hooks.delete();
            if (armorRefreshTimer !== null) clearTimeout(armorRefreshTimer);
            armorRefreshTimer = null;
            armorModelEditOpen = false;
            restorePlacedMeshes();
            disposeArmorOverlay();
            syncHeldCrosshair(false);
            if (armorCameraView && armorCameraView.startsWith('held_')) restoreArmorCamera();
            heldPreview = null;
            heldWearerId = DEFAULT_WEARER_ID;
            armorWearerId = DEFAULT_WEARER_ID;
            armorOverlayOptions = Object.assign({}, ARMOR_OVERLAY_DEFAULTS);
            armorPreviewSlot = null;
            activeArmorPose = null;
            armorFitPreview = false;
            armorCompileDepth = 0;
            savedArmorCamera = null;
            armorCameraView = null;
        }
    };
}

registerModuleInstaller('armor_preview', installArmorPreview);
