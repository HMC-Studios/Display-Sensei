// =========================
// Bedrock reference models (block route)
// =========================

// =========================
// Bedrock values in Blockbench's space
// =========================
const DEGREES = Math.PI / 180;

function toBlockbenchPosition(position) {
    return [-position[0], position[1], position[2]];
}

function toBlockbenchRotation(rotation) {
    return [-rotation[0], -rotation[1], rotation[2]];
}

const HOLD_OFFSET = [0, -3, -3];
const HOLD_TURN_X = -90;

const LEFT_HAND_PIVOT_MIRROR = false;

const PLAYER_ENTITY_SCALE = 0.9375;

const HEAD_CENTRE_OFFSET = 4;
const HEAD_BASE_SCALE = 0.625;

const THIRD_PERSON_SLOTS = ['thirdperson_righthand', 'thirdperson_lefthand'];
const HOLDER_SLOTS = ['thirdperson_righthand', 'thirdperson_lefthand', 'head'];

// =========================
// Vanilla numbers: third person and head
// =========================
const THIRD_PERSON_RIGS = {
    player_wide: {
        right: { shoulder: [-5, 22, 0], itemBone: [-6, 15, 1] },
        left: { shoulder: [5, 22, 0], itemBone: [6, 15, 1] }
    },
    player_slim: {
        right: { shoulder: [-5, 21.5, 0], itemBone: [-6, 14.5, 1] },
        left: { shoulder: [5, 21.5, 0], itemBone: [6, 14.5, 1] }
    },
    zombie: {
        right: { shoulder: [-5, 22, 0], itemBone: [-6, 15, 1] },
        left: { shoulder: [5, 22, 0], itemBone: [6, 15, 1] }
    },
    baby_zombie: {
        right: { shoulder: [-3, 8.5, 0], itemBone: [-3, 6.5, 0] },
        left: { shoulder: [3, 8.5, 0], itemBone: [3, 6.5, 0] }
    },
    armor_stand: {
        right: { shoulder: [-5, 22, 0], itemBone: [-6, 15, 1] },
        left: { shoulder: [5, 22, 0], itemBone: [6, 15, 1] }
    }
};

const HEAD_RIGS = {
    player: { headPivot: [0, 24, 0] },
    zombie: { headPivot: [0, 24, 0] },
    baby_zombie: { headPivot: [0, 8.75, 0], centreOffset: 3.25, baseScale: HEAD_BASE_SCALE * 0.75 },
    armor_stand: { headPivot: [0, 24, 0] }
};

const PLAYER_HOLD_ANGLE = 18;

const HEAD_PITCH_RANGE = [-90, 90];
const ARM_ANGLE_RANGE = [-180, 180];

const SNEAK_PARENTS = [
    { pivot: [0, 0, 0], pos: [0, 1.25, 9], rot: [28, 0, 0] },
    { pivot: [0, 24, 0], pos: [0, -2, 0] }
];
const SNEAK_LEG_TURN = -28;
const SNEAK_HEAD_DROP = -1;
const SNEAK_OTHER_ARM = -5.7;

const ARM_POSES = [
    { id: 'holding', labelKey: 'display_sensei.arm_pose.holding', arm: null, leftHand: true },
    { id: 'sneaking', labelKey: 'display_sensei.arm_pose.sneaking', arm: [-23.7, 0, 0], parents: SNEAK_PARENTS, leftHand: true },
    { id: 'eating', labelKey: 'display_sensei.arm_pose.eating', arm: [-78, -22.5, -5.625] },
    { id: 'eating_bite', labelKey: 'display_sensei.arm_pose.eating_bite', arm: [-66.75, -11.25, 5.625] },
    { id: 'brushing', labelKey: 'display_sensei.arm_pose.brushing', arm: [-68, 0, 5] },
    { id: 'spyglass', labelKey: 'display_sensei.arm_pose.spyglass', arm: [-123, -15, 5] },
    { id: 'goat_horn', labelKey: 'display_sensei.arm_pose.goat_horn', arm: [-93, -30, 5], itemAnim: { pos: [4, 0, 1], rot: [15, 0, 100] } },
    { id: 'spear_raise', labelKey: 'display_sensei.arm_pose.spear_raise', arm: [-152.5, 0, 0] },
    { id: 'bow_aim', labelKey: 'display_sensei.arm_pose.bow_aim', arm: [-90, -5, 0], itemAnim: { rot: [0, -10, 0] } },
    { id: 'crossbow_load', labelKey: 'display_sensei.arm_pose.crossbow_load', arm: [-60, -45, -2.5] },
    { id: 'crossbow_hold', labelKey: 'display_sensei.arm_pose.crossbow_hold', arm: [-93, 0, 0] },
    { id: 'shield_block', labelKey: 'display_sensei.arm_pose.shield_block', arm: [-38, -30, -25], itemAnim: { pos: [-1, -3, 0], rot: [0, -60, -45] } }
];

const ZOMBIE_ARMS = { right: [-90, -5.73, 0], left: [-90, 5.73, 0] };
const BABY_ZOMBIE_ARMS = { right: [0, -5.73, 0], left: [0, 5.73, 0] };
const ZOMBIE_HOLDING_LEFT_ARMS = { right: [0, 0, 0], left: [-18, 0, 0] };

function getZombieArms(kind, slotId) {
    if (slotId === 'thirdperson_lefthand') return ZOMBIE_HOLDING_LEFT_ARMS;
    if (kind === 'baby_zombie' && slotId === 'thirdperson_righthand') return BABY_ZOMBIE_ARMS;
    return ZOMBIE_ARMS;
}

const STAND_POSES = [
    { id: 'default', labelKey: 'display_sensei.stand_pose.default', line: 108, body: [0, 0, 0], head: [0, 0, 0], rightarm: [-15, 0, 10], leftarm: [-10, 0, -10], rightleg: [1, 0, 1], leftleg: [-1, 0, -1] },
    { id: 'none', labelKey: 'display_sensei.stand_pose.none', line: 212, body: [0, 0, 0], head: [0, 0, 0], rightarm: [0, 0.01, 0.01], leftarm: [0, 0, 0], rightleg: [0, 0, 0], leftleg: [0, -0.1, -0.01] },
    { id: 'solemn', labelKey: 'display_sensei.stand_pose.solemn', line: 290, body: [0, 0, 2], head: [15, 0, 0], rightarm: [-60, -20, -10], leftarm: [-30, 15, 15], rightleg: [1, 0, 1], leftleg: [-1, 0, -1] },
    { id: 'athena', labelKey: 'display_sensei.stand_pose.athena', line: 4, body: [0, 0, 2], head: [-5, 0, 0], rightarm: [-60, 20, -10], leftarm: [10, 0, -5], rightleg: [3, 3, 3], leftleg: [-3, -3, -3] },
    { id: 'brandish', labelKey: 'display_sensei.stand_pose.brandish', line: 30, body: [0, 0, -2], head: [-15, 0, 0], rightarm: [-110, 50, 0], leftarm: [20, 0, -10], rightleg: [-5, 3, 3], leftleg: [5, -3, -3] },
    { id: 'honor', labelKey: 'display_sensei.stand_pose.honor', line: 186, body: [0, 0, 0], head: [-15, 0, 0], rightarm: [-110, -35, 0], leftarm: [-110, 35, 0], rightleg: [-5, 3, 3], leftleg: [5, -3, -3] },
    { id: 'entertain', labelKey: 'display_sensei.stand_pose.entertain', line: 134, body: [0, 0, 0], head: [-15, 0, 0], rightarm: [-110, 35, 0], leftarm: [-110, -35, 0], rightleg: [-5, 3, 3], leftleg: [5, -3, -3] },
    { id: 'salute', labelKey: 'display_sensei.stand_pose.salute', line: 264, body: [0, 0, 0], head: [0, 0, 0], rightarm: [-70, -40, 0], leftarm: [10, 0, -5], rightleg: [1, 0, 1], leftleg: [-1, 0, -1] },
    { id: 'riposte', labelKey: 'display_sensei.stand_pose.riposte', line: 238, body: [0, 0, 0], head: [16, 20, 0], rightarm: [246, 0, 89], leftarm: [4, 8, 237], rightleg: [8, 20, 4], leftleg: [-14, -18, -16], rightItem: [0, 180, 0] },
    { id: 'zombie', labelKey: 'display_sensei.stand_pose.zombie', line: 324, body: [0, 0, 0], head: [-10, 0, -5], rightarm: [-100, 0, 0], leftarm: [-105, 0, 0], rightleg: [-46, 0, 0], leftleg: [7, 0, 0] },
    { id: 'cancan_a', labelKey: 'display_sensei.stand_pose.cancan_a', line: 56, body: [0, 22, 0], head: [-5, 18, 0], rightarm: [0, 84, 111], leftarm: [8, 0, -114], rightleg: [0, 23, -13], leftleg: [-111, 55, 0] },
    { id: 'cancan_b', labelKey: 'display_sensei.stand_pose.cancan_b', line: 82, body: [0, -18, 0], head: [-10, -20, 0], rightarm: [8, 90, 111], leftarm: [0, 0, -112], rightleg: [-119, -42, 0], leftleg: [0, 0, 13] },
    { id: 'hero', labelKey: 'display_sensei.stand_pose.hero', line: 160, body: [0, 8, 0], head: [-4, 67, 0], rightarm: [-99, 63, 0], leftarm: [16, 32, -8], rightleg: [4, 63, 8], leftleg: [0, -75, -8] }
];
const STAND_DEFAULT_POSE = 0;
const STAND_POSED_START = 1;
const STAND_BODY_PIVOT = [0, 24, 0];

// =========================
// Vanilla numbers: first person
// =========================
const FIRST_PERSON_RIG = {
    shoulder: [-5, 22, 0],
    itemBone: [-6, 15, 1],
    armPos: [13.5, -10, 12],
    armRot: [95, -45, 115],
    itemPos: [0, 0, -1]
};

const FIRST_PERSON_RIG_VFOV = 70.25;
const DISPLAY_MODE_FIRST_PERSON_VFOV = 2 * Math.atan(0.5 * 35 / 18) / DEGREES;
const FIRST_PERSON_FOV_RATIO = Math.tan(FIRST_PERSON_RIG_VFOV / 2 * DEGREES) / Math.tan(DISPLAY_MODE_FIRST_PERSON_VFOV / 2 * DEGREES);

const BOW_WIELD = { pos: [-5.5, -3, -3], rot: [38, -120, -63] };
const BOW_PULL = { pos: [-1.5, 2.5, -4.8], rot: [-53, 8, 35] };

const FIRST_PERSON_RIG_EYE = [0, 27.41, 0];
const DISPLAY_MODE_FIRST_PERSON_CAMERA = [0, 24, 32.4];

const FIRST_PERSON_POSES = {
    hold: { used: {} },
    bow: { idle: { itemAnim: BOW_WIELD }, used: { itemAnim: { pos: addVectors(BOW_WIELD.pos, BOW_PULL.pos), rot: addVectors(BOW_WIELD.rot, BOW_PULL.rot) } } },
    crossbow: { used: { itemPos: [0, 2, 2.5], itemRot: [-20, -15, -30] } },
    spear: { used: { itemPos: addVectors(FIRST_PERSON_RIG.itemPos, [-1.5, 2, 3.5]), itemRot: [45, 55, -12.5] } },
    eat: { fromThirdPersonPose: 'eating', calibrated: false }
};

// =========================
// Vanilla numbers: world references
// =========================
const FRAME_ROTATION_STEP = 45;
const FRAME_ROTATION_STEPS = 8;
const FRAME_SCALE = 0.5;
const BLOCK_SIZE = 16;
const GLOW_FRAME_TINT = 'rgba(64, 224, 208, 0.55)';
const FALLBACK_FRAME_TEXTURE = 'assets/item_frame.png';
const CEILING_FRAME_CAMERA = { position: [-22, -8, -30], target: [8, 12, 8] };

const FOX_HELD_ITEM = [-2, 3.3, -13];
const FOX_HEAD_CENTRE = [0, 7, -6];
const BLOCKBENCH_FOX_HEAD_CENTRE = [0, 4, 0];

const POT_SOIL_Y = 4;

const SHELF_ITEM_Y = 8;
const SHELF_SCALE = FRAME_SCALE;
const SHELF_COPY_OFFSET = 5 / SHELF_SCALE;

const GROUND_SPIN_PER_SECOND = 1;
const GROUND_BOB_PER_SECOND = 2;
const GROUND_LIFT = 3.8;
const GROUND_BOB_AMPLITUDE = Math.PI / 2;
const GROUND_MAX_STEP_SECONDS = 0.25;

// =========================
// Vanilla numbers: GUI
// =========================
const GUI_AREA_SCALE = 0.4;
const GUI_ITEM_SIZE = 16;
const REFERENCE_IMAGE_UNITS_PER_PIXEL = 8;
const OVERLAY_DRAW_SCALE = 4;
const GUI_COLOURS = {
    slot: '#8B8B8B',
    shadow: '#373737',
    highlight: '#FFFFFF',
    panel: '#C6C6C6',
    outline: '#000000',
    hotbar: 'rgba(24, 24, 24, 0.72)',
    hotbarSlot: '#8B8B8B',
    selection: '#FFFFFF'
};
const GUI_SLOT_SIZE = 18;
const HOTBAR_SLOTS = 9;
const HOTBAR_PITCH = 20;
const HOTBAR_HEIGHT = 22;
const HOTBAR_SELECTION = 24;
const HOTBAR_SELECTED_SLOT = 4;
const INVENTORY_BORDER = 7;
const INVENTORY_GAP = 4;

// =========================
// Small helpers
// =========================
function addVectors(a, b) {
    return a.map((value, index) => value + b[index]);
}

// =========================
// Composer (matrices with THREE)
// =========================
function translationMatrix(vector) {
    return new THREE.Matrix4().makeTranslation(vector[0], vector[1], vector[2]);
}

function scaleMatrix(scale) {
    return new THREE.Matrix4().makeScale(scale, scale, scale);
}

function rotationMatrix(degrees, order) {
    let euler = new THREE.Euler(degrees[0] * DEGREES, degrees[1] * DEGREES, degrees[2] * DEGREES, order);
    return new THREE.Matrix4().makeRotationFromEuler(euler);
}

function chainMatrices(matrices) {
    let result = new THREE.Matrix4();
    for (let matrix of matrices) result.multiply(matrix);
    return result;
}

function boneMatrix({ pivot = [0, 0, 0], pos = [0, 0, 0], rot = [0, 0, 0] }) {
    let p = toBlockbenchPosition(pivot);
    return chainMatrices([
        translationMatrix(toBlockbenchPosition(pos)),
        translationMatrix(p),
        rotationMatrix(toBlockbenchRotation(rot), 'ZYX'),
        translationMatrix([-p[0], -p[1], -p[2]])
    ]);
}

function composeHeldItemFrame({ shoulder, itemBone, armRot, parents = [], itemAnim = null, entityScale = 1 }) {
    let s = toBlockbenchPosition(shoulder);
    let i = toBlockbenchPosition(itemBone);
    let matrices = [scaleMatrix(entityScale)].concat(parents.map(boneMatrix), [
        translationMatrix(s),
        rotationMatrix(toBlockbenchRotation(armRot), 'ZYX'),
        translationMatrix([i[0] - s[0], i[1] - s[1], i[2] - s[2]])
    ]);
    if (itemAnim) {
        matrices.push(translationMatrix(toBlockbenchPosition(itemAnim.pos || [0, 0, 0])));
        matrices.push(rotationMatrix(toBlockbenchRotation(itemAnim.rot || [0, 0, 0]), 'ZYX'));
    }
    matrices.push(translationMatrix(HOLD_OFFSET), rotationMatrix([HOLD_TURN_X, 0, 0], 'XYZ'));
    return chainMatrices(matrices);
}

function composeHeadFrame({ headPivot, centreOffset = HEAD_CENTRE_OFFSET, headRot = [0, 0, 0], parents = [], baseScale = HEAD_BASE_SCALE, entityScale = 1 }) {
    return chainMatrices([scaleMatrix(entityScale)].concat(parents.map(boneMatrix), [
        translationMatrix(toBlockbenchPosition(headPivot)),
        rotationMatrix(toBlockbenchRotation(headRot), 'ZYX'),
        translationMatrix([0, centreOffset, 0]),
        scaleMatrix(baseScale)
    ]));
}

function composeFirstPersonFrame({ armRot = FIRST_PERSON_RIG.armRot, itemPos = FIRST_PERSON_RIG.itemPos, itemRot = [0, 0, 0], itemAnim = null } = {}) {
    let s = toBlockbenchPosition(FIRST_PERSON_RIG.shoulder);
    let i = toBlockbenchPosition(FIRST_PERSON_RIG.itemBone);
    let matrices = [
        translationMatrix(s),
        translationMatrix(toBlockbenchPosition(FIRST_PERSON_RIG.armPos)),
        rotationMatrix(toBlockbenchRotation(armRot), 'ZYX'),
        translationMatrix([i[0] - s[0], i[1] - s[1], i[2] - s[2]]),
        translationMatrix(toBlockbenchPosition(itemPos)),
        rotationMatrix(toBlockbenchRotation(itemRot), 'ZYX')
    ];
    if (itemAnim) {
        matrices.push(translationMatrix(toBlockbenchPosition(itemAnim.pos)));
        matrices.push(rotationMatrix(toBlockbenchRotation(itemAnim.rot), 'ZYX'));
    }
    return chainMatrices(matrices);
}

function composeFirstPersonDelta(usedFrame, idleFrame, anchor) {
    let turn = new THREE.Matrix4().makeRotationY(Math.PI);
    let turnBack = turn.clone().invert();
    let change = usedFrame.clone().multiply(idleFrame.clone().invert());
    let rotation = turn.clone().multiply(change).multiply(turnBack);
    rotation.setPosition(0, 0, 0);
    let from = new THREE.Vector3().setFromMatrixPosition(idleFrame);
    let to = new THREE.Vector3().setFromMatrixPosition(usedFrame);
    let moved = to.sub(from).applyMatrix4(turn);
    let position = new THREE.Vector3().fromArray(anchor).addScaledVector(moved, FIRST_PERSON_FOV_RATIO);
    return translationMatrix(position.toArray()).multiply(rotation);
}

function composeFirstPersonFromThirdPerson(poseId) {
    let pose = ARM_POSES.find(entry => entry.id === poseId);
    let rig = THIRD_PERSON_RIGS.player_wide.right;
    let hold = composeHeldItemFrame(Object.assign({}, rig, { armRot: [-PLAYER_HOLD_ANGLE, 0, 0] }));
    let used = composeHeldItemFrame(Object.assign({}, rig, { armRot: pose.arm, itemAnim: pose.itemAnim || null }));
    let fromEyes = new THREE.Vector3().setFromMatrixPosition(used).sub(new THREE.Vector3().fromArray(FIRST_PERSON_RIG_EYE));
    let position = new THREE.Vector3().fromArray(DISPLAY_MODE_FIRST_PERSON_CAMERA).addScaledVector(fromEyes, FIRST_PERSON_FOV_RATIO);
    let turn = new THREE.Matrix4().extractRotation(used).multiply(new THREE.Matrix4().extractRotation(hold).invert());
    return translationMatrix(position.toArray()).multiply(turn);
}

function toSetBaseArgs(matrix) {
    let position = new THREE.Vector3();
    let quaternion = new THREE.Quaternion();
    let scale = new THREE.Vector3();
    matrix.decompose(position, quaternion, scale);
    let euler = new THREE.Euler().setFromQuaternion(quaternion, 'XYZ');
    return [position.x, position.y, position.z, euler.x / DEGREES, euler.y / DEGREES, euler.z / DEGREES, scale.x, scale.y, scale.z];
}

function mirrorSetBaseArgs(args) {
    let mirrored = args.slice();
    mirrored[0] = -mirrored[0];
    mirrored[4] = -mirrored[4];
    mirrored[5] = -mirrored[5];
    return mirrored;
}

// =========================
// Blockbench's own anchors (read at runtime)
// =========================
function readBlockbenchPlacement(referenceId, slotId) {
    let reference = displayReferenceObjects.refmodels[referenceId];
    let area = DisplayMode.display_area;
    if (!reference || typeof reference.updateBasePosition !== 'function' || !area) return null;
    let saved = { position: area.position.clone(), rotation: area.rotation.clone(), scale: area.scale.clone() };
    try {
        withTemporaryValue(DisplayMode, 'display_slot', slotId, () => reference.updateBasePosition());
        return [
            area.position.x, area.position.y, area.position.z,
            area.rotation.x / DEGREES, area.rotation.y / DEGREES, area.rotation.z / DEGREES,
            area.scale.x, area.scale.y, area.scale.z
        ];
    } catch (error) {
        console.warn(LOG_PREFIX, `Could not read Blockbench's ${referenceId} placement:`, error);
        return null;
    } finally {
        area.position.copy(saved.position);
        area.rotation.copy(saved.rotation);
        area.scale.copy(saved.scale);
        area.updateMatrixWorld();
    }
}

const FALLBACK_ANCHORS = {
    monitor: [9.039, 15.682, 20.8, 0, 0, 0, 1, 1, 1],
    frame: [8, 8, -1, 0, 0, 0, 0.5, 0.5, 0.5],
    frame_top: [8, 1, 8, 90, 0, 0, 0.5, 0.5, 0.5],
    fox: [0, 0, -6, 90, 180, 0, 1, 1, 1],
    shelf_left: [13, 7.75, 12, 0, 180, 0, 0.25, 0.25, 0.25],
    shelf_center: [8, 7.75, 12, 0, 180, 0, 0.25, 0.25, 0.25],
    shelf_right: [3, 7.75, 12, 0, 180, 0, 0.25, 0.25, 0.25]
};

function readAnchor(referenceId, slotId) {
    return readBlockbenchPlacement(referenceId, slotId) || FALLBACK_ANCHORS[referenceId].slice();
}

// =========================
// Placements
// =========================
function getArmPose(slotId) {
    let id = previewOptions.armPose[slotId] || 'holding';
    return ARM_POSES.find(pose => pose.id === id) || ARM_POSES[0];
}

function getStandPose(index) {
    return STAND_POSES[index] || STAND_POSES[STAND_DEFAULT_POSE];
}

function getPoseAngleValue(reference, slotId) {
    let spec = getPoseSpec(reference, slotId);
    let stored = reference.pose_angles[slotId];
    let angle = Number.isFinite(stored) ? stored : (spec ? spec.start : 0);
    return spec ? clampToRange(angle, [spec.min, spec.max]) : angle;
}

function placePlayer(reference, slotId) {
    let rigs = THIRD_PERSON_RIGS[reference.variant === 'alex' ? 'player_slim' : 'player_wide'];
    let meshPose = { rightArm: [0, 0, 0], leftArm: [0, 0, 0], head: [0, 0, 0], sneaking: false };
    let args = null;
    if (slotId === 'head') {
        let angle = getPoseAngleValue(reference, slotId);
        let headRot = [-angle, 0, 0];
        args = toSetBaseArgs(composeHeadFrame(Object.assign({}, HEAD_RIGS.player, { headRot, entityScale: PLAYER_ENTITY_SCALE })));
        meshPose.head = toBlockbenchRotation(headRot);
    } else if (THIRD_PERSON_SLOTS.includes(slotId)) {
        let left = isLeftHandSlot(slotId);
        let pose = getArmPose(slotId);
        let armRot = pose.arm ? pose.arm : [-getPoseAngleValue(reference, slotId), 0, 0];
        let frame = composeHeldItemFrame(Object.assign({}, left ? rigs.left : rigs.right, {
            armRot,
            parents: pose.parents || [],
            itemAnim: pose.itemAnim || null,
            entityScale: PLAYER_ENTITY_SCALE
        }));
        args = toSetBaseArgs(frame);
        meshPose.sneaking = pose.id === 'sneaking';
        let otherArm = meshPose.sneaking ? [SNEAK_OTHER_ARM, 0, 0] : [0, 0, 0];
        meshPose[left ? 'leftArm' : 'rightArm'] = toBlockbenchRotation(armRot);
        meshPose[left ? 'rightArm' : 'leftArm'] = toBlockbenchRotation(otherArm);
    }
    return { args, meshPose };
}

function placeZombie(rigId, headRig) {
    return function(reference, slotId) {
        if (slotId === 'head') {
            return { args: toSetBaseArgs(composeHeadFrame(headRig)) };
        }
        if (!THIRD_PERSON_SLOTS.includes(slotId)) return { args: null };
        let side = isLeftHandSlot(slotId) ? 'left' : 'right';
        let arms = getZombieArms(reference.ds_definition.kind, slotId);
        let frame = composeHeldItemFrame(Object.assign({}, THIRD_PERSON_RIGS[rigId][side], { armRot: arms[side] }));
        return { args: toSetBaseArgs(frame) };
    };
}

function placeArmorStand(reference, slotId) {
    let pose = getStandPose(reference.ds_definition.kind === 'armor_stand_posed' ? previewOptions.standPose : STAND_DEFAULT_POSE);
    let parents = [{ pivot: STAND_BODY_PIVOT, rot: pose.body }];
    let args = null;
    if (slotId === 'head') {
        args = toSetBaseArgs(composeHeadFrame(Object.assign({}, HEAD_RIGS.armor_stand, { headRot: pose.head, parents })));
    } else if (THIRD_PERSON_SLOTS.includes(slotId)) {
        let left = isLeftHandSlot(slotId);
        let rig = THIRD_PERSON_RIGS.armor_stand[left ? 'left' : 'right'];
        let itemAnim = !left && pose.rightItem ? { rot: pose.rightItem } : null;
        args = toSetBaseArgs(composeHeldItemFrame(Object.assign({}, rig, { armRot: left ? pose.leftarm : pose.rightarm, parents, itemAnim })));
    }
    return { args, meshPose: { standPose: pose } };
}

function placeFirstPerson(poseId) {
    return function(reference, slotId) {
        let pose = FIRST_PERSON_POSES[poseId];
        let args;
        if (pose.setBase) {
            args = pose.setBase.slice();
        } else if (pose.fromThirdPersonPose) {
            args = toSetBaseArgs(composeFirstPersonFromThirdPerson(pose.fromThirdPersonPose));
        } else {
            let anchor = readAnchor('monitor', 'firstperson_righthand').slice(0, 3);
            let idle = composeFirstPersonFrame(pose.idle || {});
            let used = composeFirstPersonFrame(pose.used || {});
            args = toSetBaseArgs(composeFirstPersonDelta(used, idle, anchor));
        }
        return { args: isLeftHandSlot(slotId) ? mirrorSetBaseArgs(args) : args };
    };
}

function getFrameRotation() {
    return previewOptions.frameStep * FRAME_ROTATION_STEP;
}

function placeFrame(where) {
    return function() {
        let args;
        if (where === 'wall') {
            args = readAnchor('frame', 'fixed');
        } else {
            args = readAnchor('frame_top', 'fixed');
            if (where === 'ceiling') {
                args[1] = BLOCK_SIZE - args[1];
                args[3] = -args[3];
            }
        }
        args[5] = getFrameRotation();
        args[6] = args[7] = args[8] = FRAME_SCALE;
        return { args };
    };
}

function placeFox() {
    let anchor = readAnchor('fox', 'ground');
    let position = toBlockbenchPosition(FOX_HELD_ITEM).map((value, axis) => value - FOX_HEAD_CENTRE[axis] + BLOCKBENCH_FOX_HEAD_CENTRE[axis]);
    return { args: position.concat(anchor.slice(3, 6), [1, 1, 1]) };
}

function placeFlowerPot() {
    let defaults = DisplayMode.bedrock_defaults && DisplayMode.bedrock_defaults.embedded;
    let scale = defaults ? defaults.scale[1] : 0.75;
    return { args: [0, POT_SOIL_Y + BLOCK_SIZE * scale / 2, 0, 0, 0, 0, 1, 1, 1] };
}

function placeShelf(blockbenchId) {
    return function() {
        let anchor = readAnchor(blockbenchId, 'on_shelf');
        return { args: [anchor[0], SHELF_ITEM_Y, anchor[2], 0, 0, 0, SHELF_SCALE, SHELF_SCALE, SHELF_SCALE] };
    };
}

function placeGui() {
    return { args: null };
}

// =========================
// Geometry
// =========================
function cloneBlockbenchModels(referenceId) {
    let reference = displayReferenceObjects.refmodels[referenceId];
    return reference && Array.isArray(reference.models) ? cloneJson(reference.models) : [];
}

function buildPlayerModels() {
    let models = cloneBlockbenchModels('player');
    for (let model of models) {
        model.texture = 'black';
        for (let element of model.elements || []) {
            let part = classifyPlayerElement(element);
            if (!element.name) element.name = part;
            if (part === 'right_arm' || part === 'left_arm') {
                let side = part === 'right_arm' ? 1 : -1;
                element.origin = [5 * side, element.model === 'alex' ? 21.5 : 22, 0];
                element.rotation = [0, 0, 0];
            }
        }
    }
    return models;
}

const PLAYER_PART_NAMES = ['body', 'right_leg', 'left_leg'];

function classifyPlayerElement(element) {
    let name = element.name || '';
    if (PLAYER_PART_NAMES.includes(name)) return name;
    if (name.startsWith('right_arm')) return 'right_arm';
    if (name.startsWith('left_arm')) return 'left_arm';
    if (name.startsWith('head')) return 'head';
    if (element.pos && element.pos[1] < 12) return element.pos[0] > 0 ? 'right_leg' : 'left_leg';
    return 'body';
}

function buildZombieModels() {
    let models = cloneBlockbenchModels('zombie');
    for (let model of models) {
        for (let element of model.elements || []) {
            let isArm = element.size && element.size[0] === 12 && element.pos && Math.abs(element.pos[2]) > 4;
            if (!isArm) continue;
            let right = element.pos[2] < 0;
            element.name = right ? 'right_arm' : 'left_arm';
            element.origin = [0, 16, right ? -5 : 5];
            element.rotation = [0, 0, 0];
        }
    }
    return models;
}

const STAND_HEAD_STICK_INDEX = 5;
const STAND_HEAD_STICK_Y = 27.5;

function buildArmorStandModels() {
    let models = cloneBlockbenchModels('armor_stand');
    let elements = models[0] && models[0].elements;
    if (elements && elements[STAND_HEAD_STICK_INDEX]) {
        elements[STAND_HEAD_STICK_INDEX].pos[1] = STAND_HEAD_STICK_Y;
    }
    return models;
}

const STAND_BONES = [
    { id: 'body', pivot: [0, 24, 0], meshes: [1, 2, 3, 4], parent: null },
    { id: 'head', pivot: [0, 24, 0], meshes: [5], parent: 'body' },
    { id: 'leftarm', pivot: [5, 22, 0], meshes: [6], parent: 'body' },
    { id: 'leftleg', pivot: [1.9, 12, 0], meshes: [7], parent: 'body' },
    { id: 'rightarm', pivot: [-5, 22, 0], meshes: [8], parent: 'body' },
    { id: 'rightleg', pivot: [-1.9, 12, 0], meshes: [9], parent: 'body' }
];

const BABY_ZOMBIE_BOXES = [
    { name: 'body', size: [4, 5, 2], pos: [0, 6.5, 0], skin: 'shirt' },
    { name: 'head', size: [6, 6, 6], pos: [0, 12, 0], origin: [0, 8.75, 0], skin: 'head' },
    { name: 'right_arm', size: [2, 5, 2], pos: [3, 6.5, 0], origin: [3, 8.5, 0], skin: 'skin' },
    { name: 'left_arm', size: [2, 5, 2], pos: [-3, 6.5, 0], origin: [-3, 8.5, 0], skin: 'skin' },
    { name: 'right_leg', size: [2, 4, 2], pos: [1, 2, 0], origin: [1, 4, 0], skin: 'trousers' },
    { name: 'left_leg', size: [2, 4, 2], pos: [-1, 2, 0], origin: [-1, 4, 0], skin: 'trousers' }
];
const BABY_ZOMBIE_TEXTURE_SIZE = 16;
const BABY_ZOMBIE_PATCHES = {
    skin: [0, 0, 4, 4],
    shirt: [4, 0, 8, 4],
    trousers: [8, 0, 12, 4],
    face: [0, 4, 6, 10]
};
const BABY_ZOMBIE_COLOURS = { skin: '#5D8A3C', shirt: '#2E9C9C', trousers: '#3A3F8F', eyes: '#1B2A12', mouth: '#2F4A1F' };

function drawBabyZombieTexture() {
    let scale = OVERLAY_DRAW_SCALE;
    let canvas = document.createElement('canvas');
    canvas.width = canvas.height = BABY_ZOMBIE_TEXTURE_SIZE * scale;
    let context = canvas.getContext('2d');
    let fill = (colour, [x1, y1, x2, y2]) => {
        context.fillStyle = colour;
        context.fillRect(x1 * scale, y1 * scale, (x2 - x1) * scale, (y2 - y1) * scale);
    };
    fill(BABY_ZOMBIE_COLOURS.skin, BABY_ZOMBIE_PATCHES.skin);
    fill(BABY_ZOMBIE_COLOURS.shirt, BABY_ZOMBIE_PATCHES.shirt);
    fill(BABY_ZOMBIE_COLOURS.trousers, BABY_ZOMBIE_PATCHES.trousers);
    fill(BABY_ZOMBIE_COLOURS.skin, BABY_ZOMBIE_PATCHES.face);
    fill(BABY_ZOMBIE_COLOURS.eyes, [1, 6, 2, 7]);
    fill(BABY_ZOMBIE_COLOURS.eyes, [4, 6, 5, 7]);
    fill(BABY_ZOMBIE_COLOURS.mouth, [2, 8, 4, 9]);
    return canvas.toDataURL('image/png');
}

function buildBabyZombieModels() {
    let patch = name => ({ uv: BABY_ZOMBIE_PATCHES[name].slice() });
    let elements = BABY_ZOMBIE_BOXES.map(box => {
        let side = patch(box.skin === 'head' ? 'skin' : box.skin);
        let element = { name: box.name, size: box.size.slice(), pos: box.pos.slice() };
        if (box.origin) element.origin = box.origin.slice();
        for (let face of ['north', 'east', 'south', 'west', 'up', 'down']) element[face] = cloneJson(side);
        if (box.skin === 'head') element.north = patch('face');
        return element;
    });
    return [{ texture: drawBabyZombieTexture(), texture_size: [BABY_ZOMBIE_TEXTURE_SIZE, BABY_ZOMBIE_TEXTURE_SIZE], elements }];
}

function buildFrameModels(blockbenchId, glow) {
    let models = cloneBlockbenchModels(blockbenchId);
    if (glow && glowFrameTexture) {
        for (let model of models) {
            if (isFrameBoardTexture(model.texture)) model.texture = glowFrameTexture;
        }
    }
    return models;
}

function isFrameBoardTexture(texture) {
    return typeof texture === 'string' && /item_frame/.test(texture);
}

// =========================
// Bedrock references
// =========================
const BEDROCK_REFERENCE_DEFINITIONS = [
    {
        id: 'bedrock_player', icon: 'icon-player', nameKey: 'display_sensei.reference.bedrock_player', noteKey: null, approximate: false,
        kind: 'player', models: buildPlayerModels, place: placePlayer,
        posable: {
            thirdperson_righthand: { start: PLAYER_HOLD_ANGLE, range: ARM_ANGLE_RANGE },
            thirdperson_lefthand: { start: PLAYER_HOLD_ANGLE, range: ARM_ANGLE_RANGE },
            head: { start: 0, range: HEAD_PITCH_RANGE }
        }
    },
    {
        id: 'bedrock_zombie', icon: 'icon-zombie', nameKey: 'display_sensei.reference.bedrock_zombie', noteKey: null, approximate: false,
        kind: 'zombie', models: buildZombieModels, place: placeZombie('zombie', HEAD_RIGS.zombie),
        container: { rotation: [0, -90, 0], position: [0, 6, 0] }
    },
    {
        id: 'bedrock_baby_zombie', icon: 'icon-baby_zombie', nameKey: 'display_sensei.reference.bedrock_baby_zombie',
        noteKey: 'display_sensei.reference_note.bedrock_baby_zombie', approximate: true,
        kind: 'baby_zombie', models: buildBabyZombieModels, place: placeZombie('baby_zombie', HEAD_RIGS.baby_zombie)
    },
    {
        id: 'bedrock_armor_stand', icon: 'icon-armor_stand', nameKey: 'display_sensei.reference.bedrock_armor_stand', noteKey: null, approximate: false,
        kind: 'armor_stand', models: buildArmorStandModels, place: placeArmorStand
    },
    {
        id: 'bedrock_armor_stand_posed', icon: 'accessibility_new', nameKey: 'display_sensei.reference.bedrock_armor_stand_posed',
        noteKey: 'display_sensei.reference_note.bedrock_armor_stand_posed', approximate: false,
        kind: 'armor_stand_posed', models: buildArmorStandModels, place: placeArmorStand
    },
    {
        id: 'bedrock_fp_hold', icon: 'fa-asterisk', nameKey: 'display_sensei.reference.bedrock_fp_hold',
        noteKey: 'display_sensei.reference_note.bedrock_fp_hold', approximate: true,
        kind: 'first_person', models: () => cloneBlockbenchModels('monitor'), place: placeFirstPerson('hold')
    },
    {
        id: 'bedrock_fp_bow', icon: 'icon-bow', nameKey: 'display_sensei.reference.bedrock_fp_bow',
        noteKey: 'display_sensei.reference_note.bedrock_fp_bow', approximate: true, mainHandOnly: true,
        kind: 'first_person', models: () => cloneBlockbenchModels('monitor'), place: placeFirstPerson('bow')
    },
    {
        id: 'bedrock_fp_crossbow', icon: 'icon-crossbow', nameKey: 'display_sensei.reference.bedrock_fp_crossbow',
        noteKey: 'display_sensei.reference_note.bedrock_fp_crossbow', approximate: true, mainHandOnly: true,
        kind: 'first_person', models: () => cloneBlockbenchModels('monitor'), place: placeFirstPerson('crossbow')
    },
    {
        id: 'bedrock_fp_spear', icon: 'north_east', nameKey: 'display_sensei.reference.bedrock_fp_spear',
        noteKey: 'display_sensei.reference_note.bedrock_fp_spear', approximate: true, mainHandOnly: true,
        kind: 'first_person', models: () => cloneBlockbenchModels('monitor'), place: placeFirstPerson('spear')
    },
    {
        id: 'bedrock_fp_eat', icon: 'fa-apple-whole', nameKey: 'display_sensei.reference.bedrock_fp_eat',
        noteKey: 'display_sensei.reference_note.bedrock_fp_eat', approximate: !FIRST_PERSON_POSES.eat.calibrated, mainHandOnly: true,
        kind: 'first_person', models: () => cloneBlockbenchModels('monitor'), place: placeFirstPerson('eat')
    },
    {
        id: 'bedrock_fox', icon: 'pets', nameKey: 'display_sensei.reference.bedrock_fox',
        noteKey: 'display_sensei.reference_note.bedrock_fox', approximate: true, stopsGround: true,
        kind: 'fox', models: () => cloneBlockbenchModels('fox'), place: placeFox
    },
    {
        id: 'bedrock_frame', icon: 'filter_frames', nameKey: 'display_sensei.reference.bedrock_frame', noteKey: null, approximate: false,
        kind: 'frame', frame: true, models: () => buildFrameModels('frame', false), place: placeFrame('wall')
    },
    {
        id: 'bedrock_glow_frame', icon: 'flare', nameKey: 'display_sensei.reference.bedrock_glow_frame',
        noteKey: 'display_sensei.reference_note.bedrock_glow_frame', approximate: false,
        kind: 'frame', frame: true, glow: true, models: () => buildFrameModels('frame', true), place: placeFrame('wall')
    },
    {
        id: 'bedrock_frame_floor', icon: 'vertical_align_bottom', nameKey: 'display_sensei.reference.bedrock_frame_floor', noteKey: null, approximate: false,
        kind: 'frame', frame: true, models: () => buildFrameModels('frame_top', false), place: placeFrame('floor')
    },
    {
        id: 'bedrock_glow_frame_floor', icon: 'flare', nameKey: 'display_sensei.reference.bedrock_glow_frame_floor',
        noteKey: 'display_sensei.reference_note.bedrock_glow_frame', approximate: false,
        kind: 'frame', frame: true, glow: true, models: () => buildFrameModels('frame_top', true), place: placeFrame('floor')
    },
    {
        id: 'bedrock_frame_ceiling', icon: 'vertical_align_top', nameKey: 'display_sensei.reference.bedrock_frame_ceiling', noteKey: null, approximate: true,
        kind: 'frame', frame: true, models: () => buildFrameModels('frame_top', false), place: placeFrame('ceiling'),
        container: { rotation: [180, 0, 0], position: [0, BLOCK_SIZE, BLOCK_SIZE] },
        camera: CEILING_FRAME_CAMERA
    },
    {
        id: 'bedrock_glow_frame_ceiling', icon: 'flare', nameKey: 'display_sensei.reference.bedrock_glow_frame_ceiling', noteKey: null, approximate: true,
        kind: 'frame', frame: true, glow: true, models: () => buildFrameModels('frame_top', true), place: placeFrame('ceiling'),
        container: { rotation: [180, 0, 0], position: [0, BLOCK_SIZE, BLOCK_SIZE] },
        camera: CEILING_FRAME_CAMERA
    },
    {
        id: 'bedrock_flower_pot', icon: 'potted_plant', nameKey: 'display_sensei.reference.bedrock_flower_pot',
        noteKey: 'display_sensei.reference_note.bedrock_flower_pot', approximate: true,
        kind: 'flower_pot', models: () => cloneBlockbenchModels('flower_pot'), place: placeFlowerPot
    },
    {
        id: 'bedrock_shelf', icon: 'table_view', nameKey: 'display_sensei.reference.bedrock_shelf',
        noteKey: 'display_sensei.reference_note.bedrock_shelf', approximate: true, shelfCopies: true,
        kind: 'shelf', models: () => cloneBlockbenchModels('shelf'), place: placeShelf('shelf_center')
    },
    {
        id: 'bedrock_shelf_left', icon: 'keyboard_arrow_left', nameKey: 'display_sensei.reference.bedrock_shelf_left',
        noteKey: 'display_sensei.reference_note.bedrock_shelf', approximate: true,
        kind: 'shelf', models: () => cloneBlockbenchModels('shelf'), place: placeShelf('shelf_left')
    },
    {
        id: 'bedrock_shelf_center', icon: 'remove', nameKey: 'display_sensei.reference.bedrock_shelf_center',
        noteKey: 'display_sensei.reference_note.bedrock_shelf', approximate: true,
        kind: 'shelf', models: () => cloneBlockbenchModels('shelf'), place: placeShelf('shelf_center')
    },
    {
        id: 'bedrock_shelf_right', icon: 'keyboard_arrow_right', nameKey: 'display_sensei.reference.bedrock_shelf_right',
        noteKey: 'display_sensei.reference_note.bedrock_shelf', approximate: true,
        kind: 'shelf', models: () => cloneBlockbenchModels('shelf'), place: placeShelf('shelf_right')
    },
    {
        id: 'bedrock_gui_grid', icon: 'icon-inventory_nine', nameKey: 'display_sensei.reference.bedrock_gui_grid', noteKey: null, approximate: false,
        kind: 'gui', models: () => [], place: placeGui
    },
    {
        id: 'bedrock_gui_inventory', icon: 'icon-inventory_full', nameKey: 'display_sensei.reference.bedrock_gui_inventory', noteKey: null, approximate: false,
        kind: 'gui', models: () => [], place: placeGui
    },
    {
        id: 'bedrock_gui_hotbar', icon: 'icon-hud', nameKey: 'display_sensei.reference.bedrock_gui_hotbar', noteKey: null, approximate: false,
        kind: 'gui', models: () => [], place: placeGui
    }
];

const BEDROCK_REFERENCE_FOR_BLOCKBENCH = {
    player: 'bedrock_player',
    zombie: 'bedrock_zombie',
    baby_zombie: 'bedrock_baby_zombie',
    armor_stand: 'bedrock_armor_stand',
    armor_stand_small: 'bedrock_armor_stand_posed',
    monitor: 'bedrock_fp_hold',
    bow: 'bedrock_fp_bow',
    crossbow: 'bedrock_fp_crossbow',
    tooting: 'bedrock_fp_spear',
    eating: 'bedrock_fp_eat',
    block: 'block',
    fox: 'bedrock_fox',
    frame: 'bedrock_frame',
    frame_invisible: 'bedrock_glow_frame',
    frame_top: 'bedrock_frame_floor',
    frame_top_invisible: 'bedrock_glow_frame_floor',
    flower_pot: 'bedrock_flower_pot',
    shelf: 'bedrock_shelf',
    shelf_left: 'bedrock_shelf_left',
    shelf_center: 'bedrock_shelf_center',
    shelf_right: 'bedrock_shelf_right',
    inventory_nine: 'bedrock_gui_grid',
    inventory_full: 'bedrock_gui_inventory',
    hud: 'bedrock_gui_hotbar'
};

const BEDROCK_REFERENCE_EXTRAS = {
    fixed: ['bedrock_frame_ceiling', 'bedrock_glow_frame_ceiling']
};

// =========================
// Preview options (preview only, never saved)
// =========================
let previewOptions = createPreviewOptions();

function createPreviewOptions() {
    return {
        armPose: { thirdperson_righthand: 'holding', thirdperson_lefthand: 'holding' },
        standPose: STAND_POSED_START,
        frameStep: 0,
        faceDimming: true,
        fitPreview: true
    };
}

// =========================
// Creating the references
// =========================
let bedrockReferences = {};

function getBedrockReference(id) {
    return bedrockReferences[id] || null;
}

function getReferenceDefinition(reference) {
    return reference && reference.ds_definition ? reference.ds_definition : null;
}

function findReferenceClass() {
    let player = displayReferenceObjects && displayReferenceObjects.refmodels && displayReferenceObjects.refmodels.player;
    let ReferenceClass = player && player.constructor;
    if (typeof ReferenceClass !== 'function' || !ReferenceClass.prototype ||
        typeof ReferenceClass.prototype.load !== 'function' || typeof ReferenceClass.prototype.buildModel !== 'function') {
        return null;
    }
    return ReferenceClass;
}

function createBedrockReference(ReferenceClass, definition) {
    let reference = new ReferenceClass(definition.id, {
        icon: definition.icon,
        models: definition.models(),
        condition: { formats: [BLOCK_FORMAT_ID] }
    });
    Object.defineProperty(reference, 'name', { configurable: true, enumerable: true, get: () => i18n(definition.nameKey) });
    reference.ds_definition = definition;
    reference.pose_angles = {};
    if (definition.posable) {
        for (let [slotId, pose] of Object.entries(definition.posable)) reference.pose_angles[slotId] = pose.start;
    }
    if (definition.container) {
        let { rotation = [0, 0, 0], position = [0, 0, 0] } = definition.container;
        reference.model.rotation.set(rotation[0] * DEGREES, rotation[1] * DEGREES, rotation[2] * DEGREES);
        reference.model.position.fromArray(position);
    }
    reference.updateBasePosition = function() {
        placeBedrockReference(this);
    };
    reference.load = function(index) {
        ReferenceClass.prototype.load.call(this, index);
        afterBedrockReferenceLoad(this);
    };
    return reference;
}

function registerBedrockReferences(ReferenceClass) {
    let refmodels = displayReferenceObjects.refmodels;
    for (let definition of BEDROCK_REFERENCE_DEFINITIONS) {
        let reference = createBedrockReference(ReferenceClass, definition);
        Object.defineProperty(refmodels, definition.id, { configurable: true, enumerable: false, writable: true, value: reference });
        bedrockReferences[definition.id] = reference;
    }
    return {
        delete() {
            for (let [id, reference] of Object.entries(bedrockReferences)) {
                if (displayReferenceObjects.active === reference) displayReferenceObjects.clear();
                disposeReference(reference);
                if (refmodels[id] === reference) delete refmodels[id];
            }
            bedrockReferences = {};
        }
    };
}

function disposeReference(reference) {
    let player = displayReferenceObjects.refmodels.player;
    let shared = player ? player.material : null;
    let materials = new Set();
    reference.model.traverse(object => {
        if (object.isMesh) {
            if (object.geometry) object.geometry.dispose();
            materials.add(object.material);
        }
    });
    materials.forEach(material => {
        if (!material || material === shared) return;
        if (material.map) material.map.dispose();
        material.dispose();
    });
    if (reference.model.parent) reference.model.parent.remove(reference.model);
}

// =========================
// Placing a reference
// =========================
function placeBedrockReference(reference) {
    let definition = getReferenceDefinition(reference);
    let slotId = DisplayMode.display_slot;
    if (!definition || !slotId) return;
    let placement = definition.place(reference, slotId) || {};
    if (placement.args) DisplayMode.setBase(...placement.args);
    if (reference.ds_prepared) poseReferenceMeshes(reference, placement.meshPose || null);
    if (definition.kind === 'gui') applyGuiDisplayArea();
    if (definition.shelfCopies) updateShelfCopies(reference);
}

function poseReferenceMeshes(reference, meshPose) {
    let kind = reference.ds_definition.kind;
    if (kind === 'player') posePlayerMeshes(reference, meshPose);
    if (kind === 'armor_stand' || kind === 'armor_stand_posed') poseStandBones(reference, meshPose && meshPose.standPose);
    if (kind === 'zombie' || kind === 'baby_zombie') poseZombieMeshes(reference);
}

function setMeshRotation(object, degrees) {
    object.rotation.set(degrees[0] * DEGREES, degrees[1] * DEGREES, degrees[2] * DEGREES, 'ZYX');
}

function posePlayerMeshes(reference, meshPose) {
    let pose = meshPose || { rightArm: [0, 0, 0], leftArm: [0, 0, 0], head: [0, 0, 0], sneaking: false };
    let container = reference.model;
    container.scale.setScalar(PLAYER_ENTITY_SCALE);
    if (pose.sneaking) {
        let root = SNEAK_PARENTS[0];
        container.position.fromArray(toBlockbenchPosition(root.pos).map(value => value * PLAYER_ENTITY_SCALE));
        setMeshRotation(container, toBlockbenchRotation(root.rot));
    } else {
        container.position.set(0, 0, 0);
        container.rotation.set(0, 0, 0);
    }
    let bodyDrop = pose.sneaking ? SNEAK_PARENTS[1].pos[1] : 0;
    for (let mesh of container.children) {
        let part = mesh.userData.ds_part;
        let origin = mesh.userData.ds_origin;
        if (!part || !origin) continue;
        mesh.position.copy(origin);
        if (part === 'right_arm' || part === 'left_arm') {
            mesh.position.y += bodyDrop;
            setMeshRotation(mesh, part === 'right_arm' ? pose.rightArm : pose.leftArm);
        } else if (part === 'head') {
            mesh.position.y += bodyDrop + (pose.sneaking ? SNEAK_HEAD_DROP : 0);
            setMeshRotation(mesh, pose.head);
        } else if (part === 'body') {
            mesh.position.y += bodyDrop;
            mesh.rotation.set(0, 0, 0);
        } else {
            setMeshRotation(mesh, pose.sneaking ? toBlockbenchRotation([SNEAK_LEG_TURN, 0, 0]) : [0, 0, 0]);
        }
    }
}

function poseStandBones(reference, pose) {
    let bones = reference.ds_bones;
    if (!bones || !pose) return;
    for (let [id, group] of Object.entries(bones)) {
        setMeshRotation(group, toBlockbenchRotation(pose[id] || [0, 0, 0]));
    }
}

function poseZombieMeshes(reference) {
    let arms = getZombieArms(reference.ds_definition.kind, DisplayMode.display_slot);
    let container = new THREE.Matrix4().makeRotationFromEuler(reference.model.rotation);
    let containerInverse = container.clone().invert();
    let lowered = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
    let raisedRest = reference.ds_definition.kind === 'zombie';
    for (let mesh of reference.model.children) {
        let side = mesh.name === 'right_arm' ? 'right' : mesh.name === 'left_arm' ? 'left' : null;
        if (!side) continue;
        let rotation = toBlockbenchRotation(arms[side]);
        if (!raisedRest) {
            setMeshRotation(mesh, rotation);
            continue;
        }
        let matrix = containerInverse.clone().multiply(rotationMatrix(rotation, 'ZYX')).multiply(lowered).multiply(container);
        mesh.rotation.setFromRotationMatrix(matrix);
    }
}

// =========================
// After a load
// =========================
let isDrawingBar = false;

function afterBedrockReferenceLoad(reference) {
    let definition = getReferenceDefinition(reference);
    if (!definition) return;
    if (!reference.ds_prepared) prepareBuiltReference(reference);
    if (definition.kind === 'player') sharePlayerMaterial(reference);
    reference.updateBasePosition();
    syncBlockbenchPoseSlider(reference);
    if (definition.stopsGround && DisplayMode.display_slot === 'ground') Canvas.ground_animation = false;
    applyReferenceCamera(reference);
    if (!isDrawingBar) aimThirdPersonCamera();
}

let savedSlotCamera = null;

function applyReferenceCamera(reference) {
    let preview = getDisplayPreview();
    let slotId = DisplayMode.display_slot;
    let camera = getReferenceDefinition(reference).camera;
    if (!preview) return;
    if (camera) {
        if (!savedSlotCamera || savedSlotCamera.slotId !== slotId) {
            savedSlotCamera = {
                slotId,
                preset: { projection: 'perspective', position: preview.camera.position.toArray(), target: preview.controls.target.toArray() }
            };
        }
        preview.loadAnglePreset({ projection: 'perspective', position: camera.position.slice(), target: camera.target.slice() });
    } else if (savedSlotCamera && savedSlotCamera.slotId === slotId) {
        preview.loadAnglePreset(savedSlotCamera.preset);
        savedSlotCamera = null;
    }
}

function prepareBuiltReference(reference) {
    if (!reference.initialized) return;
    let kind = reference.ds_definition.kind;
    if (kind === 'player') preparePlayerMeshes(reference);
    if (kind === 'armor_stand' || kind === 'armor_stand_posed') prepareStandBones(reference);
    if (reference.ds_definition.glow) applyGlowTextureTo(reference);
    reference.ds_prepared = true;
}

function preparePlayerMeshes(reference) {
    for (let mesh of reference.model.children) {
        mesh.userData.ds_part = classifyPlayerElement({ name: mesh.name });
        mesh.userData.ds_origin = mesh.position.clone();
    }
    let player = ensureBlockbenchPlayerBuilt();
    let ReferenceClass = reference.constructor;
    ReferenceClass.prototype.setModelVariant.call(reference, (player && player.variant) || 'steve');
}

function ensureBlockbenchPlayerBuilt() {
    let player = displayReferenceObjects.refmodels.player;
    if (!player) return null;
    if (!player.initialized) {
        for (let model of player.models) player.buildModel(model);
        player.setModelVariant('steve');
        player.initialized = true;
        if (typeof DisplayMode.updateDisplaySkin === 'function') DisplayMode.updateDisplaySkin();
    }
    return player;
}

function sharePlayerMaterial(reference) {
    let player = ensureBlockbenchPlayerBuilt();
    if (!player || !player.material) return;
    reference.model.traverse(object => {
        if (!object.isMesh || object.material === player.material) return;
        let own = object.material;
        object.material = player.material;
        if (own && own !== player.material && !isMaterialUsed(reference.model, own)) own.dispose();
    });
    reference.material = player.material;
}

function isMaterialUsed(model, material) {
    let used = false;
    model.traverse(object => {
        if (object.isMesh && object.material === material) used = true;
    });
    return used;
}

function prepareStandBones(reference) {
    let meshes = reference.model.children.slice();
    let groups = {};
    let pivots = {};
    for (let bone of STAND_BONES) {
        let pivot = toBlockbenchPosition(bone.pivot);
        let group = new THREE.Object3D();
        group.name = `ds_bone_${bone.id}`;
        let parentPivot = bone.parent ? pivots[bone.parent] : [0, 0, 0];
        group.position.set(pivot[0] - parentPivot[0], pivot[1] - parentPivot[1], pivot[2] - parentPivot[2]);
        (bone.parent ? groups[bone.parent] : reference.model).add(group);
        for (let index of bone.meshes) {
            let mesh = meshes[index];
            if (!mesh) continue;
            group.add(mesh);
            mesh.position.set(mesh.position.x - pivot[0], mesh.position.y - pivot[1], mesh.position.z - pivot[2]);
        }
        groups[bone.id] = group;
        pivots[bone.id] = pivot;
    }
    reference.ds_bones = groups;
}

function syncBlockbenchPoseSlider(reference) {
    if (!DisplayMode.vue) return;
    DisplayMode.vue.reference_model = getPoseSpec(reference, DisplayMode.display_slot) ? 'player' : reference.id;
}

// =========================
// Pose angle (used by native_display_panel.js)
// =========================
function getPoseSpec(reference, slotId) {
    let definition = getReferenceDefinition(reference);
    if (!definition || !definition.posable || !definition.posable[slotId]) return null;
    if (THIRD_PERSON_SLOTS.includes(slotId) && getArmPose(slotId).id !== 'holding') return null;
    let pose = definition.posable[slotId];
    return { start: pose.start, min: pose.range[0], max: pose.range[1] };
}

function getPosableReferences() {
    return Object.values(bedrockReferences).filter(reference => reference.ds_definition.posable);
}

function getTunedHoldPosition(reference) {
    let definition = getReferenceDefinition(reference);
    if (!definition || definition.kind !== 'player') return null;
    let rig = THIRD_PERSON_RIGS[reference.variant === 'alex' ? 'player_slim' : 'player_wide'].right;
    let frame = composeHeldItemFrame(Object.assign({}, rig, { armRot: [-PLAYER_HOLD_ANGLE, 0, 0], entityScale: PLAYER_ENTITY_SCALE }));
    return toSetBaseArgs(frame).slice(0, 3);
}

// =========================
// Notes and estimates (getReferenceChoices())
// =========================
const ANCHOR_NOTE_KEYS = {
    hold: 'display_sensei.reference_note.hold_rule',
    head: 'display_sensei.reference_note.head_anchor',
    frame: 'display_sensei.reference_note.frame_anchor',
    gui: 'display_sensei.reference_note.gui_facing',
    ground: 'display_sensei.reference_note.ground_motion'
};
const HOLDER_KINDS = ['player', 'zombie', 'baby_zombie', 'armor_stand', 'armor_stand_posed'];

function getAnchorNoteKey(definition, reference, slotId) {
    if (!definition) {
        let isGroundBlock = !!reference && reference.id === 'block' && slotId === 'ground' && getRoute() === 'block';
        return isGroundBlock ? ANCHOR_NOTE_KEYS.ground : null;
    }
    if (HOLDER_KINDS.includes(definition.kind)) {
        if (THIRD_PERSON_SLOTS.includes(slotId)) return ANCHOR_NOTE_KEYS.hold;
        if (slotId === 'head') return ANCHOR_NOTE_KEYS.head;
    }
    if (definition.frame) return ANCHOR_NOTE_KEYS.frame;
    if (definition.kind === 'gui') return ANCHOR_NOTE_KEYS.gui;
    return null;
}

function describeReference(reference, slotId) {
    let definition = getReferenceDefinition(reference);
    let notes = [];
    if (definition && definition.noteKey) notes.push(i18n(definition.noteKey));
    if (definition && definition.mainHandOnly && slotId === 'firstperson_lefthand') notes.push(i18n('display_sensei.reference_note.main_hand_only'));
    let anchorKey = getAnchorNoteKey(definition, reference, slotId);
    if (anchorKey) notes.push(i18n(anchorKey));
    return { note: notes.join(' '), approximate: !!definition && !!definition.approximate };
}

// =========================
// A hand slot's reference without loading it (used by hand_views.js)
// =========================
const HAND_SLOT_REFERENCE_KINDS = {
    thirdperson_righthand: HOLDER_KINDS,
    thirdperson_lefthand: HOLDER_KINDS,
    firstperson_righthand: ['first_person'],
    firstperson_lefthand: ['first_person']
};

function getSlotReferenceIds(slotId) {
    let kinds = HAND_SLOT_REFERENCE_KINDS[slotId] || [];
    let drawn = referenceIdsBySlot[slotId];
    let ids = drawn ? drawn.map(id => BEDROCK_REFERENCE_FOR_BLOCKBENCH[id] || id) :
        BEDROCK_REFERENCE_DEFINITIONS.filter(definition => kinds.includes(definition.kind)).map(definition => definition.id);
    let refmodels = displayReferenceObjects.refmodels;
    return ids.filter(id => refmodels[id] && Condition(refmodels[id]));
}

function buildReferenceWithoutLoading(reference) {
    if (!reference.initialized) {
        for (let model of reference.models) reference.buildModel(model);
        reference.initialized = true;
    }
    let definition = getReferenceDefinition(reference);
    if (!definition) return;
    if (!reference.ds_prepared) prepareBuiltReference(reference);
    if (definition.kind === 'player') sharePlayerMaterial(reference);
}

function getSlotReference(slotId) {
    if (getRoute() !== 'block' || !HAND_SLOT_REFERENCE_KINDS[slotId]) return null;
    let ids = getSlotReferenceIds(slotId);
    if (!ids.length) return null;
    let index = displayReferenceObjects.ref_indexes[slotId] || 0;
    let reference = displayReferenceObjects.refmodels[ids[index] || ids[0]];
    buildReferenceWithoutLoading(reference);
    return reference;
}

function placeReferenceForSlot(reference) {
    if (getReferenceDefinition(reference)) {
        placeBedrockReference(reference);
    } else if (typeof reference.updateBasePosition === 'function') {
        reference.updateBasePosition();
    }
}

// =========================
// Remembered reference per slot
// =========================
function splitRememberedReferences() {
    let blockbenchIndexes = displayReferenceObjects.ref_indexes;
    let bedrockIndexes = {};
    for (let slotId of displayReferenceObjects.slots || Object.keys(blockbenchIndexes)) bedrockIndexes[slotId] = 0;
    Object.defineProperty(displayReferenceObjects, 'ref_indexes', {
        configurable: true,
        enumerable: true,
        get() {
            return getRoute() === 'block' ? bedrockIndexes : blockbenchIndexes;
        },
        set(value) {
            if (getRoute() === 'block') bedrockIndexes = value;
            else blockbenchIndexes = value;
        }
    });
    return {
        delete() {
            delete displayReferenceObjects.ref_indexes;
            displayReferenceObjects.ref_indexes = blockbenchIndexes;
        }
    };
}

// =========================
// The reference bar
// =========================
let blockbenchIdsBySlot = {};
let unmappedBlockbenchIds = new Set();

function toBedrockReferenceIds(slotId, blockbenchIds) {
    let ids = blockbenchIds.map(id => {
        if (BEDROCK_REFERENCE_FOR_BLOCKBENCH[id]) return BEDROCK_REFERENCE_FOR_BLOCKBENCH[id];
        if (!unmappedBlockbenchIds.has(id)) {
            unmappedBlockbenchIds.add(id);
            console.warn(LOG_PREFIX, `Blockbench offers the reference model "${id}", which has no Bedrock version; it is shown as it is.`);
        }
        return id;
    });
    return ids.concat(BEDROCK_REFERENCE_EXTRAS[slotId] || []);
}

function wrapBedrockReferenceBar() {
    return wrapMethod(displayReferenceObjects, 'bar', function(original, args) {
        let blockbenchIds = args[0];
        if (!Array.isArray(blockbenchIds)) return original.apply(this, args);
        let slotId = DisplayMode.display_slot;
        blockbenchIdsBySlot[slotId] = blockbenchIds.slice();
        if (getRoute() !== 'block') return original.apply(this, args);
        if (slotId === 'ground') resetGroundClock();
        savedSlotCamera = null;
        isDrawingBar = true;
        try {
            return original.apply(this, [toBedrockReferenceIds(slotId, blockbenchIds)].concat(args.slice(1)));
        } finally {
            isDrawingBar = false;
        }
    });
}

function getBlockbenchIdsForSlot(slotId) {
    if (blockbenchIdsBySlot[slotId]) return blockbenchIdsBySlot[slotId].slice();
    let shown = referenceIdsBySlot[slotId] || [];
    let blockbenchFor = {};
    for (let [blockbenchId, bedrockId] of Object.entries(BEDROCK_REFERENCE_FOR_BLOCKBENCH)) blockbenchFor[bedrockId] = blockbenchId;
    return shown.filter(id => blockbenchFor[id] || !getBedrockReference(id)).map(id => blockbenchFor[id] || id);
}

function showBedrockReferencesNow() {
    if (!Modes.display || getRoute() !== 'block' || !DisplayMode.display_slot) return;
    let ids = getBlockbenchIdsForSlot(DisplayMode.display_slot);
    if (!ids.length) return;
    displayReferenceObjects.bar(ids);
    markBlockbenchReferenceButton(displayReferenceObjects.active ? displayReferenceObjects.active.id : null);
    DisplayMode.updateDisplayBase();
}

function showBlockbenchReferencesAgain(slotId, blockbenchIds) {
    if (!Modes.display || getRoute() !== 'block' || DisplayMode.display_slot !== slotId || !blockbenchIds.length) return;
    if (slotId === 'gui') DisplayMode.setBase(0, 0, 0, 0, 0, 0, GUI_AREA_SCALE, GUI_AREA_SCALE, GUI_AREA_SCALE);
    displayReferenceObjects.bar(blockbenchIds);
    markBlockbenchReferenceButton(displayReferenceObjects.active ? displayReferenceObjects.active.id : null);
    DisplayMode.updateDisplayBase();
}

// =========================
// Ground
// =========================
let groundClock = { seconds: 0, last: null };

function resetGroundClock() {
    groundClock = { seconds: 0, last: null };
}

function animateBedrockGround(original, args) {
    if (getRoute() !== 'block') return original.apply(this, args);
    let now = performance.now() / 1000;
    if (groundClock.last !== null) {
        groundClock.seconds += Math.min(Math.max(now - groundClock.last, 0), GROUND_MAX_STEP_SECONDS);
    }
    groundClock.last = now;
    let seconds = groundClock.seconds;
    let area = DisplayMode.display_area;
    area.rotation.y = seconds * GROUND_SPIN_PER_SECOND;
    area.position.y = GROUND_LIFT + GROUND_BOB_AMPLITUDE * Math.sin(GROUND_BOB_PER_SECOND * seconds);
    Transformer.center();
}

function followGroundRestHeight() {
    let block = displayReferenceObjects.refmodels.block;
    if (!block || typeof block.updateBasePosition !== 'function') return { delete() {} };
    let hadOwn = Object.prototype.hasOwnProperty.call(block, 'updateBasePosition');
    let original = block.updateBasePosition;
    let active = true;
    let wrapper = function() {
        let result = original.apply(this, arguments);
        if (active && getRoute() === 'block' && DisplayMode.display_slot === 'ground' && DisplayMode.display_area) {
            DisplayMode.display_area.position.y = GROUND_LIFT;
            DisplayMode.display_area.updateMatrixWorld();
            Transformer.center();
        }
        return result;
    };
    block.updateBasePosition = wrapper;
    return {
        delete() {
            active = false;
            if (block.updateBasePosition !== wrapper) return;
            if (hadOwn) block.updateBasePosition = original;
            else delete block.updateBasePosition;
        }
    };
}

// =========================
// Shelf copies
// =========================
function updateShelfCopies(reference) {
    let area = DisplayMode.display_area;
    let base = DisplayMode.display_base;
    if (!reference.shelf_displays) {
        reference.shelf_displays = [-SHELF_COPY_OFFSET, SHELF_COPY_OFFSET].map((offset, index) => {
            let group = new THREE.Object3D();
            group.name = `ds_shelf_copy_${index}`;
            group.userData.ds_offset = offset;
            area.add(group);
            return group;
        });
    }
    for (let group of reference.shelf_displays) {
        if (group.children.length !== base.children.length) {
            group.children.slice().forEach(child => group.remove(child));
            base.children.forEach(child => group.add(child.clone()));
        }
        let position = base.position.clone();
        position.x += group.userData.ds_offset;
        group.matrix.compose(position, base.quaternion, base.scale);
        group.matrixAutoUpdate = false;
        group.matrixWorldNeedsUpdate = true;
    }
}

// =========================
// GUI: Fit to Frame preview
// =========================
function isGuiFitPreviewOn() {
    return previewOptions.fitPreview && !!Project && getProjectData().gui_fit_to_frame;
}

function measureModelInGuiView() {
    let base = DisplayMode.display_base;
    base.updateMatrixWorld(true);
    let toBase = base.matrixWorld.clone().invert();
    let turnAndScale = new THREE.Matrix4().compose(new THREE.Vector3(), base.quaternion, base.scale);
    let box = new THREE.Box3();
    let point = new THREE.Vector3();
    for (let element of Outliner.elements) {
        let mesh = element.mesh;
        let positions = mesh && mesh.geometry && mesh.geometry.attributes && mesh.geometry.attributes.position;
        if (!positions || element.visibility === false) continue;
        mesh.updateMatrixWorld(true);
        let toArea = turnAndScale.clone().multiply(toBase).multiply(mesh.matrixWorld);
        for (let index = 0; index < positions.count; index++) {
            box.expandByPoint(point.fromBufferAttribute(positions, index).applyMatrix4(toArea));
        }
    }
    return box;
}

function applyGuiDisplayArea() {
    if (!Modes.display || getRoute() !== 'block' || DisplayMode.display_slot !== 'gui') return;
    let box = isGuiFitPreviewOn() ? measureModelInGuiView() : null;
    let size = box && !box.isEmpty() ? Math.max(box.max.x - box.min.x, box.max.y - box.min.y) : 0;
    if (!(size > 1e-6)) {
        DisplayMode.setBase(0, 0, 0, 0, 0, 0, GUI_AREA_SCALE, GUI_AREA_SCALE, GUI_AREA_SCALE);
        return;
    }
    let factor = GUI_ITEM_SIZE / size;
    let centre = box.getCenter(new THREE.Vector3());
    let translation = DisplayMode.display_base.position;
    let scale = GUI_AREA_SCALE * factor;
    let offset = axis => GUI_AREA_SCALE * ((1 - factor) * translation[axis] - factor * centre[axis]);
    DisplayMode.setBase(offset('x'), offset('y'), offset('z'), 0, 0, 0, scale, scale, scale);
}

// =========================
// Wrapping updateDisplayBase
// =========================
function updateBedrockDisplayBase(original, args) {
    if (getRoute() !== 'block' || !Modes.display) return original.apply(this, args);
    let drawArgs = args;
    let slot = args[0] || (Project && Project.display_settings[DisplayMode.display_slot]);
    if (LEFT_HAND_PIVOT_MIRROR && slot && isLeftHandSlot(DisplayMode.display_slot)) {
        drawArgs = [mirrorPivotsForLeftHand(slot)];
    }
    let result = original.apply(this, drawArgs);
    let reference = displayReferenceObjects.active;
    let definition = getReferenceDefinition(reference);
    if (definition && definition.shelfCopies && reference.shelf_displays) updateShelfCopies(reference);
    if (DisplayMode.display_slot === 'gui') applyGuiDisplayArea();
    return result;
}

function mirrorPivotsForLeftHand(slot) {
    let shadow = Object.create(slot);
    shadow.rotation_pivot = [-slot.rotation_pivot[0], slot.rotation_pivot[1], slot.rotation_pivot[2]];
    shadow.scale_pivot = [-slot.scale_pivot[0], slot.scale_pivot[1], slot.scale_pivot[2]];
    return shadow;
}

// =========================
// GUI: face dimming
// =========================
let isFaceDimmingRemoved = false;

function shouldRemoveFaceDimming() {
    return previewOptions.faceDimming === false && !!Modes.display && getRoute() === 'block';
}

function getShadedMaterials() {
    let materials = [];
    let add = material => {
        if (material && material.uniforms && material.uniforms.SHADE) materials.push(material);
    };
    for (let texture of Texture.all) add(typeof texture.getMaterial === 'function' ? texture.getMaterial() : texture.material);
    (Canvas.emptyMaterials || []).forEach(add);
    (Canvas.coloredSolidMaterials || []).forEach(add);
    return materials;
}

function removeFaceDimming() {
    if (!shouldRemoveFaceDimming()) return;
    for (let material of getShadedMaterials()) material.uniforms.SHADE.value = false;
    isFaceDimmingRemoved = true;
}

function refreshFaceDimming() {
    if (shouldRemoveFaceDimming()) {
        removeFaceDimming();
    } else if (isFaceDimmingRemoved) {
        isFaceDimmingRemoved = false;
        Canvas.updateShading();
    }
}

function followFaceDimming() {
    let hooks = createDeletables([
        () => Blockbench.on('update_scene_shading', guardListener('update_scene_shading', removeFaceDimming)),
        () => Blockbench.on(SYNC_EVENTS, guardListener('face_dimming', refreshFaceDimming))
    ]);
    return {
        delete() {
            hooks.delete();
            if (isFaceDimmingRemoved) {
                isFaceDimmingRemoved = false;
                Canvas.updateShading();
            }
        }
    };
}

// =========================
// GUI overlays
// =========================
const GUI_OVERLAYS = [
    { referenceId: 'bedrock_gui_grid', nameKey: 'display_sensei.reference.bedrock_gui_grid', size: [3 * GUI_SLOT_SIZE, 3 * GUI_SLOT_SIZE], modelAt: [1.5 * GUI_SLOT_SIZE, 1.5 * GUI_SLOT_SIZE], draw: drawGridOverlay },
    {
        referenceId: 'bedrock_gui_inventory', nameKey: 'display_sensei.reference.bedrock_gui_inventory',
        size: [2 * INVENTORY_BORDER + 9 * GUI_SLOT_SIZE, 2 * INVENTORY_BORDER + 4 * GUI_SLOT_SIZE + INVENTORY_GAP],
        modelAt: [INVENTORY_BORDER + GUI_SLOT_SIZE / 2, INVENTORY_BORDER + 3 * GUI_SLOT_SIZE + INVENTORY_GAP + GUI_SLOT_SIZE / 2],
        draw: drawInventoryOverlay
    },
    {
        referenceId: 'bedrock_gui_hotbar', nameKey: 'display_sensei.reference.bedrock_gui_hotbar',
        size: [HOTBAR_SLOTS * HOTBAR_PITCH + 4, HOTBAR_SELECTION],
        modelAt: [2 + HOTBAR_SELECTED_SLOT * HOTBAR_PITCH + HOTBAR_PITCH / 2, HOTBAR_SELECTION / 2],
        draw: drawHotbarOverlay
    }
];

function createOverlayCanvas(size) {
    let canvas = document.createElement('canvas');
    canvas.width = size[0] * OVERLAY_DRAW_SCALE;
    canvas.height = size[1] * OVERLAY_DRAW_SCALE;
    let context = canvas.getContext('2d');
    let fill = (colour, x, y, width, height) => {
        context.fillStyle = colour;
        context.fillRect(x * OVERLAY_DRAW_SCALE, y * OVERLAY_DRAW_SCALE, width * OVERLAY_DRAW_SCALE, height * OVERLAY_DRAW_SCALE);
    };
    return { canvas, context, fill };
}

function drawSlot(fill, x, y) {
    let size = GUI_SLOT_SIZE;
    fill(GUI_COLOURS.slot, x, y, size, size);
    fill(GUI_COLOURS.shadow, x, y, size, 1);
    fill(GUI_COLOURS.shadow, x, y, 1, size);
    fill(GUI_COLOURS.highlight, x + 1, y + size - 1, size - 1, 1);
    fill(GUI_COLOURS.highlight, x + size - 1, y + 1, 1, size - 1);
}

function drawGridOverlay(fill) {
    for (let row = 0; row < 3; row++) {
        for (let column = 0; column < 3; column++) drawSlot(fill, column * GUI_SLOT_SIZE, row * GUI_SLOT_SIZE);
    }
}

function drawInventoryOverlay(fill, size) {
    fill(GUI_COLOURS.outline, 0, 0, size[0], size[1]);
    fill(GUI_COLOURS.panel, 1, 1, size[0] - 2, size[1] - 2);
    fill(GUI_COLOURS.highlight, 1, 1, size[0] - 3, 2);
    fill(GUI_COLOURS.highlight, 1, 1, 2, size[1] - 3);
    fill(GUI_COLOURS.shadow, 3, size[1] - 3, size[0] - 4, 2);
    fill(GUI_COLOURS.shadow, size[0] - 3, 3, 2, size[1] - 4);
    for (let row = 0; row < 4; row++) {
        let y = INVENTORY_BORDER + row * GUI_SLOT_SIZE + (row === 3 ? INVENTORY_GAP : 0);
        for (let column = 0; column < 9; column++) drawSlot(fill, INVENTORY_BORDER + column * GUI_SLOT_SIZE, y);
    }
}

function drawHotbarOverlay(fill, size) {
    let top = (size[1] - HOTBAR_HEIGHT) / 2;
    let left = 2;
    let width = HOTBAR_SLOTS * HOTBAR_PITCH;
    fill(GUI_COLOURS.outline, left - 1, top, width + 2, HOTBAR_HEIGHT);
    fill(GUI_COLOURS.hotbar, left, top + 1, width, HOTBAR_HEIGHT - 2);
    for (let slot = 0; slot < HOTBAR_SLOTS; slot++) {
        let x = left + slot * HOTBAR_PITCH;
        fill(GUI_COLOURS.hotbarSlot, x + 1, top + 1, HOTBAR_PITCH - 2, 1);
        fill(GUI_COLOURS.hotbarSlot, x + 1, top + HOTBAR_HEIGHT - 2, HOTBAR_PITCH - 2, 1);
        fill(GUI_COLOURS.hotbarSlot, x + 1, top + 1, 1, HOTBAR_HEIGHT - 2);
        fill(GUI_COLOURS.hotbarSlot, x + HOTBAR_PITCH - 2, top + 1, 1, HOTBAR_HEIGHT - 2);
    }
    let x = left + HOTBAR_SELECTED_SLOT * HOTBAR_PITCH + HOTBAR_PITCH / 2 - HOTBAR_SELECTION / 2;
    fill(GUI_COLOURS.outline, x, 0, HOTBAR_SELECTION, 1);
    fill(GUI_COLOURS.outline, x, HOTBAR_SELECTION - 1, HOTBAR_SELECTION, 1);
    fill(GUI_COLOURS.outline, x, 0, 1, HOTBAR_SELECTION);
    fill(GUI_COLOURS.outline, x + HOTBAR_SELECTION - 1, 0, 1, HOTBAR_SELECTION);
    fill(GUI_COLOURS.selection, x + 1, 1, HOTBAR_SELECTION - 2, 2);
    fill(GUI_COLOURS.selection, x + 1, HOTBAR_SELECTION - 3, HOTBAR_SELECTION - 2, 2);
    fill(GUI_COLOURS.selection, x + 1, 1, 2, HOTBAR_SELECTION - 2);
    fill(GUI_COLOURS.selection, x + HOTBAR_SELECTION - 3, 1, 2, HOTBAR_SELECTION - 2);
}

let guiOverlayImages = [];

function drawOverlaySource(overlay) {
    let { canvas, fill } = createOverlayCanvas(overlay.size);
    overlay.draw(fill, overlay.size);
    return canvas.toDataURL('image/png');
}

function getOverlayPosition(overlay) {
    return [
        (overlay.size[0] / 2 - overlay.modelAt[0]) * REFERENCE_IMAGE_UNITS_PER_PIXEL,
        (overlay.size[1] / 2 - overlay.modelAt[1]) * REFERENCE_IMAGE_UNITS_PER_PIXEL
    ];
}

function createGuiOverlays() {
    guiOverlayImages = GUI_OVERLAYS.map(overlay => {
        let image = new ReferenceImage({
            condition: () => !!Modes.display && getRoute() === 'block' &&
                !!displayReferenceObjects.active && displayReferenceObjects.active.id === overlay.referenceId,
            name: i18n(overlay.nameKey),
            source: drawOverlaySource(overlay),
            position: getOverlayPosition(overlay),
            size: overlay.size.map(value => value * REFERENCE_IMAGE_UNITS_PER_PIXEL),
            attached_side: 'south',
            layer: 'background',
            is_blueprint: true
        });
        image.ds_reference_id = overlay.referenceId;
        return image;
    });
    syncGuiOverlayRegistration();
    let listener = Blockbench.on(SYNC_EVENTS, guardListener('gui_overlays', syncGuiOverlayRegistration));
    return {
        delete() {
            listener.delete();
            for (let image of guiOverlayImages) {
                if (image.scope === 'built_in') {
                    if (!ReferenceImage.built_in.includes(image)) ReferenceImage.built_in.push(image);
                    image.delete(true);
                } else {
                    image.removed = true;
                }
            }
            guiOverlayImages = [];
            ReferenceImage.updateAll();
        }
    };
}

function syncGuiOverlayRegistration() {
    let wanted = getRoute() === 'block';
    for (let image of guiOverlayImages) {
        let listed = ReferenceImage.built_in.includes(image);
        if (wanted && !listed) {
            image.addAsBuiltIn();
        } else if (!wanted && listed) {
            ReferenceImage.built_in.remove(image);
            image.update();
        }
    }
}

// =========================
// Glow item frame texture
// =========================
let glowFrameTexture = null;

function getBlockbenchFrameTexturePath() {
    let models = cloneBlockbenchModels('frame');
    let board = models.find(model => isFrameBoardTexture(model.texture));
    return board ? board.texture : FALLBACK_FRAME_TEXTURE;
}

function createGlowFrameTexture() {
    let image = new Image();
    let cancelled = false;
    image.onload = () => {
        if (cancelled) return;
        let canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        let context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        context.globalCompositeOperation = 'source-atop';
        context.fillStyle = GLOW_FRAME_TINT;
        context.fillRect(0, 0, canvas.width, canvas.height);
        glowFrameTexture = canvas.toDataURL('image/png');
        Object.values(bedrockReferences).forEach(applyGlowTextureTo);
    };
    image.onerror = () => {
        if (!cancelled) console.warn(LOG_PREFIX, 'Could not read Blockbench\'s item frame texture for the glow item frame.');
    };
    image.src = getBlockbenchFrameTexturePath();
    return {
        delete() {
            cancelled = true;
            image.onload = image.onerror = null;
            glowFrameTexture = null;
        }
    };
}

function applyGlowTextureTo(reference) {
    let definition = getReferenceDefinition(reference);
    if (!definition || !definition.glow || !glowFrameTexture) return;
    for (let model of reference.models) {
        if (isFrameBoardTexture(model.texture)) model.texture = glowFrameTexture;
    }
    reference.model.traverse(object => {
        let map = object.isMesh && object.material && object.material.map;
        if (map && map.image && isFrameBoardTexture(map.image.src) && !map.image.src.startsWith('data:')) {
            map.image.src = glowFrameTexture;
            map.needsUpdate = true;
        }
    });
}

// =========================
// Skin variant
// =========================
function followPlayerVariant() {
    let player = displayReferenceObjects.refmodels.player;
    if (!player || typeof player.setModelVariant !== 'function') return { delete() {} };
    let hadOwn = Object.prototype.hasOwnProperty.call(player, 'setModelVariant');
    let original = player.setModelVariant;
    let active = true;
    let wrapper = function(variant) {
        let result = original.apply(this, arguments);
        let bedrock = getBedrockReference('bedrock_player');
        if (active && bedrock && bedrock.ds_prepared) {
            bedrock.constructor.prototype.setModelVariant.call(bedrock, variant);
        }
        return result;
    };
    player.setModelVariant = wrapper;
    return {
        delete() {
            active = false;
            if (player.setModelVariant !== wrapper) return;
            if (hadOwn) player.setModelVariant = original;
            else delete player.setModelVariant;
        }
    };
}

// =========================
// Options (preview only)
// =========================
function getActiveBedrockReference(slotId) {
    if (!isShowingSlot(slotId)) return null;
    let reference = displayReferenceObjects.active;
    return getReferenceDefinition(reference) ? reference : null;
}

function buildArmPoseOption(slotId) {
    let left = isLeftHandSlot(slotId);
    return {
        id: 'arm_pose',
        label: i18n('display_sensei.reference_option.arm_pose'),
        kind: 'select',
        value: getArmPose(slotId).id,
        choices: ARM_POSES.filter(pose => !left || pose.leftHand).map(pose => ({ id: pose.id, label: i18n(pose.labelKey) })),
        hint: i18n('display_sensei.reference_option.arm_pose_hint')
    };
}

function buildStandPoseOption() {
    return {
        id: 'stand_pose',
        label: i18n('display_sensei.reference_option.stand_pose'),
        kind: 'select',
        value: getStandPose(previewOptions.standPose).id,
        choices: STAND_POSES.map(pose => ({ id: pose.id, label: i18n(pose.labelKey) })),
        hint: i18n('display_sensei.reference_option.stand_pose_hint')
    };
}

function buildFrameRotationOption() {
    let choices = [];
    for (let step = 0; step < FRAME_ROTATION_STEPS; step++) {
        let degrees = step * FRAME_ROTATION_STEP;
        choices.push({ id: degrees, label: i18nFormat('display_sensei.frame_rotation.step', { deg: degrees }) });
    }
    return {
        id: 'frame_rotation',
        label: i18n('display_sensei.reference_option.frame_rotation'),
        kind: 'select',
        value: getFrameRotation(),
        choices,
        hint: i18n('display_sensei.reference_option.frame_rotation_hint')
    };
}

function buildFaceDimmingOption() {
    return {
        id: 'face_dimming',
        label: i18n('display_sensei.reference_option.face_dimming'),
        kind: 'toggle',
        value: previewOptions.faceDimming,
        hint: i18n('display_sensei.reference_option.face_dimming_hint')
    };
}

function buildFitPreviewOption() {
    return {
        id: 'fit_preview',
        label: i18n('display_sensei.reference_option.fit_preview'),
        kind: 'toggle',
        value: previewOptions.fitPreview,
        hint: i18n('display_sensei.reference_option.fit_preview_hint')
    };
}

function getReferenceOptions(slotId) {
    if (!isShowingSlot(slotId)) return null;
    let reference = getActiveBedrockReference(slotId);
    let kind = reference ? reference.ds_definition.kind : null;
    let options = [];
    if (kind === 'player' && THIRD_PERSON_SLOTS.includes(slotId)) options.push(buildArmPoseOption(slotId));
    if (kind === 'armor_stand_posed' && HOLDER_SLOTS.includes(slotId)) options.push(buildStandPoseOption());
    if (reference && reference.ds_definition.frame) options.push(buildFrameRotationOption());
    if (slotId === 'gui') {
        options.push(buildFaceDimmingOption());
        if (getProjectData().gui_fit_to_frame) options.push(buildFitPreviewOption());
    }
    return options.length ? options : null;
}

function findChoice(option, value) {
    let choice = option.choices.find(entry => String(entry.id) === String(value));
    if (!choice && option.id === 'stand_pose' && Number.isInteger(value)) choice = option.choices[value];
    return choice || null;
}

function setReferenceOption(slotId, optionId, value) {
    let options = getReferenceOptions(slotId) || [];
    let option = options.find(entry => entry.id === optionId);
    if (!option) return false;
    let reference = displayReferenceObjects.active;
    if (option.kind === 'select') {
        let choice = findChoice(option, value);
        if (!choice) return false;
        if (optionId === 'arm_pose') previewOptions.armPose[slotId] = choice.id;
        if (optionId === 'stand_pose') previewOptions.standPose = STAND_POSES.findIndex(pose => pose.id === choice.id);
        if (optionId === 'frame_rotation') previewOptions.frameStep = Number(choice.id) / FRAME_ROTATION_STEP;
        reference.updateBasePosition();
        syncBlockbenchPoseSlider(reference);
        if (optionId !== 'frame_rotation') aimThirdPersonCamera();
        return true;
    }
    if (typeof value !== 'boolean') return false;
    if (optionId === 'face_dimming') {
        previewOptions.faceDimming = value;
        refreshFaceDimming();
    }
    if (optionId === 'fit_preview') {
        previewOptions.fitPreview = value;
        applyGuiDisplayArea();
    }
    return true;
}

function canOpenSkinDialog() {
    let reference = displayReferenceObjects.active;
    return !!Modes.display && getRoute() === 'block' && !!reference && reference.id === 'bedrock_player' &&
        typeof changeDisplaySkin === 'function';
}

function openSkinDialog() {
    if (!canOpenSkinDialog()) return false;
    changeDisplaySkin();
    return true;
}

const SKIN_MENU_ENTRY_NAME = 'settings.display_skin';

function followSkinMenuEntry() {
    let menu = typeof Preview === 'function' && Preview.prototype ? Preview.prototype.menu : null;
    let structure = menu && Array.isArray(menu.structure) ? menu.structure : [];
    let entry = structure.find(item => isPlainObject(item) && item.name === SKIN_MENU_ENTRY_NAME);
    if (!entry || typeof entry.condition !== 'function') return { delete() {} };
    let original = entry.condition;
    let condition = function(...args) {
        if (getRoute() === 'block' && Modes.display && canOpenSkinDialog()) return true;
        return original.apply(this, args);
    };
    entry.condition = condition;
    return {
        delete() {
            if (entry.condition === condition) entry.condition = original;
        }
    };
}

// =========================
// Statue preset (used by bedrock_spec.js and block_route.js)
// =========================
const STATUE_CENTRE = [0, 8, 0];

function getStatueHandAreas(poseId) {
    let pose = STAND_POSES.find(entry => entry.id === poseId);
    if (!pose) return null;
    let parents = [{ pivot: STAND_BODY_PIVOT, rot: pose.body }];
    let areas = {};
    for (let slotId of THIRD_PERSON_SLOTS) {
        let left = isLeftHandSlot(slotId);
        let rig = THIRD_PERSON_RIGS.armor_stand[left ? 'left' : 'right'];
        let frame = composeHeldItemFrame(Object.assign({}, rig, { armRot: left ? pose.leftarm : pose.rightarm, parents }));
        let drawn = frame.clone().invert().multiply(translationMatrix(STATUE_CENTRE));
        let args = toSetBaseArgs(drawn);
        if (left) args = mirrorSetBaseArgs(args);
        areas[slotId] = {
            rotation: args.slice(3, 6).map(roundToFour),
            translation: args.slice(0, 3).map(roundToFour),
            scale: [1, 1, 1]
        };
    }
    return areas;
}

// =========================
// Install
// =========================
function installBedrockReferences() {
    let ReferenceClass = findReferenceClass();
    if (!ReferenceClass) {
        console.warn(LOG_PREFIX, 'Blockbench\'s reference model class was not found; the Bedrock reference models are not available.');
        return { delete() {} };
    }
    previewOptions = createPreviewOptions();
    let hooks = createDeletables([
        createGlowFrameTexture,
        () => registerBedrockReferences(ReferenceClass),
        splitRememberedReferences,
        wrapBedrockReferenceBar,
        createGuiOverlays,
        () => wrapMethod(DisplayMode, 'groundAnimation', animateBedrockGround),
        () => wrapMethod(DisplayMode, 'updateDisplayBase', updateBedrockDisplayBase),
        followFaceDimming,
        followPlayerVariant,
        followGroundRestHeight,
        followSkinMenuEntry
    ]);
    try {
        showBedrockReferencesNow();
    } catch (error) {
        console.warn(LOG_PREFIX, 'Could not show the Bedrock reference models:', error);
    }
    return {
        delete() {
            let slotId = Modes.display ? DisplayMode.display_slot : null;
            let blockbenchIds = slotId ? getBlockbenchIdsForSlot(slotId) : [];
            if (getReferenceDefinition(displayReferenceObjects.active)) displayReferenceObjects.clear();
            hooks.delete();
            blockbenchIdsBySlot = {};
            unmappedBlockbenchIds = new Set();
            savedSlotCamera = null;
            resetGroundClock();
            if (slotId) showBlockbenchReferencesAgain(slotId, blockbenchIds);
        }
    };
}

registerModuleInstaller('bedrock_references', installBedrockReferences);
