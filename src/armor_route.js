// =========================
// Armor route (back end)
// =========================

// =========================
// Wear slots and bone names
// =========================
const DEFAULT_WEARER_ID = 'player_wide';

function isArmorSlotId(slotId) {
    return typeof slotId === 'string' && slotId.startsWith('slot.armor.') && !!findWearSlot(slotId);
}

const ARMOR_BONE_NAMES = WEAR_SLOTS
    .filter(slot => isArmorSlotId(slot.id))
    .reduce((names, slot) => names.concat(slot.bones.filter(name => !names.includes(name))), []);

const CANONICAL_WEARER_BONES = Object.values(BONE_ALIASES)
    .reduce((names, name) => names.includes(name) ? names : names.concat(name), ARMOR_BONE_NAMES.slice());

function matchWearerBoneName(name) {
    if (typeof name !== 'string' || !name) return null;
    let lower = name.toLowerCase();
    let exact = CANONICAL_WEARER_BONES.find(canonical => canonical.toLowerCase() === lower);
    if (exact) return { name: exact, exact: true };
    let alias = findCanonicalWearerBone(name);
    return alias ? { name: alias, exact: false } : null;
}

const ITEM_SLOT_BONES = {
    'slot.armor.head': 'head',
    'slot.weapon.offhand': 'leftItem'
};

function getItemSlotBone(slotId) {
    return ITEM_SLOT_BONES[slotId] || null;
}

function parseBoneBinding(binding) {
    if (typeof binding !== 'string' || !binding.trim()) return { kind: 'none', hand: false };
    if (/item_slot_to_bone_name/i.test(binding)) return { kind: 'item_slot', hand: true };
    let names = Array.from(binding.matchAll(/'([\w.]+)'/g), match => match[1]);
    let bones = names.filter(name => name !== 'main_hand' && name !== 'off_hand');
    let hand = bones.length > 0 && bones.every(name => /^(right|left)item$/i.test(name));
    if (bones.length === 1 && names.length === 1) return { kind: 'bone', target: bones[0], hand };
    return { kind: 'other', hand };
}

function getBindingTarget(binding, slotId) {
    if (binding.kind === 'bone') return binding.target;
    if (binding.kind === 'item_slot') return getItemSlotBone(slotId);
    return null;
}

// =========================
// Reading the model
// =========================
function readModelRig(project) {
    let rig;
    try {
        rig = analyseAttachableRig(project);
    } catch (error) {
        console.warn(LOG_PREFIX, 'Could not read the bones of this model:', error);
        return null;
    }
    if (!rig || !Array.isArray(rig.bones)) return null;
    let byName = new Map();
    let bones = rig.bones.map(bone => {
        let entry = Object.assign({}, bone, { parsedBinding: parseBoneBinding(bone.binding) });
        byName.set(String(bone.name).toLowerCase(), entry);
        return entry;
    });
    return { bones, byName };
}

function findModelParent(rig, bone) {
    return typeof bone.parent === 'string' ? rig.byName.get(bone.parent.toLowerCase()) || null : null;
}

function readModelWear(rig) {
    let wear = { armorBones: new Set(), boundTargets: [], handBound: false };
    if (!rig) return wear;
    for (let bone of rig.bones) {
        let binding = bone.parsedBinding;
        if (binding.hand) wear.handBound = true;
        if (binding.kind === 'bone' && !binding.hand) wear.boundTargets.push(binding.target);
        if (binding.kind !== 'none') continue;
        let match = matchWearerBoneName(bone.name);
        if (match && ARMOR_BONE_NAMES.includes(match.name)) wear.armorBones.add(match.name);
    }
    return wear;
}

function inferSlotsFromBones(names) {
    let arms = names.has('rightArm') || names.has('leftArm');
    let legs = names.has('rightLeg') || names.has('leftLeg');
    let slots = [];
    if (names.has('head') || names.has('hat')) slots.push('slot.armor.head');
    if (arms || (names.has('body') && !legs)) slots.push('slot.armor.chest');
    if (legs) slots.push(names.has('body') && !arms ? 'slot.armor.legs' : 'slot.armor.feet');
    return slots;
}

function findSlotsInParentSetup(script) {
    if (typeof script !== 'string' || !script) return [];
    return WEAR_SLOTS.filter(slot => {
        if (!slot.layerVariable) return false;
        let name = slot.layerVariable.split('.').pop();
        return new RegExp(`\\b(?:variable|v)\\.${name}\\s*=(?!=)`, 'i').test(script);
    }).map(slot => slot.id);
}

function readBlockbenchParentSetup(project) {
    let manager = project && project.BedrockEntityManager;
    let entity = manager && manager.client_entity;
    if (!entity || entity.type !== 'attachable' || !entity.description) return null;
    let scripts = entity.description.scripts;
    return isPlainObject(scripts) && typeof scripts.parent_setup === 'string' ? scripts.parent_setup : null;
}

function readAttachableSetup(project) {
    let wear = getLinkedWearInfo(project);
    if (wear && (wear.renderControllers.length || wear.parentSetup !== null)) {
        return { found: true, parentSetup: wear.parentSetup };
    }
    let manager = project && project.BedrockEntityManager;
    let entity = manager && manager.client_entity;
    if (entity && entity.type === 'attachable') return { found: true, parentSetup: readBlockbenchParentSetup(project) };
    return { found: false, parentSetup: null };
}

// =========================
// What the model is (getWearInfo)
// =========================
function createUnknownWearInfo() {
    return { kind: 'unknown', slot: null, slots: [], method: null, source: null };
}

function isWearableProject(project) {
    return !!project && !!project.format && project.format.id === ENTITY_FORMAT_ID && getBedrockEntityKind(project) !== 'entity';
}

function kindFromBones(modelWear) {
    if (modelWear.handBound) return { kind: 'worn', method: 'binding' };
    if (modelWear.armorBones.size) return { kind: 'armor', method: 'name' };
    if (modelWear.boundTargets.length) return { kind: 'worn', method: 'binding' };
    return { kind: 'armor', method: null };
}

function wearInfoFromWearableSlot(slot, modelWear) {
    let wearSlot = findWearSlot(slot) ? slot : null;
    if (slot === 'slot.weapon.offhand' || slot === 'slot.weapon.mainhand') {
        return { kind: 'held', slot: wearSlot, slots: wearSlot ? [wearSlot] : [], method: modelWear.handBound ? 'binding' : null, source: 'pack' };
    }
    if (isArmorSlotId(slot)) {
        return Object.assign(kindFromBones(modelWear), { slot, slots: [slot], source: 'pack' });
    }
    let bound = modelWear.handBound || modelWear.boundTargets.length > 0;
    return { kind: 'worn', slot: null, slots: [], method: bound ? 'binding' : null, source: 'pack' };
}

function wearInfoFromLayerSlots(slots, modelWear, source) {
    return Object.assign(kindFromBones(modelWear), { slot: slots[0], slots, source });
}

function wearInfoFromBones(modelWear) {
    if (!modelWear.handBound && modelWear.armorBones.size >= 2) {
        let slots = inferSlotsFromBones(modelWear.armorBones);
        return { kind: 'armor', slot: slots[0] || null, slots, method: 'name', source: 'bones' };
    }
    if (modelWear.handBound) return { kind: 'held', slot: null, slots: [], method: 'binding', source: 'bones' };
    let boundArmor = new Set(modelWear.boundTargets
        .map(target => matchWearerBoneName(target))
        .filter(match => match && match.exact && ARMOR_BONE_NAMES.includes(match.name))
        .map(match => match.name));
    if (boundArmor.size) {
        let slots = inferSlotsFromBones(boundArmor);
        return { kind: 'worn', slot: slots[0] || null, slots, method: 'binding', source: 'bones' };
    }
    return createUnknownWearInfo();
}

function detectWearInfo(project, modelWear) {
    let wear = getLinkedWearInfo(project);
    if (wear && wear.slot) return wearInfoFromWearableSlot(wear.slot, modelWear);
    let packSlots = wear ? findSlotsInParentSetup(wear.parentSetup) : [];
    if (packSlots.length) return wearInfoFromLayerSlots(packSlots, modelWear, 'pack');
    let fileSlots = findSlotsInParentSetup(readBlockbenchParentSetup(project));
    if (fileSlots.length) return wearInfoFromLayerSlots(fileSlots, modelWear, 'file');
    return wearInfoFromBones(modelWear);
}

function getWearInfo(project = Project) {
    if (!isWearableProject(project)) return createUnknownWearInfo();
    let found = detectWearInfo(project, readModelWear(readModelRig(project)));
    let saved = getProjectData(project).armor;
    if (saved.kind === 'auto') return found;
    return {
        kind: saved.kind,
        slot: saved.slot || found.slot,
        slots: saved.slot ? [saved.slot] : found.slots,
        method: found.method,
        source: 'saved'
    };
}

function isArmorProject(project = Project) {
    return getWearInfo(project).kind === 'armor';
}

function isArmorEditAllowed() {
    return !!Project && getRoute() === 'attachable' && !Modes.animate;
}

function recordArmorDataEdit(undoLabel, change) {
    if (!Project || getRoute() !== 'attachable' || Undo.current_save) return false;
    let before = JSON.stringify(getProjectData().armor);
    Undo.initEdit({ [PROJECT_DATA_UNDO_ASPECT]: true });
    try {
        updateProjectData(change);
    } catch (error) {
        Undo.cancelEdit(true);
        throw error;
    }
    if (JSON.stringify(getProjectData().armor) === before) {
        Undo.cancelEdit(false);
    } else {
        Undo.finishEdit(undoLabel);
    }
    return true;
}

function setWearKind(kind, slot = null) {
    if (!PROJECT_ARMOR_KINDS.includes(kind) || (slot !== null && !findWearSlot(slot))) return false;
    let done = recordArmorDataEdit(i18n('display_sensei.undo.armor_kind'), data => {
        data.armor.kind = kind;
        data.armor.slot = kind === 'auto' ? null : slot;
    });
    if (done) {
        syncArmorSafeMode(Project, true);
        validateOpenProject();
    }
    return done;
}

// =========================
// Safe mode
// =========================
let switchedPreviewModes = new WeakSet();
let autoSwitchedProjects = new WeakSet();
let lastWearChoices = new WeakMap();

function readWearChoice(project) {
    let armor = getProjectData(project).armor;
    return `${armor.kind}|${armor.slot || ''}`;
}

function setPreviewMode(project, mode) {
    let modeSelect = BarItems.bedrock_animation_mode;
    if (project === Project && modeSelect && (mode === 'entity' || Modes.animate)) {
        modeSelect.change(mode);
    } else {
        project.bedrock_animation_mode = mode;
        if (project === Project && modeSelect) modeSelect.set(mode);
    }
}

function syncArmorSafeMode(project = Project, explicit = false) {
    if (!isWearableProject(project)) return false;
    lastWearChoices.set(project, readWearChoice(project));
    let mode = project.bedrock_animation_mode;
    if (isArmorProject(project)) {
        if (mode !== 'attachable_first' || (!explicit && autoSwitchedProjects.has(project))) return false;
        setPreviewMode(project, 'entity');
        switchedPreviewModes.add(project);
        autoSwitchedProjects.add(project);
        return true;
    }
    if (!explicit || !switchedPreviewModes.has(project) || mode !== 'entity') return false;
    setPreviewMode(project, 'attachable_first');
    switchedPreviewModes.delete(project);
    return true;
}

function restoreSwitchedPreviewModes() {
    for (let project of ModelProject.all) {
        if (switchedPreviewModes.has(project) && project.bedrock_animation_mode === 'entity') setPreviewMode(project, 'attachable_first');
    }
    switchedPreviewModes = new WeakSet();
    autoSwitchedProjects = new WeakSet();
    lastWearChoices = new WeakMap();
}

function checkArmorSafeMode(project) {
    if (!isWearableProject(project)) return;
    if (syncArmorSafeMode(project)) {
        if (project === Project) validateOpenProject();
    } else if (project.bedrock_animation_mode === 'attachable_first' && getWearInfo(project).kind === 'unknown') {
        requestPackLinkScan(project);
    }
}

function wrapInitEntity() {
    if (typeof BedrockEntityManager === 'undefined') return { delete() {} };
    return wrapMethod(BedrockEntityManager.prototype, 'initEntity', function(original, args) {
        let result = original.apply(this, args);
        try {
            checkArmorSafeMode(this.project);
        } catch (error) {
            console.warn(LOG_PREFIX, 'The armor safe mode failed:', error);
        }
        return result;
    });
}

function onArmorProjectSelected(event) {
    checkArmorSafeMode(event && event.project);
}

function onArmorProjectParsed() {
    checkArmorSafeMode(Project);
}

function onArmorPackScanned(project) {
    if (syncArmorSafeMode(project) && project === Project) validateOpenProject();
}

function onArmorUndoRedo() {
    if (!Project || !lastWearChoices.has(Project) || lastWearChoices.get(Project) === readWearChoice(Project)) return;
    syncArmorSafeMode(Project, true);
    validateOpenProject();
}

function validateOpenProject() {
    if (typeof Validator !== 'undefined' && Project) Validator.validate();
}

function wrapBindingCheck() {
    let check = typeof Validator !== 'undefined' ? Validator.checks.find(entry => entry.id === 'bedrock_binding') : null;
    if (!check || typeof check.run !== 'function') return { delete() {} };
    let wrapper = wrapMethod(check, 'run', function(original, args) {
        if (isArmorProject()) return undefined;
        return original.apply(this, args);
    });
    validateOpenProject();
    return {
        delete() {
            wrapper.delete();
            validateOpenProject();
        }
    };
}

// =========================
// Small helpers
// =========================
const WEAR_POSITION_EPSILON = 0.001;
const WEAR_FACE_EPSILON = 0.005;
const BOUND_ROOT_ANCHOR = [0, 24, 0];

function subtractVectors(a, b) {
    return a.map((value, index) => value - b[index]);
}

function vectorLength(vector) {
    return Math.hypot(vector[0], vector[1], vector[2]);
}

function isZeroRotation(rotation) {
    return !Array.isArray(rotation) || rotation.every(value => Math.abs(value) < WEAR_POSITION_EPSILON);
}

function formatArmorNumber(value) {
    let rounded = Math.round(value * 1000) / 1000;
    return String(rounded === 0 ? 0 : rounded);
}

function formatArmorVector(vector) {
    return '[' + vector.map(formatArmorNumber).join(', ') + ']';
}

// =========================
// Fit check
// =========================
const ARMOR_CHECK_TEXT_KEYS = {
    nothing_follows: 'display_sensei.armor_check.nothing_follows',
    slot_empty: 'display_sensei.armor_check.slot_empty',
    slot_mix: 'display_sensei.armor_check.slot_mix',
    name_alias: 'display_sensei.armor_check.name_alias',
    pivot_delta: 'display_sensei.armor_check.pivot_delta',
    pivot_wearer: 'display_sensei.armor_check.pivot_wearer',
    reserved_marker: 'display_sensei.armor_check.reserved_marker',
    nested_match: 'display_sensei.armor_check.nested_match',
    bound_offset: 'display_sensei.armor_check.bound_offset',
    item_slot_binding: 'display_sensei.armor_check.item_slot_binding',
    binding_version: 'display_sensei.armor_check.binding_version',
    clearance_inside: 'display_sensei.armor_check.clearance_inside',
    clearance_flicker: 'display_sensei.armor_check.clearance_flicker',
    clipping: 'display_sensei.armor_check.clipping',
    vanilla_overlap: 'display_sensei.armor_check.vanilla_overlap',
    no_parent_setup: 'display_sensei.armor_check.no_parent_setup',
    target_missing: 'display_sensei.armor_check.target_missing',
    wearer_hides_armor: 'display_sensei.armor_check.wearer_hides_armor'
};

const ARMOR_SEVERITY_ORDER = ['error', 'warning', 'info'];

function createArmorCheck(type, key, severity, values, bones, options = {}) {
    return {
        check: {
            id: key ? `${type}:${key}` : type,
            severity,
            textKey: ARMOR_CHECK_TEXT_KEYS[type],
            values,
            bones,
            fixes: options.fixes || [],
            approximate: !!options.approximate
        },
        fix: options.fix || null
    };
}

function createCheckContext(slot, wearer, rig) {
    let baby = isBabyWearer(wearer);
    let targets = new Map();
    for (let bone of rig.bones) {
        if (bone.parsedBinding.kind !== 'none') continue;
        let key = findRigBoneName(wearer, bone.name);
        if (key) targets.set(bone, key);
    }
    return {
        slot,
        wearer,
        wearerLabel: i18n(wearer.label),
        rig,
        targets,
        flatArmor: baby ? FLAT_ARMOR_BABY : FLAT_ARMOR
    };
}

function isBabyWearer(wearer) {
    return wearer.baby === true;
}

function findVanillaArmorPivot(flatArmor, name) {
    for (let piece of Object.values(flatArmor)) {
        let key = findRigBoneName(piece, name);
        if (key && piece.bones[key].pivot) return piece.bones[key].pivot;
    }
    return null;
}

function checkSlotCoverage(context, results) {
    let { slot, rig } = context;
    let followed = new Set();
    for (let bone of rig.bones) {
        let name = bone.parsedBinding.kind === 'none' ? bone.name : getBindingTarget(bone.parsedBinding, slot.id);
        let match = matchWearerBoneName(name);
        if (match && match.exact && ARMOR_BONE_NAMES.includes(match.name)) followed.add(match.name);
    }
    let slotBones = slot.bones.join(', ');
    if (!followed.size) {
        results.push(createArmorCheck('nothing_follows', null, 'error', { bones: slotBones }, []));
        return;
    }
    if (!slot.bones.some(name => followed.has(name))) {
        results.push(createArmorCheck('slot_empty', null, 'warning', { bones: slotBones }, []));
    }
    let others = Array.from(followed).filter(name => !slot.bones.includes(name));
    if (others.length) {
        results.push(createArmorCheck('slot_mix', null, 'info', { bones: others.join(', ') }, others));
    }
}

function checkBoneNames(context, results) {
    let { rig } = context;
    for (let bone of rig.bones) {
        if (bone.parsedBinding.kind !== 'none' || context.targets.has(bone)) continue;
        let match = matchWearerBoneName(bone.name);
        if (!match || match.exact) continue;
        if (rig.byName.has(match.name.toLowerCase())) continue;
        results.push(createArmorCheck('name_alias', bone.name, 'warning', { bone: bone.name, target: match.name }, [bone.name], {
            fixes: ['rename'],
            fix: { uuid: bone.uuid, name: match.name }
        }));
    }
}

function findStandardArmorPivot(name) {
    let vanilla = findVanillaArmorPivot(FLAT_ARMOR, name);
    if (vanilla) return vanilla;
    let player = findWearerRig(DEFAULT_WEARER_ID);
    let key = findRigBoneName(player, name);
    return key && Array.isArray(player.bones[key].pivot) ? player.bones[key].pivot : null;
}

function isSamePivot(a, b) {
    return Array.isArray(a) && Array.isArray(b) && vectorLength(subtractVectors(a, b)) <= WEAR_POSITION_EPSILON;
}

function findModelChildren(rig, bone) {
    let name = String(bone.name).toLowerCase();
    return rig.bones.filter(child => typeof child.parent === 'string' && child.parent.toLowerCase() === name);
}

function isPivotDrawn(context, bone) {
    if (bone.draws !== false) return true;
    return findModelChildren(context.rig, bone)
        .some(child => child.parsedBinding.kind === 'none' && !context.targets.has(child) && isPivotDrawn(context, child));
}

function checkPivots(context, results) {
    let { wearer, wearerLabel, flatArmor } = context;
    for (let [bone, key] of context.targets) {
        if (!isPivotDrawn(context, bone)) continue;
        let wearerPivot = wearer.bones[key].pivot;
        if (!Array.isArray(wearerPivot) || !Array.isArray(bone.pivot)) continue;
        let delta = subtractVectors(wearerPivot, bone.pivot);
        if (vectorLength(delta) <= WEAR_POSITION_EPSILON) continue;
        let standardPivot = findStandardArmorPivot(bone.name);
        let values = {
            bone: bone.name,
            target: key,
            wearer: wearerLabel,
            pivot: formatArmorVector(bone.pivot),
            wearer_pivot: formatArmorVector(wearerPivot),
            delta: formatArmorVector(delta),
            standard_pivot: standardPivot ? formatArmorVector(standardPivot) : ''
        };
        if (isSamePivot(standardPivot, bone.pivot) || isSamePivot(findVanillaArmorPivot(flatArmor, bone.name), bone.pivot)) {
            results.push(createArmorCheck('pivot_wearer', bone.name, 'info', values, [bone.name], { approximate: true }));
        } else {
            results.push(createArmorCheck('pivot_delta', bone.name, 'warning', values, [bone.name], {
                approximate: true,
                fixes: standardPivot ? ['snap_pivot_keep', 'snap_pivot_move'] : [],
                fix: standardPivot ? { uuid: bone.uuid, pivot: standardPivot.slice() } : null
            }));
        }
    }
}

function checkReservedNames(context, results) {
    if (!RESERVED_MARKER_WEARERS.includes(context.wearer.id)) return;
    let reserved = RESERVED_MARKER_BONES.map(name => name.toLowerCase());
    for (let bone of context.rig.bones) {
        if (!reserved.includes(String(bone.name).toLowerCase())) continue;
        results.push(createArmorCheck('reserved_marker', bone.name, 'info', { bone: bone.name, wearer: context.wearerLabel }, [bone.name]));
    }
}

function checkNestedBones(context, results) {
    let { rig } = context;
    for (let bone of context.targets.keys()) {
        let ancestor = findModelParent(rig, bone);
        while (ancestor && !context.targets.has(ancestor)) ancestor = findModelParent(rig, ancestor);
        if (!ancestor) continue;
        results.push(createArmorCheck('nested_match', bone.name, 'info', { bone: bone.name, parent: ancestor.name }, [bone.name, ancestor.name], {
            fixes: ['flatten'],
            fix: { uuid: bone.uuid }
        }));
    }
}

function checkBindings(context, results) {
    let { slot, wearer, rig } = context;
    let anyBinding = false;
    for (let bone of rig.bones) {
        let binding = bone.parsedBinding;
        if (binding.kind === 'none') continue;
        anyBinding = true;
        if (binding.kind === 'item_slot' && slot.id !== 'slot.armor.head') {
            results.push(createArmorCheck('item_slot_binding', bone.name, 'info', { bone: bone.name }, [bone.name], { approximate: true }));
        }
        let target = getBindingTarget(binding, slot.id);
        if (!target) continue;
        let key = findRigBoneName(wearer, target);
        if (!key) {
            results.push(createArmorCheck('target_missing', bone.name, 'info', { bone: bone.name, target, wearer: context.wearerLabel }, [bone.name], { approximate: true }));
            continue;
        }
        let parent = findModelParent(rig, bone);
        let anchor = parent ? parent.pivot : BOUND_ROOT_ANCHOR;
        if (!Array.isArray(anchor) || !Array.isArray(wearer.bones[key].pivot)) continue;
        let offset = subtractVectors(wearer.bones[key].pivot, anchor);
        if (vectorLength(offset) <= WEAR_POSITION_EPSILON) continue;
        results.push(createArmorCheck('bound_offset', bone.name, 'warning', { bone: bone.name, target: key, offset: formatArmorVector(offset) }, [bone.name], {
            approximate: true,
            fixes: ['wrap_pivot_parent'],
            fix: { uuid: bone.uuid, pivot: wearer.bones[key].pivot.slice() }
        }));
    }
    if (anyBinding) results.push(createArmorCheck('binding_version', null, 'info', {}, []));
}

function getOuterLayerInflate(wearer, key) {
    let layers = wearer.outerLayers || {};
    let name = Object.keys(layers).find(entry => entry.toLowerCase() === key.toLowerCase());
    return name && typeof layers[name] === 'number' ? layers[name] : null;
}

function getSurfaceInflate(wearerCube, outer) {
    let own = typeof wearerCube.inflate === 'number' ? wearerCube.inflate : 0;
    return outer === null ? own : Math.max(own, outer);
}

function getWearerBaseCubes(wearerBone) {
    if (wearerBone.neverRender) return [];
    let cubes = (wearerBone.cubes || []).filter(cube => isZeroRotation(cube.rotation));
    let solid = cubes.filter(cube => !cube.layer);
    return solid.length ? solid : cubes;
}

function boxFromOriginSize(cube, inflate = 0, offset = [0, 0, 0]) {
    let min = cube.origin.map((value, axis) => value - inflate + offset[axis]);
    let max = cube.origin.map((value, axis) => value + cube.size[axis] + inflate + offset[axis]);
    return { min, max };
}

function boxFromModelCube(cube, offset) {
    let inflate = typeof cube.inflate === 'number' ? cube.inflate : 0;
    let min = cube.from.map((value, axis) => Math.min(value, cube.to[axis]) - inflate + offset[axis]);
    let max = cube.from.map((value, axis) => Math.max(value, cube.to[axis]) + inflate + offset[axis]);
    return { min, max };
}

function growBox(box, amount) {
    return { min: box.min.map(value => value - amount), max: box.max.map(value => value + amount) };
}

function mergeBoxes(boxes) {
    return {
        min: [0, 1, 2].map(axis => Math.min(...boxes.map(box => box.min[axis]))),
        max: [0, 1, 2].map(axis => Math.max(...boxes.map(box => box.max[axis])))
    };
}

function findWearerOverlayBoxes(wearer, key) {
    let bones = wearer.overlay && wearer.overlay.bones;
    let name = bones ? findRigBoneName({ bones }, key) : null;
    let bone = name ? bones[name] : null;
    if (!bone || bone.neverRender || !Array.isArray(bone.pivot)) return [];
    let offset = subtractVectors(wearer.bones[key].pivot, bone.pivot);
    return (bone.cubes || []).filter(cube => isZeroRotation(cube.rotation)).map(cube => boxFromOriginSize(cube, cube.inflate || 0, offset));
}

function getSurfaceReach(surface, base) {
    return Math.max(0, ...[0, 1, 2].map(axis => Math.max(base.min[axis] - surface.min[axis], surface.max[axis] - base.max[axis])));
}

function getWrappedAxes(box, inner) {
    return [0, 1, 2].map(axis => box.min[axis] <= inner.min[axis] + WEAR_FACE_EPSILON && box.max[axis] >= inner.max[axis] - WEAR_FACE_EPSILON);
}

function countWrappedAxes(box, inner) {
    return getWrappedAxes(box, inner).filter(Boolean).length;
}

function boxesIntersect(a, b) {
    for (let axis = 0; axis < 3; axis++) {
        if (a.min[axis] >= b.max[axis] - WEAR_FACE_EPSILON || a.max[axis] <= b.min[axis] + WEAR_FACE_EPSILON) return false;
    }
    return true;
}

function compareWrappingFaces(box, surface) {
    let result = null;
    for (let axis = 0; axis < 3; axis++) {
        for (let reach of [surface.min[axis] - box.min[axis], box.max[axis] - surface.max[axis]]) {
            if (reach < -WEAR_FACE_EPSILON) return 'inside';
            if (Math.abs(reach) <= WEAR_FACE_EPSILON) result = 'flicker';
        }
    }
    return result;
}

function boxContains(outer, inner) {
    return [0, 1, 2].every(axis => outer.min[axis] <= inner.min[axis] + WEAR_FACE_EPSILON && outer.max[axis] >= inner.max[axis] - WEAR_FACE_EPSILON);
}

function isCoveredBox(box, boxes, base, surface) {
    return boxes.some(other => other !== box && boxContains(other, box) && countWrappedAxes(other, base) === 3 && compareWrappingFaces(other, surface) === null);
}

function haveSharedFace(a, b) {
    for (let axis = 0; axis < 3; axis++) {
        if (Math.abs(a.min[axis] - b.min[axis]) <= WEAR_FACE_EPSILON) return true;
        if (Math.abs(a.max[axis] - b.max[axis]) <= WEAR_FACE_EPSILON) return true;
    }
    return false;
}

function findVanillaNeighbourBoxes(context, key) {
    let { slot, wearer, flatArmor } = context;
    let neighbours = [];
    for (let other of WEAR_SLOTS) {
        if (other.id === slot.id || !isArmorSlotId(other.id) || !other.flatPiece) continue;
        let piece = flatArmor[other.flatPiece];
        let pieceKey = piece ? findRigBoneName(piece, key) : null;
        if (!pieceKey) continue;
        let pieceBone = piece.bones[pieceKey];
        let offset = subtractVectors(wearer.bones[key].pivot, pieceBone.pivot);
        let boxes = (pieceBone.cubes || []).map(cube => boxFromOriginSize(cube, cube.inflate || 0, offset));
        if (boxes.length) neighbours.push({ slot: other, boxes, approximate: !!piece.approximate });
    }
    return neighbours;
}

function checkClearance(context, results) {
    let { wearer, wearerLabel } = context;
    for (let [bone, key] of context.targets) {
        if (!isZeroRotation(bone.rotation) || !Array.isArray(bone.cubes)) continue;
        if (!Array.isArray(wearer.bones[key].pivot) || !Array.isArray(bone.pivot)) continue;
        let offset = subtractVectors(wearer.bones[key].pivot, bone.pivot);
        let approximate = vectorLength(offset) > WEAR_POSITION_EPSILON;
        let outer = getOuterLayerInflate(wearer, key);
        let wearerCubes = getWearerBaseCubes(wearer.bones[key]);
        let overlayBoxes = findWearerOverlayBoxes(wearer, key);
        let surfaceOf = wearerCube => mergeBoxes([growBox(boxFromOriginSize(wearerCube), getSurfaceInflate(wearerCube, outer))].concat(overlayBoxes));
        let neighbours = findVanillaNeighbourBoxes(context, key);
        let clearance = null;
        let clipping = false;
        let overlaps = new Map();
        let boxes = bone.cubes.filter(cube => isZeroRotation(cube.rotation)).map(cube => boxFromModelCube(cube, offset));
        for (let box of boxes) {
            for (let wearerCube of wearerCubes) {
                let base = boxFromOriginSize(wearerCube);
                let surface = surfaceOf(wearerCube);
                if (isCoveredBox(box, boxes, base, surface)) continue;
                let axes = getWrappedAxes(box, base);
                let wrapped = axes.filter(Boolean).length;
                if (wrapped === 3) {
                    let result = compareWrappingFaces(box, surface);
                    if (result === 'inside' || (result === 'flicker' && !clearance)) clearance = result;
                    for (let neighbour of neighbours) {
                        let sharesFace = neighbour.boxes.some(vanillaBox => countWrappedAxes(vanillaBox, base) === 3 && haveSharedFace(box, vanillaBox));
                        if (sharesFace) overlaps.set(neighbour.slot.id, neighbour);
                    }
                } else if (wrapped === 2 && axes[1] && boxesIntersect(box, surface)) {
                    clipping = true;
                }
            }
        }
        let layer = Math.max(0, ...wearerCubes.map(wearerCube => getSurfaceReach(surfaceOf(wearerCube), boxFromOriginSize(wearerCube))));
        let values = { bone: bone.name, target: key, wearer: wearerLabel, layer: formatArmorNumber(layer) };
        if (clearance) {
            results.push(createArmorCheck(clearance === 'inside' ? 'clearance_inside' : 'clearance_flicker', bone.name, 'warning', values, [bone.name], { approximate }));
        }
        if (clipping) results.push(createArmorCheck('clipping', bone.name, 'info', values, [bone.name], { approximate }));
        for (let neighbour of overlaps.values()) {
            let overlapValues = Object.assign({}, values, { slot: i18n(neighbour.slot.label) });
            results.push(createArmorCheck('vanilla_overlap', `${bone.name}:${neighbour.slot.id}`, 'info', overlapValues, [bone.name], {
                approximate: approximate || neighbour.approximate
            }));
        }
    }
}

function checkParentSetup(context, results) {
    let setup = readAttachableSetup(Project);
    if (!setup.found || !context.slot.layerVariable) return;
    if (findSlotsInParentSetup(setup.parentSetup).includes(context.slot.id)) return;
    results.push(createArmorCheck('no_parent_setup', null, 'info', { variable: context.slot.layerVariable }, []));
}

function checkMissingTargets(context, results) {
    let { slot, wearer, rig } = context;
    let missing = (wearer.missing || []).map(name => name.toLowerCase());
    for (let bone of rig.bones) {
        if (bone.parsedBinding.kind !== 'none') continue;
        let match = matchWearerBoneName(bone.name);
        if (!match || !match.exact || !slot.bones.includes(match.name)) continue;
        if (findRigBoneName(wearer, match.name) && !missing.includes(match.name.toLowerCase())) continue;
        results.push(createArmorCheck('target_missing', bone.name, 'info', { bone: bone.name, target: match.name, wearer: context.wearerLabel }, [bone.name], { approximate: true }));
    }
}

function checkWearerHidesArmor(context, results) {
    if (context.wearer.hideArmor !== true) return;
    results.push(createArmorCheck('wearer_hides_armor', null, 'info', { wearer: context.wearerLabel }, [], { approximate: true }));
}

function collectArmorChecks(slotId, wearerId) {
    let slot = findWearSlot(slotId);
    if (!slot || !isArmorSlotId(slotId) || !Project || getRoute() !== 'attachable') return [];
    let wearer = findWearerRig(wearerId) || findWearerRig(DEFAULT_WEARER_ID);
    let rig = readModelRig(Project);
    if (!wearer || !rig) return [];
    let context = createCheckContext(slot, wearer, rig);
    let results = [];
    checkSlotCoverage(context, results);
    checkBoneNames(context, results);
    checkPivots(context, results);
    checkBindings(context, results);
    checkClearance(context, results);
    checkNestedBones(context, results);
    checkReservedNames(context, results);
    checkMissingTargets(context, results);
    checkWearerHidesArmor(context, results);
    checkParentSetup(context, results);
    let unique = [];
    for (let result of results) {
        if (!unique.some(other => other.check.id === result.check.id)) unique.push(result);
    }
    return unique.sort((a, b) => ARMOR_SEVERITY_ORDER.indexOf(a.check.severity) - ARMOR_SEVERITY_ORDER.indexOf(b.check.severity));
}

function runArmorChecks(slotId, wearerId) {
    return collectArmorChecks(slotId, wearerId).map(result => cloneJson(result.check));
}

// =========================
// Fixes
// =========================
function findGroupByUuid(uuid) {
    return Group.all.find(group => group.uuid === uuid) || null;
}

function findGroupByName(name) {
    return Group.all.find(group => group.name === name) || null;
}

function collectDescendants(group) {
    let groups = [];
    let elements = [];
    group.forEachChild(child => {
        if (child instanceof Group) groups.push(child);
        else elements.push(child);
    });
    return { groups, elements };
}

function getPositionArrays(node) {
    let arrays = new Set();
    for (let key of ['from', 'to', 'origin', 'position']) {
        if (Array.isArray(node[key])) arrays.add(node[key]);
    }
    return Array.from(arrays);
}

function moveDescendants(group, delta) {
    group.forEachChild(child => {
        for (let array of getPositionArrays(child)) {
            for (let axis = 0; axis < 3; axis++) array[axis] += delta[axis];
        }
    });
}

function unrotateVectorZYX(vector, degrees) {
    let [x, y, z] = vector;
    let [ax, ay, az] = degrees.map(value => -value * DEGREES);
    [x, y] = [x * Math.cos(az) - y * Math.sin(az), x * Math.sin(az) + y * Math.cos(az)];
    [x, z] = [x * Math.cos(ay) + z * Math.sin(ay), -x * Math.sin(ay) + z * Math.cos(ay)];
    [y, z] = [y * Math.cos(ax) - z * Math.sin(ax), y * Math.sin(ax) + z * Math.cos(ax)];
    return [x, y, z];
}

function getPivotTransferShift(oldPivot, newPivot, rotation) {
    let shift = subtractVectors(oldPivot, newPivot);
    return subtractVectors(unrotateVectorZYX(shift, rotation), shift);
}

function recordArmorModelEdit(aspects, undoLabel, change) {
    Undo.initEdit(aspects);
    let finishAspects;
    try {
        finishAspects = change();
    } catch (error) {
        Undo.cancelEdit(true);
        throw error;
    }
    Undo.finishEdit(undoLabel, finishAspects || undefined);
}

function fixRename(fix) {
    let group = findGroupByUuid(fix.uuid);
    let lower = fix.name.toLowerCase();
    if (!group || Group.all.some(other => other !== group && other.name.toLowerCase() === lower)) return false;
    let oldName = group.name;
    recordArmorModelEdit({ groups: [group], [PROJECT_DATA_UNDO_ASPECT]: true }, i18n('display_sensei.undo.armor_rename'), () => {
        group.name = fix.name;
        group.sanitizeName();
        group.createUniqueName();
        renameFitOffsets(oldName, group.name);
    });
    return true;
}

function renameFitOffsets(oldName, newName) {
    if (oldName === newName) return;
    updateProjectData(data => {
        for (let slotOffsets of Object.values(data.armor.fit)) {
            if (!slotOffsets[oldName]) continue;
            slotOffsets[newName] = slotOffsets[oldName];
            delete slotOffsets[oldName];
        }
    });
}

function fixSnapPivot(fix, keepCubes) {
    let group = findGroupByUuid(fix.uuid);
    if (!group) return false;
    let pivot = toBlockbenchPosition(fix.pivot);
    let descendants = collectDescendants(group);
    let groups = [group].concat(descendants.groups);
    recordArmorModelEdit({ groups, elements: descendants.elements }, i18n('display_sensei.undo.armor_pivot'), () => {
        let shift = keepCubes ? getPivotTransferShift(group.origin, pivot, group.rotation) : subtractVectors(pivot, group.origin);
        for (let axis = 0; axis < 3; axis++) group.origin[axis] = pivot[axis];
        moveDescendants(group, shift);
        Canvas.updateView({ groups, elements: descendants.elements, selection: true });
    });
    return true;
}

function fixFlatten(fix) {
    let group = findGroupByUuid(fix.uuid);
    if (!group || !(group.parent instanceof Group)) return false;
    let top = group;
    while (top.parent instanceof Group) top = top.parent;
    recordArmorModelEdit({ outliner: true, groups: [group] }, i18n('display_sensei.undo.armor_flatten'), () => {
        group.addTo('root', Outliner.root.indexOf(top) + 1);
        Canvas.updateAllBones();
    });
    return true;
}

function fixWrapPivotParent(fix) {
    let group = findGroupByUuid(fix.uuid);
    if (!group) return false;
    let parent = group.parent instanceof Group ? group.parent : 'root';
    let siblings = parent === 'root' ? Outliner.root : parent.children;
    recordArmorModelEdit({ outliner: true, groups: [] }, i18n('display_sensei.undo.armor_wrap'), () => {
        let wrapper = new Group({ name: `${group.name}_pivot`, origin: toBlockbenchPosition(fix.pivot) });
        wrapper.createUniqueName();
        wrapper.isOpen = true;
        wrapper.addTo(parent, siblings.indexOf(group));
        wrapper.init();
        group.addTo(wrapper);
        Canvas.updateAllBones();
        return { outliner: true, groups: [wrapper] };
    });
    return true;
}

const ARMOR_FIXES = {
    rename: fixRename,
    snap_pivot_keep: fix => fixSnapPivot(fix, true),
    snap_pivot_move: fix => fixSnapPivot(fix, false),
    flatten: fixFlatten,
    wrap_pivot_parent: fixWrapPivotParent
};

function applyArmorFix(checkId, fixId, slotId, wearerId) {
    if (!isArmorEditAllowed() || Undo.current_save || !ARMOR_FIXES[fixId]) return false;
    let result = collectArmorChecks(slotId, wearerId).find(entry => entry.check.id === checkId);
    if (!result || !result.fix || !result.check.fixes.includes(fixId)) return false;
    return ARMOR_FIXES[fixId](result.fix);
}

// =========================
// Fit offsets
// =========================
function listSlotBoneNames(slotId) {
    let slot = findWearSlot(slotId);
    let rig = slot && Project ? readModelRig(Project) : null;
    if (!rig) return [];
    return rig.bones.filter(bone => {
        let name = bone.parsedBinding.kind === 'none' ? bone.name : getBindingTarget(bone.parsedBinding, slotId);
        let match = matchWearerBoneName(name);
        return !!match && slot.bones.includes(match.name);
    }).map(bone => bone.name);
}

function getFitOffsets(slotId) {
    if (!findWearSlot(slotId) || !Project) return {};
    let saved = getProjectData().armor.fit[slotId] || {};
    let offsets = {};
    for (let name of listSlotBoneNames(slotId)) offsets[name] = cloneJson(ARMOR_FIT_IDENTITY);
    for (let name of Object.keys(saved)) offsets[name] = cloneJson(saved[name]);
    return offsets;
}

function setFitOffset(slotId, bone, channel, xyz) {
    if (!findWearSlot(slotId) || !ARMOR_FIT_CHANNELS.includes(channel) || !isFitChannelValue(channel, xyz)) return false;
    if (!Project || !findGroupByName(bone)) return false;
    return recordArmorDataEdit(i18n('display_sensei.undo.armor_fit'), data => {
        let slotOffsets = data.armor.fit[slotId] || (data.armor.fit[slotId] = {});
        let offset = slotOffsets[bone] || (slotOffsets[bone] = cloneJson(ARMOR_FIT_IDENTITY));
        offset[channel] = xyz.slice();
    });
}

function resetFitOffsets(slotId) {
    if (!findWearSlot(slotId)) return false;
    return recordArmorDataEdit(i18n('display_sensei.undo.armor_fit_reset'), data => {
        delete data.armor.fit[slotId];
    });
}

function toBlockbenchFitOffset(offset) {
    return {
        position: toBlockbenchPosition(offset.position),
        rotation: toBlockbenchRotation(offset.rotation),
        scale: offset.scale.slice()
    };
}

function isPlacedByOwnWearerBone(group, slotId) {
    let binding = parseBoneBinding(group.bedrock_binding);
    if (binding.kind !== 'none') return !!getBindingTarget(binding, slotId);
    let match = matchWearerBoneName(group.name);
    return !!match && match.exact;
}

function moveGroupTree(group, delta) {
    for (let axis = 0; axis < 3; axis++) group.origin[axis] += delta[axis];
    moveDescendants(group, delta);
}

function bakeGroupFitOffset(group, fileOffset, slotId) {
    let offset = toBlockbenchFitOffset(fileOffset);
    let pivot = group.origin.slice();
    let rotation = group.rotation.map((value, axis) => value + offset.rotation[axis]);
    let shift = unrotateVectorZYX(offset.position, rotation);
    let uniform = offset.scale.every(value => Math.abs(value - offset.scale[0]) < WEAR_POSITION_EPSILON);
    let movePoint = point => point.map((value, axis) => pivot[axis] + shift[axis] + offset.scale[axis] * (value - pivot[axis]));
    let bakeChildren = (parent, parentPivotMove) => {
        for (let child of parent.children) {
            if (child instanceof Group && isPlacedByOwnWearerBone(child, slotId)) {
                if (parseBoneBinding(child.bedrock_binding).kind !== 'none') moveGroupTree(child, parentPivotMove);
                continue;
            }
            let pivotBefore = child instanceof Group ? child.origin.slice() : null;
            for (let array of getPositionArrays(child)) {
                let moved = movePoint(array);
                for (let axis = 0; axis < 3; axis++) array[axis] = moved[axis];
            }
            if (Array.isArray(child.from) && Array.isArray(child.to)) {
                for (let axis = 0; axis < 3; axis++) {
                    let low = Math.min(child.from[axis], child.to[axis]);
                    child.to[axis] = Math.max(child.from[axis], child.to[axis]);
                    child.from[axis] = low;
                }
            }
            if (uniform && typeof child.inflate === 'number') child.inflate *= offset.scale[0];
            if (child instanceof Group) bakeChildren(child, subtractVectors(child.origin, pivotBefore));
        }
    };
    bakeChildren(group, [0, 0, 0]);
    for (let axis = 0; axis < 3; axis++) group.rotation[axis] = rotation[axis];
}

function getGroupDepth(group) {
    let depth = 0;
    for (let parent = group.parent; parent instanceof Group; parent = parent.parent) depth++;
    return depth;
}

function bakeFitOffsets(slotId) {
    if (!findWearSlot(slotId) || !isArmorEditAllowed() || Undo.current_save) return false;
    let saved = getProjectData().armor.fit[slotId];
    if (!saved) return false;
    let missing = Object.keys(saved).filter(name => !findGroupByName(name));
    if (missing.length) {
        showNotification('armor_bake', i18nFormat('display_sensei.message.armor_bake_missing', { bones: missing.join(', ') }));
    }
    let targets = Object.keys(saved)
        .filter(name => !missing.includes(name))
        .map(name => ({ name, group: findGroupByName(name), offset: saved[name] }))
        .sort((a, b) => getGroupDepth(b.group) - getGroupDepth(a.group));
    if (!targets.length) return false;
    let groups = [];
    let elements = [];
    for (let target of targets) {
        let descendants = collectDescendants(target.group);
        for (let group of [target.group].concat(descendants.groups)) if (!groups.includes(group)) groups.push(group);
        for (let element of descendants.elements) if (!elements.includes(element)) elements.push(element);
    }
    recordArmorModelEdit({ groups, elements, [PROJECT_DATA_UNDO_ASPECT]: true }, i18n('display_sensei.undo.armor_bake'), () => {
        for (let target of targets) bakeGroupFitOffset(target.group, target.offset, slotId);
        updateProjectData(data => {
            let slotOffsets = data.armor.fit[slotId] || {};
            for (let target of targets) delete slotOffsets[target.name];
            if (!Object.keys(slotOffsets).length) delete data.armor.fit[slotId];
        });
        Canvas.updateView({ groups, elements, selection: true });
    });
    return true;
}

// =========================
// Install
// =========================
function installArmorRoute() {
    let hooks = createDeletables([
        wrapInitEntity,
        wrapBindingCheck,
        () => Blockbench.on('select_project', guardListener('select_project', onArmorProjectSelected)),
        () => Codecs.project.on('parsed', guardListener('armor project parsed', onArmorProjectParsed)),
        () => onPackLinkScanned(guardListener('armor pack scan', onArmorPackScanned)),
        () => Blockbench.on('undo redo', guardListener('armor undo', onArmorUndoRedo))
    ]);
    guardListener('select_project', onArmorProjectSelected)({ project: Project });
    return {
        delete() {
            hooks.delete();
            restoreSwitchedPreviewModes();
        }
    };
}

registerModuleInstaller('armor_route', installArmorRoute);
