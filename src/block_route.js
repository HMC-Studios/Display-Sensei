// =========================
// Constants
// =========================
const OTHER_HAND_SLOT = {
    thirdperson_righthand: 'thirdperson_lefthand',
    thirdperson_lefthand: 'thirdperson_righthand',
    firstperson_righthand: 'firstperson_lefthand',
    firstperson_lefthand: 'firstperson_righthand'
};

const HAND_SLOTS = ['thirdperson_righthand', 'thirdperson_lefthand', 'firstperson_righthand', 'firstperson_lefthand'];

const FIRST_PERSON_FOR_THIRD_PERSON = {
    firstperson_righthand: 'thirdperson_righthand',
    firstperson_lefthand: 'thirdperson_lefthand'
};

const BEDROCK_DEFAULTS_PRESET_ID = 'bedrock_defaults';

const BEDROCK_PRESET_FOR_BLOCKBENCH = {
    block: BEDROCK_DEFAULTS_PRESET_ID,
    item: 'item_hold',
    handheld: 'tool_hold',
    rod: 'rod_hold',
    armor_stand: 'armor_stand_statue'
};

const VALUE_EPSILON = 1e-6;

const TURN_AXES = ['x', 'y', 'z'];

const GEOMETRY_MILESTONES = [FIT_TO_FRAME_GEOMETRY_VERSION, ITEM_FRAME_GEOMETRY_VERSION, SHELF_GEOMETRY_VERSION];

function isBlockRouteActive() {
    return getRoute() === 'block' && !!Project;
}

// =========================
// Comparing values
// =========================
function sameNumber(a, b) {
    return Math.abs(a - b) < VALUE_EPSILON;
}

function sameAngle(a, b) {
    return Math.abs(((a - b) % 360 + 540) % 360 - 180) < VALUE_EPSILON;
}

function sameVector(a, b, compare = sameNumber) {
    return [0, 1, 2].every(axis => compare(a[axis], b[axis]));
}

function sameChannelValues(channel, a, b) {
    return sameVector(a, b, channel === 'rotation' ? sameAngle : sameNumber);
}

function isZeroVector(vector) {
    return sameVector(vector, [0, 0, 0]);
}

// =========================
// Slot values
// =========================
function engineDefaultsFor(slotId) {
    let defaults = getEngineDefaults()[slotId] || {};
    return {
        translation: defaults.translation || [0, 0, 0],
        rotation: defaults.rotation || [0, 0, 0],
        scale: defaults.scale || [1, 1, 1],
        rotation_pivot: [0, 0, 0],
        scale_pivot: [0, 0, 0]
    };
}

function matchesEngineDefaults(slot) {
    let defaults = engineDefaultsFor(slot.slot_id);
    return SLOT_CHANNELS.every(channel => sameChannelValues(channel, slot[channel], defaults[channel])) &&
        !slot.mirror.some(Boolean);
}

function isUntouchedBlockbenchSlot(slot) {
    let defaultScalePivot = isZeroVector(slot.scale_pivot) ||
        (slot.slot_id === 'embedded' && sameVector(slot.scale_pivot, [0, -0.5, 0]));
    return isZeroVector(slot.translation) &&
        isZeroVector(slot.rotation) &&
        sameVector(slot.scale, [1, 1, 1]) &&
        isZeroVector(slot.rotation_pivot) &&
        defaultScalePivot &&
        !slot.mirror.some(Boolean);
}

function usesEngineValues(slotId) {
    if (!getProjectData().inherit[slotId]) return false;
    let slot = Project.display_settings[slotId];
    return !slot || matchesEngineDefaults(slot) || isUntouchedBlockbenchSlot(slot);
}

function isSlotInherited(slotId) {
    if (!isBlockRouteActive() || !findBedrockSlot(slotId)) return null;
    if (slotId === 'gui' && !getProjectData().gui_fit_to_frame) return false;
    return usesEngineValues(slotId);
}

function readSlotValues(slotId) {
    let slot = Project.display_settings[slotId];
    if (!slot || usesEngineValues(slotId)) return engineDefaultsFor(slotId);
    let values = {};
    for (let channel of SLOT_CHANNELS) {
        values[channel] = slot[channel].slice();
    }
    return values;
}

function getSlotValues(slotId) {
    if (!isBlockRouteActive() || !findBedrockSlot(slotId)) return null;
    let values = readSlotValues(slotId);
    if (slotId === 'gui') values.fit_to_frame = getProjectData().gui_fit_to_frame;
    return values;
}

let seededSlots = new WeakSet();

function seedEngineDefaults(slot) {
    let defaults = engineDefaultsFor(slot.slot_id);
    slot.extend(Object.assign(defaults, { mirror: [false, false, false] }));
    seededSlots.add(slot);
}

// =========================
// Mirrored values become 180° turns (Bedrock has no negative scale)
// =========================
const THIN_AXIS_ORDER = [2, 1, 0];

const SIZE_EPSILON = 0.001;

function isLeftHandSlot(slotId) {
    let slot = findBedrockSlot(slotId);
    return !!slot && slot.hand === 'left';
}

function turnedRotation(rotation, axisIndex) {
    let [x, y, z] = rotation;
    let turned;
    if (axisIndex === 0) {
        turned = [x + 180, -y, -z];
    } else if (axisIndex === 1) {
        turned = [x, y + 180, -z];
    } else {
        turned = [x, y, z + 180];
    }
    return turned.map(value => wrapAngle(value) + 0);
}

function drawnRotationMatrix(slotId, rotation) {
    let side = isLeftHandSlot(slotId) ? -1 : 1;
    let toRadians = Math.PI / 180;
    let euler = new THREE.Euler(rotation[0] * toRadians, rotation[1] * toRadians * side, rotation[2] * toRadians * side, 'XYZ');
    return new THREE.Matrix4().makeRotationFromEuler(euler);
}

function rotatedPivot(matrix, pivot) {
    return new THREE.Vector3(pivot[0], pivot[1], pivot[2]).multiplyScalar(16).applyMatrix4(matrix);
}

function translationKeepingPlace(slotId, values, newRotation) {
    if (isZeroVector(values.rotation_pivot) && isZeroVector(values.scale_pivot)) return values.translation.slice();
    let side = isLeftHandSlot(slotId) ? -1 : 1;
    let before = drawnRotationMatrix(slotId, values.rotation);
    let after = drawnRotationMatrix(slotId, newRotation);
    let drawn = new THREE.Vector3(values.translation[0] * side, values.translation[1], values.translation[2]);
    drawn.add(rotatedPivot(after, values.rotation_pivot).sub(rotatedPivot(before, values.rotation_pivot)));
    let scaleShift = rotatedPivot(after, values.scale_pivot).sub(rotatedPivot(before, values.scale_pivot));
    drawn.x -= scaleShift.x * (1 - values.scale[0]);
    drawn.y -= scaleShift.y * (1 - values.scale[1]);
    drawn.z -= scaleShift.z * (1 - values.scale[2]);
    return [drawn.x * side, drawn.y, drawn.z].map(value => Math.round(value * 1e9) / 1e9 + 0);
}

function thinnestAxis(candidates, size) {
    let ordered = THIN_AXIS_ORDER.filter(axis => candidates.includes(axis));
    return ordered.reduce((best, axis) => (size[axis] < size[best] - SIZE_EPSILON ? axis : best));
}

function chooseMirrorTurn(flags, getSize) {
    let flipped = [0, 1, 2].filter(axis => flags[axis]);
    if (flipped.length === 2) {
        return { axis: [0, 1, 2].find(axis => !flags[axis]), leftover: null, exact: true };
    }
    let candidates = flipped.length === 1 ? [0, 1, 2].filter(axis => axis !== flipped[0]) : [0, 1, 2];
    let leftover = thinnestAxis(candidates, getSize());
    let axis = flipped.length === 1 ? candidates.find(candidate => candidate !== leftover) : leftover;
    return { axis, leftover, exact: false };
}

function computeMirrorTurn(slotId, values, flags, getSize) {
    if (!flags.some(Boolean)) return null;
    let turn = chooseMirrorTurn(flags, getSize);
    let rotation = turnedRotation(values.rotation, turn.axis);
    let translation = translationKeepingPlace(slotId, values, rotation).map(value => sanitizeSlotValue('translation', value));
    return { turn, rotation, translation };
}

function measureModelSize() {
    let root = Project && Project.model_3d;
    let box = new THREE.Box3();
    if (!root) return [0, 0, 0];
    root.updateMatrixWorld(true);
    let toModel = new THREE.Matrix4().copy(root.matrixWorld).invert();
    for (let element of Outliner.elements) {
        let mesh = element.mesh;
        if ((element.type !== 'cube' && element.type !== 'mesh') || element.export === false || !mesh || !mesh.geometry) continue;
        mesh.geometry.computeBoundingBox();
        if (!mesh.geometry.boundingBox) continue;
        let toElement = new THREE.Matrix4().multiplyMatrices(toModel, mesh.matrixWorld);
        box.union(mesh.geometry.boundingBox.clone().applyMatrix4(toElement));
    }
    if (box.isEmpty()) return [0, 0, 0];
    let size = box.getSize(new THREE.Vector3());
    return [size.x, size.y, size.z];
}

function measureGeometrySize(geometry) {
    let min = [Infinity, Infinity, Infinity];
    let max = [-Infinity, -Infinity, -Infinity];
    let include = (axis, value) => {
        if (typeof value !== 'number' || !Number.isFinite(value)) return;
        min[axis] = Math.min(min[axis], value);
        max[axis] = Math.max(max[axis], value);
    };
    let bones = geometry && Array.isArray(geometry.bones) ? geometry.bones : [];
    for (let bone of bones) {
        if (!isPlainObject(bone)) continue;
        for (let cube of Array.isArray(bone.cubes) ? bone.cubes : []) {
            if (!isPlainObject(cube) || !Array.isArray(cube.origin) || !Array.isArray(cube.size)) continue;
            let inflate = typeof cube.inflate === 'number' ? cube.inflate : 0;
            for (let axis of [0, 1, 2]) {
                include(axis, cube.origin[axis] - inflate);
                include(axis, cube.origin[axis] + cube.size[axis] + inflate);
            }
        }
        let positions = isPlainObject(bone.poly_mesh) && Array.isArray(bone.poly_mesh.positions) ? bone.poly_mesh.positions : [];
        for (let position of positions) {
            if (Array.isArray(position)) [0, 1, 2].forEach(axis => include(axis, position[axis]));
        }
    }
    return [0, 1, 2].map(axis => (max[axis] >= min[axis] ? max[axis] - min[axis] : 0));
}

function convertMirrorToTurn(slot, modelSize) {
    if (!slot || !Array.isArray(slot.mirror) || !slot.mirror.some(Boolean)) return null;
    let values = {};
    for (let channel of SLOT_CHANNELS) {
        values[channel] = slot[channel].slice();
    }
    let result = computeMirrorTurn(slot.slot_id, values, slot.mirror, () => modelSize || measureModelSize());
    slot.rotation.replace(result.rotation);
    slot.translation.replace(result.translation);
    slot.mirror.replace([false, false, false]);
    return result.turn;
}

function reportMirrorTurns(turns, notify = false) {
    let made = turns.filter(Boolean);
    if (!made.length) return;
    let approximate = made.find(turn => !turn.exact);
    if (approximate) {
        showNotification('mirror', i18nFormat('display_sensei.message.mirror_approximated', {
            axis: TURN_AXES[approximate.axis].toUpperCase(),
            leftover: TURN_AXES[approximate.leftover].toUpperCase()
        }));
    } else if (notify) {
        showNotification('mirror', i18n('display_sensei.message.mirror_converted'));
    } else {
        showMessage('display_sensei.message.mirror_converted');
    }
}

function ensureSlot(slotId) {
    if (!isBlockRouteActive() || !findBedrockSlot(slotId)) return null;
    let data = getProjectData();
    let slot = Project.display_settings[slotId];
    if (!slot) {
        slot = Project.display_settings[slotId] = new DisplaySlot(slotId);
        seedEngineDefaults(slot);
    } else {
        reportMirrorTurns([convertMirrorToTurn(slot)]);
        if (data.inherit[slotId] && isUntouchedBlockbenchSlot(slot)) seedEngineDefaults(slot);
    }
    if (slotId === 'gui') slot.fit_to_frame = data.gui_fit_to_frame;
    return slot;
}

// =========================
// Undo steps
// =========================
let openSlotEdit = null;

function isOwnSlotEditOpen() {
    return !!openSlotEdit && openSlotEdit.project === Project && Undo.current_save === openSlotEdit.save;
}

let isFinishingOwnEdit = false;

function finishOwnEdit(label) {
    isFinishingOwnEdit = true;
    try {
        Undo.finishEdit(label);
    } finally {
        isFinishingOwnEdit = false;
    }
}

function includeSlotsInEdit(save, slotIds) {
    let recorded = save.aspects.display_slots || [];
    let added = slotIds.filter(slotId => !recorded.includes(slotId));
    if (!added.length) return;
    save.aspects.display_slots = recorded.concat(added);
    if (!save.display_slots) save.display_slots = {};
    for (let slotId of added) {
        save.display_slots[slotId] = Project.display_settings[slotId].copy();
    }
    if (!(PROJECT_DATA_KEY in save)) save[PROJECT_DATA_KEY] = cloneJson(getProjectData());
}

function slotEditChanged(save) {
    let slotIds = save.aspects.display_slots || [];
    let slotChanged = slotIds.some(slotId => {
        let slot = Project.display_settings[slotId];
        return JSON.stringify(save.display_slots[slotId]) !== JSON.stringify(slot ? slot.copy() : null);
    });
    return slotChanged ||
        (PROJECT_DATA_KEY in save && JSON.stringify(save[PROJECT_DATA_KEY]) !== JSON.stringify(getProjectData()));
}

function isIdleForeignEdit(save) {
    if (Transformer.dragging) return false;
    let aspects = Object.keys(save.aspects || {}).filter(name => save.aspects[name]);
    if (aspects.some(name => name !== 'display_slots')) return false;
    return !slotEditChanged(save);
}

function recordOwnEdit(aspects, undoLabel, change) {
    let save = Undo.initEdit(aspects);
    try {
        change();
    } catch (error) {
        Undo.cancelEdit(true);
        throw error;
    }
    if (slotEditChanged(save)) {
        finishOwnEdit(undoLabel);
    } else {
        Undo.cancelEdit(false);
    }
}

function runSlotEdit(slotIds, undoLabel, change) {
    slotIds.forEach(ensureSlot);
    let save = Undo.current_save;
    if (isOwnSlotEditOpen() || (save && !isIdleForeignEdit(save))) {
        includeSlotsInEdit(save, slotIds);
        change();
    } else {
        recordOwnEdit({ display_slots: slotIds.slice() }, undoLabel, change);
    }
    refreshDisplayPreview(slotIds);
}

function runProjectDataEdit(undoLabel, change) {
    let save = Undo.current_save;
    if (isOwnSlotEditOpen() || (save && !isIdleForeignEdit(save))) {
        change();
    } else {
        recordOwnEdit({ [PROJECT_DATA_UNDO_ASPECT]: true }, undoLabel, change);
    }
    refreshDisplayPreview();
}

function normalizeSlotIds(slotIds) {
    let ids = Array.isArray(slotIds) ? slotIds : BEDROCK_SLOTS.map(slot => slot.id);
    return ids.filter((slotId, index) => findBedrockSlot(slotId) && ids.indexOf(slotId) === index);
}

function beginSlotEdit(slotIds) {
    if (!isBlockRouteActive()) return false;
    let ids = normalizeSlotIds(slotIds);
    if (!ids.length) return false;
    ids.forEach(ensureSlot);
    if (isOwnSlotEditOpen()) {
        includeSlotsInEdit(Undo.current_save, ids);
        return true;
    }
    if (Undo.current_save && !isIdleForeignEdit(Undo.current_save)) return false;
    openSlotEdit = { save: Undo.initEdit({ display_slots: ids }), project: Project };
    return true;
}

function takeOpenSlotEdit() {
    let edit = openSlotEdit;
    openSlotEdit = null;
    if (!edit || edit.project.undo.current_save !== edit.save) return null;
    if (edit.project !== Project) {
        edit.project.undo.cancelEdit(false);
        return null;
    }
    return edit;
}

function finishSlotEdit(label) {
    let edit = takeOpenSlotEdit();
    if (!edit) return false;
    if (!slotEditChanged(edit.save)) {
        Undo.cancelEdit(false);
        return false;
    }
    finishOwnEdit(label || i18n('display_sensei.undo.edit_slot'));
    refreshPanel();
    return true;
}

function cancelSlotEdit() {
    if (!takeOpenSlotEdit()) return false;
    Undo.cancelEdit(true);
    refreshDisplayPreview();
    return true;
}

// =========================
// Editing slots
// =========================
function wrapAngle(value) {
    if (value >= -180 && value < 180) return value;
    let wrapped = value - 360 * Math.floor((value + 180) / 360);
    return Math.round(wrapped * 1e9) / 1e9;
}

function sanitizeSlotValue(channel, value) {
    if (channel === 'rotation') return wrapAngle(value);
    let number = channel === 'scale' ? Math.abs(value) : value;
    return clampToRange(number, SLOT_RANGES[channel]);
}

function sanitizeOrKeep(channel, value, current) {
    let number = typeof value === 'number' ? value : parseFloat(value);
    return Number.isFinite(number) ? sanitizeSlotValue(channel, number) : current;
}

function sanitizeVector(channel, values) {
    return values.map(value => sanitizeOrKeep(channel, value, 0));
}

function forgetUnsetFields(data, slotId, fields) {
    let unset = data.unset_fields[slotId];
    if (!unset) return;
    let remaining = unset.filter(field => !fields.includes(field));
    if (remaining.length) {
        data.unset_fields[slotId] = remaining;
    } else {
        delete data.unset_fields[slotId];
    }
}

function markSlotEdited(slotId, fields = FALLBACK_FIELDS) {
    reportMirrorTurns([convertMirrorToTurn(Project.display_settings[slotId])]);
    let data = getProjectData();
    data.inherit[slotId] = false;
    forgetUnsetFields(data, slotId, fields);
}

function writeSlotChannel(slot, channel, values) {
    slot[channel].replace(slot[channel].map((current, axis) => sanitizeOrKeep(channel, values[axis], current)));
}

function hasNumber(values) {
    return values.some(value => Number.isFinite(typeof value === 'number' ? value : parseFloat(value)));
}

function setSlotChannel(slotId, channel, values) {
    if (!isBlockRouteActive() || !findBedrockSlot(slotId) || !SLOT_CHANNELS.includes(channel)) return false;
    if (!Array.isArray(values) || !hasNumber(values)) return false;
    runSlotEdit([slotId], i18n('display_sensei.undo.edit_slot'), () => {
        writeSlotChannel(Project.display_settings[slotId], channel, values);
        markSlotEdited(slotId, [channel]);
    });
    return true;
}

function setSlotAxis(slotId, channel, axisIndex, value) {
    if (![0, 1, 2].includes(axisIndex)) return false;
    let values = [null, null, null];
    values[axisIndex] = value;
    return setSlotChannel(slotId, channel, values);
}

function getChannelDefault(slotId, channel) {
    if (!isBlockRouteActive() || !findBedrockSlot(slotId) || !SLOT_CHANNELS.includes(channel)) return null;
    return engineDefaultsFor(slotId)[channel].slice();
}

function leaveFieldToGame(slotId, channel) {
    let data = getProjectData();
    data.inherit[slotId] = false;
    if (!FALLBACK_FIELDS.includes(channel)) return;
    let unset = data.unset_fields[slotId] || [];
    if (!unset.includes(channel)) data.unset_fields[slotId] = unset.concat([channel]);
}

function resetSlotChannel(slotId, channel) {
    let defaults = getChannelDefault(slotId, channel);
    if (!defaults) return false;
    runSlotEdit([slotId], i18n('display_sensei.undo.reset_channel'), () => {
        let slot = Project.display_settings[slotId];
        slot[channel].replace(defaults);
        let guiFits = slotId !== 'gui' || getProjectData().gui_fit_to_frame;
        if (guiFits && matchesEngineDefaults(slot)) {
            applyInherit(slotId, true);
        } else {
            leaveFieldToGame(slotId, channel);
        }
    });
    return true;
}

function applyInherit(slotId, inherited) {
    let data = getProjectData();
    if (inherited) {
        seedEngineDefaults(Project.display_settings[slotId]);
        if (slotId === 'gui') {
            data.gui_fit_to_frame = true;
            Project.display_settings.gui.fit_to_frame = true;
        }
    }
    data.inherit[slotId] = inherited;
    delete data.unset_fields[slotId];
}

function setSlotInherited(slotId, inherited) {
    if (!isBlockRouteActive() || !findBedrockSlot(slotId)) return false;
    let label = inherited ? i18n('display_sensei.undo.reset_slot') : i18n('display_sensei.undo.stop_inheriting');
    runSlotEdit([slotId], label, () => applyInherit(slotId, !!inherited));
    return true;
}

// =========================
// Hands
// =========================
function negatedHandValues(values) {
    let negated = cloneJson(values);
    negated.translation[0] *= -1;
    negated.rotation[1] *= -1;
    negated.rotation[2] *= -1;
    for (let channel of ['translation', 'rotation']) {
        negated[channel] = negated[channel].map(value => value + 0);
    }
    return negated;
}

function copyFromOtherHand(slotId, negate, undoKey) {
    let otherSlotId = OTHER_HAND_SLOT[slotId];
    if (!isBlockRouteActive() || !otherSlotId) return false;
    ensureSlot(otherSlotId);
    let values = readSlotValues(otherSlotId);
    if (negate) values = negatedHandValues(values);
    runSlotEdit([slotId], i18n(undoKey), () => {
        let slot = Project.display_settings[slotId];
        for (let channel of SLOT_CHANNELS) {
            writeSlotChannel(slot, channel, values[channel]);
        }
        markSlotEdited(slotId);
    });
    return true;
}

function mirrorFromOtherHand(slotId) {
    return copyFromOtherHand(slotId, LEFT_HAND_RULE !== 'mirror', 'display_sensei.undo.mirror_slot');
}

function samePoseFromOtherHand(slotId) {
    return copyFromOtherHand(slotId, LEFT_HAND_RULE === 'mirror', 'display_sensei.undo.same_pose_slot');
}

function getHandFallbackNote(slotId) {
    if (!isBlockRouteActive() || !isLeftHandSlot(slotId)) return null;
    if (isSlotInherited(slotId) !== true || isSlotInherited(OTHER_HAND_SLOT[slotId]) !== false) return null;
    return i18n('display_sensei.message.left_hand_inherits');
}

// =========================
// Turn 180°
// =========================
function turnSlot180(slotId, axis) {
    let axisIndex = TURN_AXES.indexOf(axis);
    if (!isBlockRouteActive() || !findBedrockSlot(slotId) || axisIndex < 0) return false;
    runSlotEdit([slotId], i18n('display_sensei.undo.turn_slot'), () => {
        let slot = Project.display_settings[slotId];
        slot.rotation.replace(turnedRotation(slot.rotation, axisIndex));
        markSlotEdited(slotId, ['rotation']);
    });
    return true;
}

// =========================
// Matching first person to third person
// =========================
const MATCH_FIRST_PERSON_DEFAULT_SLOT = 'firstperson_righthand';

const GIMBAL_EPSILON = 1e-6;

const NEAR_GIMBAL_DEGREES = 1;

function drawnSlotMatrix(slotId, values) {
    let side = isLeftHandSlot(slotId) ? -1 : 1;
    let pivotSide = side < 0 && LEFT_HAND_PIVOT_MIRROR ? -1 : 1;
    let toRadians = Math.PI / 180;
    let euler = new THREE.Euler(values.rotation[0] * toRadians, values.rotation[1] * toRadians * side, values.rotation[2] * toRadians * side, 'XYZ');
    let position = new THREE.Vector3(values.translation[0] * side, values.translation[1], values.translation[2]);
    let scale = values.scale.map(value => value || 0.001);
    let rotationPivot = values.rotation_pivot || [0, 0, 0];
    let scalePivot = values.scale_pivot || [0, 0, 0];
    if (!isZeroVector(rotationPivot)) {
        let offset = new THREE.Vector3(rotationPivot[0] * pivotSide, rotationPivot[1], rotationPivot[2]).multiplyScalar(16);
        position.sub(offset.clone().applyEuler(euler).sub(offset));
    }
    if (!isZeroVector(scalePivot)) {
        let offset = new THREE.Vector3(scalePivot[0] * pivotSide, scalePivot[1], scalePivot[2]).multiplyScalar(16).applyEuler(euler);
        position.add(new THREE.Vector3(offset.x * (1 - scale[0]), offset.y * (1 - scale[1]), offset.z * (1 - scale[2])));
    }
    return new THREE.Matrix4().compose(position, new THREE.Quaternion().setFromEuler(euler), new THREE.Vector3().fromArray(scale));
}

function preferredEulerDegrees(quaternion) {
    let m = new THREE.Matrix4().makeRotationFromQuaternion(quaternion).elements;
    let toDegrees = 180 / Math.PI;
    let cosY = Math.hypot(m[0], m[4]);
    if (cosY < GIMBAL_EPSILON) {
        return [Math.atan2(m[6], m[5]) * toDegrees, Math.sign(m[8]) * 90, 0].map(wrapAngle);
    }
    let first = [Math.atan2(-m[9], m[10]), Math.atan2(m[8], cosY), Math.atan2(-m[4], m[0])].map(angle => wrapAngle(angle * toDegrees));
    let second = [first[0] + 180, 180 - first[1], first[2] + 180].map(wrapAngle);
    let size = angles => angles.reduce((sum, angle) => sum + Math.abs(angle), 0);
    return size(second) < size(first) - VALUE_EPSILON ? second : first;
}

function foldNearGimbal(angles) {
    let side = Math.sign(angles[1]);
    let change = Math.abs(Math.abs(angles[1]) - 90);
    if (!side || change > NEAR_GIMBAL_DEGREES) return null;
    let rotation = [angles[0] + side * angles[2], side * 90, 0].map(value => sanitizeSlotValue('rotation', roundToFour(value)) + 0);
    return { rotation, change: roundToFour(change) };
}

function valuesFromDrawnMatrix(slotId, matrix) {
    let side = isLeftHandSlot(slotId) ? -1 : 1;
    let position = new THREE.Vector3();
    let quaternion = new THREE.Quaternion();
    let scale = new THREE.Vector3();
    matrix.decompose(position, quaternion, scale);
    let rotation = preferredEulerDegrees(quaternion);
    let folded = foldNearGimbal(rotation);
    if (folded) rotation = folded.rotation;
    let rounded = {
        translation: [position.x * side, position.y, position.z].map(roundToFour),
        rotation: [rotation[0], rotation[1] * side, rotation[2] * side].map(roundToFour),
        scale: scale.toArray().map(roundToFour)
    };
    let clean = channel => rounded[channel].map(value => sanitizeSlotValue(channel, value) + 0);
    let values = {
        translation: clean('translation'),
        rotation: clean('rotation'),
        scale: clean('scale'),
        rotation_pivot: [0, 0, 0],
        scale_pivot: [0, 0, 0]
    };
    let clamped = !sameVector(values.translation, rounded.translation) || !sameVector(values.scale, rounded.scale);
    return { values, clamped, turned: folded ? folded.change : 0 };
}

function computeFirstPersonMatch(slotId, thirdPersonValues) {
    let thirdPersonSlotId = FIRST_PERSON_FOR_THIRD_PERSON[slotId];
    if (!thirdPersonSlotId || !isPlainObject(thirdPersonValues)) return null;
    let values = {};
    for (let channel of SLOT_CHANNELS) {
        let fallback = engineDefaultsFor(thirdPersonSlotId)[channel];
        values[channel] = Array.isArray(thirdPersonValues[channel]) ? sanitizeVector(channel, thirdPersonValues[channel]) : fallback;
    }
    let firstPersonDefault = drawnSlotMatrix(slotId, engineDefaultsFor(MATCH_FIRST_PERSON_DEFAULT_SLOT));
    let thirdPersonDefault = drawnSlotMatrix(thirdPersonSlotId, engineDefaultsFor(thirdPersonSlotId));
    let matrix = firstPersonDefault.multiply(thirdPersonDefault.invert()).multiply(drawnSlotMatrix(thirdPersonSlotId, values));
    return valuesFromDrawnMatrix(slotId, matrix);
}

function matchFirstPersonValues(slotId, thirdPersonValues) {
    let match = computeFirstPersonMatch(slotId, thirdPersonValues);
    return match ? match.values : null;
}

function showsThirdPersonDefault(thirdPersonSlotId) {
    let values = readSlotValues(thirdPersonSlotId);
    let defaults = engineDefaultsFor(thirdPersonSlotId);
    return SLOT_CHANNELS.every(channel => sameChannelValues(channel, values[channel], defaults[channel]));
}

function matchFirstPersonToThirdPerson() {
    if (!isBlockRouteActive()) return false;
    let result = { written: [], kept: [], clamped: [], turned: 0 };
    let matched = {};
    for (let [slotId, thirdPersonSlotId] of Object.entries(FIRST_PERSON_FOR_THIRD_PERSON)) {
        ensureSlot(thirdPersonSlotId);
        if (showsThirdPersonDefault(thirdPersonSlotId)) {
            result.kept.push(slotId);
            continue;
        }
        let match = computeFirstPersonMatch(slotId, readSlotValues(thirdPersonSlotId));
        matched[slotId] = match.values;
        result.written.push(slotId);
        if (match.clamped) result.clamped.push(slotId);
        result.turned = Math.max(result.turned, match.turned);
    }
    if (!result.written.length) return result;
    runSlotEdit(result.written, i18n('display_sensei.undo.match_first_person'), () => {
        for (let slotId of result.written) {
            let slot = Project.display_settings[slotId];
            for (let channel of SLOT_CHANNELS) {
                writeSlotChannel(slot, channel, matched[slotId][channel]);
            }
            markSlotEdited(slotId);
        }
    });
    return result;
}

// =========================
// Turning about the item's own axes, and rotations near Y ±90°
// =========================
function turnSlotAboutItemAxis(slotId, axis, degrees) {
    let axisIndex = TURN_AXES.indexOf(axis);
    let amount = Number(degrees);
    if (!isBlockRouteActive() || !findBedrockSlot(slotId) || axisIndex < 0 || !Number.isFinite(amount) || amount === 0) return false;
    ensureSlot(slotId);
    let toRadians = Math.PI / 180;
    let current = readSlotValues(slotId).rotation;
    let rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(current[0] * toRadians, current[1] * toRadians, current[2] * toRadians, 'XYZ'));
    let turn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3().setComponent(axisIndex, 1), amount * toRadians);
    let turned = preferredEulerDegrees(rotation.multiply(turn)).map(value => sanitizeSlotValue('rotation', roundToFour(value)) + 0);
    runSlotEdit([slotId], i18n('display_sensei.undo.turn_item'), () => {
        Project.display_settings[slotId].rotation.replace(turned);
        markSlotEdited(slotId, ['rotation']);
    });
    return true;
}

function getGimbalState(slotId) {
    if (!isBlockRouteActive() || !findBedrockSlot(slotId)) return null;
    let rotation = readSlotValues(slotId).rotation;
    let folded = foldNearGimbal(rotation);
    if (!folded) return null;
    let tidy = sameVector(folded.rotation, rotation, sameAngle) ? null : folded.rotation;
    return { y: folded.rotation[1], change: folded.change, tidy };
}

function tidyNearGimbalRotation(slotId) {
    let state = getGimbalState(slotId);
    if (!state || !state.tidy) return null;
    runSlotEdit([slotId], i18n('display_sensei.undo.tidy_rotation'), () => {
        Project.display_settings[slotId].rotation.replace(state.tidy);
        markSlotEdited(slotId, ['rotation']);
    });
    return { rotation: state.tidy.slice(), change: state.change };
}

// =========================
// Presets
// =========================
function readPresetOfMenuEntry(entry) {
    let found = null;
    if (!entry || typeof entry.click !== 'function') return null;
    withTemporaryValue(DisplayMode, 'applyPreset', preset => {
        found = preset;
    }, () => entry.click());
    if (isPlainObject(found) && found[BEDROCK_MENU_PRESET_KEY]) return null;
    return isPlainObject(found) && isPlainObject(found.areas) ? found : null;
}

let isReadingBlockbenchPresets = false;

function readBlockbenchPresets() {
    let action = BarItems.apply_display_preset;
    if (!action || typeof action.children !== 'function') return [];
    let entries;
    isReadingBlockbenchPresets = true;
    try {
        entries = action.children();
    } finally {
        isReadingBlockbenchPresets = false;
    }
    return entries.map(readPresetOfMenuEntry).filter(Boolean);
}

const SAVED_PRESET_ID_PREFIX = 'saved_';
let savedPresetIds = new WeakMap();
let savedPresetCount = 0;
let savedPresets = {};

function getSavedPresetId(preset) {
    if (!savedPresetIds.has(preset)) {
        savedPresetCount++;
        savedPresetIds.set(preset, SAVED_PRESET_ID_PREFIX + savedPresetCount);
    }
    return savedPresetIds.get(preset);
}

// =========================
// Calibrated holds
// =========================
const CALIBRATED_HOLDS_STORAGE_KEY = 'display_sensei_calibrated_holds_v1';
const CALIBRATED_HOLD_RULE_KEY = 'left_hand_rule';
const FIRST_LEFT_HAND_RULE = 'mirror';

function isNumberVector(value) {
    return Array.isArray(value) && value.length === 3 && value.every(number => typeof number === 'number' && Number.isFinite(number));
}

function readCalibratedHolds() {
    let stored = null;
    try {
        stored = JSON.parse(localStorage.getItem(CALIBRATED_HOLDS_STORAGE_KEY));
    } catch (error) {
        stored = null;
    }
    let holds = {};
    if (!isPlainObject(stored)) return holds;
    for (let calibrationId of CALIBRATION_IDS) {
        let hands = stored[calibrationId];
        if (!isPlainObject(hands)) continue;
        let areas = {};
        for (let slotId of HAND_SLOTS) {
            let entry = hands[slotId];
            if (!isPlainObject(entry) || !FALLBACK_FIELDS.every(field => isNumberVector(entry[field]))) continue;
            areas[slotId] = {};
            for (let channel of SLOT_CHANNELS) {
                if (isNumberVector(entry[channel])) areas[slotId][channel] = entry[channel].slice();
            }
        }
        let rule = typeof hands[CALIBRATED_HOLD_RULE_KEY] === 'string' ? hands[CALIBRATED_HOLD_RULE_KEY] : FIRST_LEFT_HAND_RULE;
        if (Object.keys(areas).length) holds[calibrationId] = { areas, rule };
    }
    return holds;
}

function writeCalibratedHolds(holds) {
    let stored = {};
    for (let [calibrationId, hold] of Object.entries(holds)) {
        stored[calibrationId] = Object.assign({ [CALIBRATED_HOLD_RULE_KEY]: hold.rule }, hold.areas);
    }
    try {
        if (Object.keys(stored).length) {
            localStorage.setItem(CALIBRATED_HOLDS_STORAGE_KEY, JSON.stringify(stored));
        } else {
            localStorage.removeItem(CALIBRATED_HOLDS_STORAGE_KEY);
        }
        return true;
    } catch (error) {
        console.warn(LOG_PREFIX, 'Could not store the calibrated hold:', error);
        return false;
    }
}

function getCalibratedHold(calibrationId) {
    let hold = readCalibratedHolds()[calibrationId];
    return hold ? hold.areas : null;
}

function calibratedHoldRuleDiffers(calibrationId) {
    let hold = readCalibratedHolds()[calibrationId];
    return !!hold && hold.rule !== LEFT_HAND_RULE;
}

function hasCalibratedHold(calibrationId) {
    if (!CALIBRATION_IDS.includes(calibrationId)) return null;
    return !!getCalibratedHold(calibrationId);
}

function saveCalibratedHold(calibrationId) {
    if (!isBlockRouteActive() || !CALIBRATION_IDS.includes(calibrationId)) return false;
    let areas = {};
    for (let slotId of HAND_SLOTS) {
        ensureSlot(slotId);
        let values = readSlotValues(slotId);
        areas[slotId] = {};
        for (let channel of SLOT_CHANNELS) {
            areas[slotId][channel] = sanitizeVector(channel, values[channel]);
        }
    }
    let holds = readCalibratedHolds();
    holds[calibrationId] = { areas, rule: LEFT_HAND_RULE };
    if (!writeCalibratedHolds(holds)) return false;
    refreshPanel();
    return true;
}

function clearCalibratedHold(calibrationId) {
    if (!CALIBRATION_IDS.includes(calibrationId)) return false;
    let holds = readCalibratedHolds();
    if (!holds[calibrationId]) return false;
    delete holds[calibrationId];
    if (!writeCalibratedHolds(holds)) return false;
    refreshPanel();
    return true;
}

// =========================
// Bedrock presets
// =========================
function resolvePresetAreas(preset) {
    let calibrated = preset.calibration ? getCalibratedHold(preset.calibration) : null;
    if (calibrated) return cloneJson(calibrated);
    if (!preset.areas && !preset.standHands) return null;
    let areas = {};
    if (preset.standHands) {
        let hands = getStatueHandAreas(preset.standHands);
        if (!hands) return null;
        Object.assign(areas, hands);
    }
    if (preset.areas) Object.assign(areas, cloneJson(preset.areas));
    if (preset.matchFirstPerson) {
        for (let [slotId, thirdPersonSlotId] of Object.entries(FIRST_PERSON_FOR_THIRD_PERSON)) {
            if (isPlainObject(areas[thirdPersonSlotId])) areas[slotId] = matchFirstPersonValues(slotId, areas[thirdPersonSlotId]);
        }
    }
    return areas;
}

function usesCalibratedHold(preset) {
    return !!preset.calibration && !!getCalibratedHold(preset.calibration);
}

function describeBedrockPreset(preset) {
    let calibrated = usesCalibratedHold(preset);
    return {
        id: preset.id,
        label: i18n(preset.label),
        saved: false,
        group: preset.group,
        note: i18n(calibrated ? preset.calibratedNoteKey : preset.noteKey),
        estimate: preset.confidence === 'calibrated' && !calibrated,
        calibration: preset.calibration || null,
        calibrated,
        uncalibrated: !preset.inherit && !resolvePresetAreas(preset)
    };
}

function describeSavedPreset(preset, id) {
    let notes = [i18n('display_sensei.preset_note.saved')];
    let areas = Object.values(preset.areas).filter(isPlainObject);
    if (areas.some(area => presetMirrorFlags(area).some(Boolean))) notes.push(i18n('display_sensei.preset_note.saved_mirror'));
    return {
        id, label: String(preset.name || ''), saved: true, group: 'saved', note: notes.join(' '), estimate: false,
        calibration: null, calibrated: false, uncalibrated: false
    };
}

function getPresetChoices() {
    if (!isBlockRouteActive()) return null;
    let available = readBlockbenchPresets();
    let choices = BEDROCK_PRESETS
        .filter(preset => preset.inherit || preset.calibration || resolvePresetAreas(preset))
        .map(describeBedrockPreset);
    savedPresets = {};
    for (let preset of available) {
        if (preset.fixed) continue;
        let id = getSavedPresetId(preset);
        savedPresets[id] = preset;
        choices.push(describeSavedPreset(preset, id));
    }
    return choices;
}

function findSavedPreset(presetId) {
    return Object.prototype.hasOwnProperty.call(savedPresets, presetId) ? savedPresets[presetId] : null;
}

function presetMirrorFlags(area) {
    return [0, 1, 2].map(axis =>
        (Array.isArray(area.mirror) && area.mirror[axis] === true) ||
        (Array.isArray(area.scale) && typeof area.scale[axis] === 'number' && area.scale[axis] < 0));
}

function writePresetValues(slotId, area) {
    let slot = Project.display_settings[slotId];
    let written = [];
    for (let channel of SLOT_CHANNELS) {
        if (Array.isArray(area[channel])) {
            writeSlotChannel(slot, channel, area[channel]);
            written.push(channel);
        } else if (channel === 'rotation_pivot' || channel === 'scale_pivot') {
            slot[channel].replace([0, 0, 0]);
        }
    }
    let turn = null;
    let mirror = presetMirrorFlags(area);
    if (mirror.some(Boolean)) {
        slot.mirror.replace(mirror);
        turn = convertMirrorToTurn(slot);
        written.push('rotation', 'translation');
    }
    markSlotEdited(slotId, written);
    return turn;
}

function keepsBedrockDefault(slotId, area) {
    if (slotId === 'gui' && !getProjectData().gui_fit_to_frame) return false;
    if (presetMirrorFlags(area).some(Boolean)) return false;
    let defaults = engineDefaultsFor(slotId);
    return SLOT_CHANNELS.every(channel => {
        if (!Array.isArray(area[channel])) return channel === 'rotation_pivot' || channel === 'scale_pivot';
        return sameChannelValues(channel, sanitizeVector(channel, area[channel]), defaults[channel]);
    });
}

function applySavedPresetArea(preset, slotId) {
    let area = preset.areas[slotId];
    if (keepsBedrockDefault(slotId, area)) {
        applyInherit(slotId, true);
        return null;
    }
    return writePresetValues(slotId, area);
}

function notePresetLimits(preset, covered) {
    let effective = getEffectiveGeometryVersion();
    let wroteMatched = preset.matchFirstPerson && !usesCalibratedHold(preset) && covered.some(slotId => FIRST_PERSON_FOR_THIRD_PERSON[slotId]);
    if (usesCalibratedHold(preset) && calibratedHoldRuleDiffers(preset.calibration)) {
        showNotification('preset', i18n('display_sensei.message.calibrated_rule_differs'));
    } else if (wroteMatched) {
        showNotification('preset', i18n('display_sensei.message.preset_matched_first_person'));
    } else if (preset.geometryVersion && effective && !VersionUtil.compare(preset.geometryVersion, '==', effective)) {
        showNotification('preset', i18nFormat('display_sensei.message.preset_source_version', {
            preset: i18n(preset.label),
            version: preset.geometryVersion,
            selected: effective
        }));
    }
}

function applyBedrockPreset(preset, ids, label) {
    if (preset.inherit) {
        runSlotEdit(ids, label, () => ids.forEach(slotId => applyInherit(slotId, true)));
        return true;
    }
    let areas = resolvePresetAreas(preset);
    let covered = areas ? ids.filter(slotId => isPlainObject(areas[slotId])) : [];
    if (!covered.length) return false;
    runSlotEdit(covered, label, () => {
        for (let slotId of covered) {
            writePresetValues(slotId, areas[slotId]);
            if (slotId === 'gui' && typeof areas.gui.fit_to_frame === 'boolean') writeGuiFitToFrame(areas.gui.fit_to_frame);
        }
    });
    notePresetLimits(preset, covered);
    return true;
}

function isPresetUncalibrated(presetId) {
    let preset = findBedrockPreset(presetId);
    return !!preset && !preset.inherit && !resolvePresetAreas(preset);
}

function applySavedPreset(preset, ids, label) {
    let covered = ids.filter(slotId => isPlainObject(preset.areas[slotId]));
    if (!covered.length) return false;
    let turns = [];
    runSlotEdit(covered, label, () => {
        turns = covered.map(slotId => applySavedPresetArea(preset, slotId));
    });
    reportMirrorTurns(turns);
    return true;
}

function applyPreset(presetId, slotIds) {
    if (!isBlockRouteActive()) return false;
    let ids = normalizeSlotIds(slotIds);
    if (!ids.length) return false;
    let label = i18n('display_sensei.undo.apply_preset');
    let preset = findBedrockPreset(presetId === 'block' ? BEDROCK_DEFAULTS_PRESET_ID : presetId);
    if (preset) return applyBedrockPreset(preset, ids, label);
    let saved = findSavedPreset(presetId);
    return saved ? applySavedPreset(saved, ids, label) : false;
}

// =========================
// Blockbench's own Apply Preset menu (block route)
// =========================
let unmappedBlockbenchPresets = new Set();

const BEDROCK_MENU_PRESET_KEY = 'display_sensei_preset';

function showPresetNotApplied(bedrockId) {
    showMessage(bedrockId && isPresetUncalibrated(bedrockId) ? 'display_sensei.message.preset_not_calibrated' : 'display_sensei.message.preset_not_applicable');
}

function applyBlockbenchPreset(original, args) {
    let [preset, all] = args;
    if (!isBlockRouteActive() || !isPlainObject(preset)) return original.apply(this, args);
    let slotIds = all ? undefined : [DisplayMode.display_slot];
    if (typeof preset[BEDROCK_MENU_PRESET_KEY] === 'string') {
        let bedrockId = preset[BEDROCK_MENU_PRESET_KEY];
        if (!applyPreset(bedrockId, slotIds)) showPresetNotApplied(bedrockId);
        return;
    }
    if (!isPlainObject(preset.areas)) return original.apply(this, args);
    let applied;
    let bedrockId = null;
    if (preset.fixed) {
        bedrockId = BEDROCK_PRESET_FOR_BLOCKBENCH[preset.id];
        if (!bedrockId) {
            if (!unmappedBlockbenchPresets.has(preset.id)) {
                unmappedBlockbenchPresets.add(preset.id);
                console.warn(LOG_PREFIX, `Blockbench's preset "${preset.id}" has no Bedrock version; it is applied as it is.`);
            }
            return original.apply(this, args);
        }
        applied = applyPreset(bedrockId, slotIds);
    } else {
        let ids = normalizeSlotIds(slotIds);
        applied = ids.length > 0 && applySavedPreset(preset, ids, i18n('display_sensei.undo.apply_preset'));
    }
    if (!applied) showPresetNotApplied(bedrockId);
}

function wrapBlockbenchApplyPreset() {
    return wrapMethod(DisplayMode, 'applyPreset', applyBlockbenchPreset);
}

function getBedrockMenuLabel(preset) {
    let label = i18n(preset.label);
    return isPresetUncalibrated(preset.id) ? i18nFormat('display_sensei.preset.not_calibrated_label', { name: label }) : label;
}

const BEDROCK_MENU_ICONS = { bedrock: 'build', vanilla: 'category' };

function buildBedrockMenuEntries() {
    let mapped = Object.values(BEDROCK_PRESET_FOR_BLOCKBENCH);
    return BEDROCK_PRESETS.filter(preset => !mapped.includes(preset.id)).map(preset => {
        let request = { [BEDROCK_MENU_PRESET_KEY]: preset.id };
        return {
            icon: BEDROCK_MENU_ICONS[preset.group] || 'label',
            name: getBedrockMenuLabel(preset),
            click() {
                DisplayMode.applyPreset(request);
            },
            children: [
                { name: 'action.apply_display_preset.here', icon: 'done', click() { DisplayMode.applyPreset(request); } },
                { name: 'action.apply_display_preset.everywhere', icon: 'done_all', click() { DisplayMode.applyPreset(request, true); } }
            ]
        };
    });
}

function relabelBlockbenchPresetMenu(original, args) {
    let entries = original.apply(this, args);
    if (!isBlockRouteActive() || isReadingBlockbenchPresets || !Array.isArray(entries)) return entries;
    for (let entry of entries) {
        let preset = readPresetOfMenuEntry(entry);
        let bedrockPreset = preset && preset.fixed ? findBedrockPreset(BEDROCK_PRESET_FOR_BLOCKBENCH[preset.id]) : null;
        if (bedrockPreset) entry.name = getBedrockMenuLabel(bedrockPreset);
    }
    return entries.concat(buildBedrockMenuEntries());
}

function wrapBlockbenchPresetMenu() {
    let action = BarItems.apply_display_preset;
    if (!action || typeof action.children !== 'function') return { delete() {} };
    return wrapMethod(action, 'children', relabelBlockbenchPresetMenu);
}

// =========================
// GUI fit_to_frame
// =========================
function writeGuiFitToFrame(fitToFrame) {
    getProjectData().gui_fit_to_frame = fitToFrame;
    Project.display_settings.gui.fit_to_frame = fitToFrame;
}

function setGuiFitToFrame(value) {
    if (!isBlockRouteActive()) return false;
    let fitToFrame = !!value;
    runSlotEdit(['gui'], i18n('display_sensei.undo.fit_to_frame'), () => writeGuiFitToFrame(fitToFrame));
    return true;
}

// =========================
// Geometry version
// =========================
function getGeometryVersion() {
    if (!isBlockRouteActive()) return null;
    return getProjectData().geometry_version;
}

function setGeometryVersion(version) {
    if (!isBlockRouteActive() || !isSupportedGeometryVersion(version)) return false;
    runProjectDataEdit(i18n('display_sensei.undo.geometry_version'), () => {
        getProjectData().geometry_version = version;
    });
    return true;
}

function effectiveVersionFor(itemDisplayTransforms) {
    let selected = getProjectData().geometry_version;
    let floor = getGeometryVersionFloor(itemDisplayTransforms);
    return floor ? laterGeometryVersion(selected, floor) : selected;
}

function versionWithoutTransforms(blockbenchVersion) {
    let selected = getProjectData().geometry_version;
    return isGeometryVersionString(blockbenchVersion) ? earlierGeometryVersion(blockbenchVersion, selected) : selected;
}

function getEffectiveGeometryVersion() {
    if (!isBlockRouteActive()) return null;
    return effectiveVersionFor(buildItemDisplayTransforms());
}

function getGeometryVersionChoices() {
    if (!isBlockRouteActive()) return null;
    let choices = GEOMETRY_VERSIONS.map(entry => ({ version: entry.version, label: i18n(entry.label), hint: i18n(entry.hint) }));
    let selected = getProjectData().geometry_version;
    if (!choices.some(choice => choice.version === selected)) {
        choices.push({
            version: selected,
            label: i18nFormat('display_sensei.version.from_file', { version: selected }),
            hint: i18n('display_sensei.version.from_file_hint')
        });
        choices.sort((a, b) => VersionUtil.compare(a.version, b.version));
    }
    return choices;
}

function shelfCopiesItemFrame() {
    return isSlotInherited('on_shelf') === true &&
        VersionUtil.compare(getProjectData().geometry_version, '<', SHELF_GEOMETRY_VERSION);
}

// =========================
// Export
// =========================
function buildItemDisplayTransforms() {
    if (!isBlockRouteActive()) return null;
    let data = getProjectData();
    let transforms = {};
    for (let slot of BEDROCK_SLOTS) {
        if (isSlotInherited(slot.id)) continue;
        let values = readSlotValues(slot.id);
        let defaults = engineDefaultsFor(slot.id);
        let unset = data.unset_fields[slot.id] || [];
        let entry = {};
        for (let field of FALLBACK_FIELDS) {
            if (unset.includes(field) && sameChannelValues(field, values[field], defaults[field])) continue;
            entry[field] = sanitizeVector(field, values[field]);
        }
        if (!isZeroVector(values.rotation_pivot)) entry.rotation_pivot = sanitizeVector('rotation_pivot', values.rotation_pivot);
        if (!isZeroVector(values.scale_pivot)) entry.scale_pivot = sanitizeVector('scale_pivot', values.scale_pivot);
        if (slot.id === 'gui') entry.fit_to_frame = data.gui_fit_to_frame;
        transforms[slot.bedrockKey] = entry;
    }
    return Object.keys(transforms).length ? transforms : null;
}

// =========================
// Preview
// =========================
function refreshDisplayPreview(slotIds) {
    if (!isBlockRouteActive()) return;
    let shownSlotId = DisplayMode.display_slot;
    let shownSlotChanged = !slotIds || slotIds.includes(shownSlotId) || (shownSlotId === 'on_shelf' && slotIds.includes('fixed'));
    if (Modes.display && shownSlotChanged && Project.display_settings[shownSlotId]) {
        DisplayMode.updateDisplayBase();
    }
    if (DisplayMode.vue) DisplayMode.vue.$forceUpdate();
    refreshPanel();
}

// =========================
// Reading geometry files
// =========================
const geometryFileInfo = new WeakMap();

function rememberGeometryFile(data, args) {
    let geometries = data && data['minecraft:geometry'];
    if (!Array.isArray(geometries)) return;
    let info = {
        formatVersion: data.format_version,
        importing: args === true || !!(args && args.import_to_current_project)
    };
    for (let geometry of geometries) {
        if (isPlainObject(geometry)) geometryFileInfo.set(geometry, info);
    }
}

function wrapBedrockParse() {
    return wrapMethod(Codecs.bedrock, 'parse', function(original, args) {
        rememberGeometryFile(args[0], args[2]);
        return original.apply(this, args);
    });
}

function fileNumber(value, fallback) {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function turnMirroredEntry(entry, slotId, flags, getSize) {
    let defaults = engineDefaultsFor(slotId);
    let values = {};
    for (let channel of SLOT_CHANNELS) {
        let fallback = defaults[channel];
        values[channel] = Array.isArray(entry[channel]) ? [0, 1, 2].map(axis => fileNumber(entry[channel][axis], fallback[axis])) : fallback.slice();
    }
    let result = computeMirrorTurn(slotId, values, flags, getSize);
    entry.rotation = result.rotation;
    if (!sameVector(result.translation, values.translation)) entry.translation = result.translation;
    return result.turn;
}

function prepareTransformsForBlockbench(transforms, geometry) {
    if ('shelf' in transforms) {
        transforms.on_shelf = transforms.shelf;
        delete transforms.shelf;
    }
    let clamped = false;
    let turns = [];
    let size = null;
    let getSize = () => size || (size = measureGeometrySize(geometry));
    for (let [slotId, entry] of Object.entries(transforms)) {
        if (!isPlainObject(entry)) continue;
        let mirror = Array.isArray(entry.scale) ? [0, 1, 2].map(axis => typeof entry.scale[axis] === 'number' && entry.scale[axis] < 0) : [false, false, false];
        for (let channel of SLOT_CHANNELS) {
            if (channel === 'rotation' || !Array.isArray(entry[channel])) continue;
            let values = entry[channel].map(value => (typeof value === 'number' ? sanitizeSlotValue(channel, value) : value));
            let read = channel === 'scale' ? entry[channel].map(value => (typeof value === 'number' ? Math.abs(value) : value)) : entry[channel];
            if (values.some((value, axis) => value !== read[axis])) clamped = true;
            entry[channel] = values;
        }
        if (mirror.some(Boolean) && findBedrockSlot(slotId)) turns.push(turnMirroredEntry(entry, slotId, mirror, getSize));
    }
    return { clamped, turns };
}

function readBlockGeometry(geometry, file) {
    let transforms = isPlainObject(geometry.item_display_transforms) ? geometry.item_display_transforms : {};
    let prepared = prepareTransformsForBlockbench(transforms, geometry);

    updateProjectData(data => {
        for (let slot of BEDROCK_SLOTS) {
            let entry = transforms[slot.id];
            if (isPlainObject(entry)) {
                data.inherit[slot.id] = false;
                data.unset_fields[slot.id] = FALLBACK_FIELDS.filter(field => !Array.isArray(entry[field]));
            } else if (!file.importing) {
                data.inherit[slot.id] = true;
                delete data.unset_fields[slot.id];
            }
        }
        let gui = transforms.gui;
        if (isPlainObject(gui)) {
            data.gui_fit_to_frame = typeof gui.fit_to_frame === 'boolean' ? gui.fit_to_frame : true;
        } else if (!file.importing) {
            data.gui_fit_to_frame = true;
        }
        if (!file.importing) {
            data.geometry_version = isSupportedGeometryVersion(file.formatVersion) ? file.formatVersion : DEFAULT_GEOMETRY_VERSION;
        }
    });
    if (prepared.clamped) showNotification('values_clamped', i18n('display_sensei.message.file_values_clamped'));
    reportMirrorTurns(prepared.turns, true);
}

function readEntityGeometry(geometry, file) {
    if (file.importing) return;
    let transforms = geometry.item_display_transforms;
    updateProjectData(data => {
        data.entity_display_transforms = isPlainObject(transforms) && Object.keys(transforms).length ? cloneJson(transforms) : null;
    });
}

function onBedrockGeometryParse(event) {
    let geometry = event && event.model;
    if (!isPlainObject(geometry) || !Project) return;
    let file = geometryFileInfo.get(geometry) || { formatVersion: null, importing: false };
    if (getRoute() === 'block') {
        readBlockGeometry(geometry, file);
    } else if (isEntityFormat()) {
        readEntityGeometry(geometry, file);
    }
}

function hasEntityDisplayTransforms() {
    return isEntityFormat() && !!Project && !!getProjectData().entity_display_transforms;
}

// =========================
// Writing geometry files
// =========================
let lastCompiledVersion = null;

function onBedrockCompile(event) {
    let model = event && event.model;
    let geometries = model && model['minecraft:geometry'];
    if (!Array.isArray(geometries) || !Project) return;
    let route = getRoute();
    if (route === 'none') return;
    let wizard = getWizardEntityCompileSource(event);
    if (wizard) {
        stripItemDisplayTransforms(geometries);
        if (wizard === 'item') noteItemWizardCompile();
        return;
    }
    if (route === 'block') {
        let transforms = buildItemDisplayTransforms();
        for (let geometry of geometries) {
            if (!isPlainObject(geometry)) continue;
            if (transforms) {
                geometry.item_display_transforms = cloneJson(transforms);
            } else {
                delete geometry.item_display_transforms;
            }
        }
        model.format_version = transforms ? effectiveVersionFor(transforms) : versionWithoutTransforms(model.format_version);
        lastCompiledVersion = model.format_version;
        if (isBlockWizardCompile(event)) noteBlockWizardCompile(transforms);
    } else if (isEntityFormat()) {
        let kept = getProjectData().entity_display_transforms;
        for (let geometry of geometries) {
            if (!isPlainObject(geometry)) continue;
            if (kept) {
                geometry.item_display_transforms = cloneJson(kept);
            } else {
                delete geometry.item_display_transforms;
            }
        }
    }
}

// =========================
// Saving over an existing file
// =========================
function chooseFileVersion(file, fileVersion) {
    if (!isPlainObject(file) || !Array.isArray(file['minecraft:geometry']) || !lastCompiledVersion) return;
    let ownVersion = lastCompiledVersion;
    if (!isGeometryVersionString(fileVersion)) {
        file.format_version = ownVersion;
        return;
    }
    if (file['minecraft:geometry'].length < 2) {
        file.format_version = laterGeometryVersion(fileVersion, ownVersion);
        return;
    }
    let transforms = buildItemDisplayTransforms();
    let needed = transforms ? getGeometryVersionFloor(transforms) : ownVersion;
    let version = laterGeometryVersion(fileVersion, needed);
    file.format_version = version;
    let crossed = GEOMETRY_MILESTONES.filter(milestone =>
        VersionUtil.compare(fileVersion, '<', milestone) && VersionUtil.compare(version, '>=', milestone));
    if (crossed.length) {
        showNotification('file_version', i18nFormat('display_sensei.message.file_version_raised', { from: fileVersion, version }));
    } else if (VersionUtil.compare(ownVersion, '>', version)) {
        showNotification('file_version', i18nFormat('display_sensei.message.file_version_kept', { version, chosen: ownVersion }));
    }
}

function wrapBedrockOverwrite() {
    return wrapMethod(Codecs.bedrock, 'overwrite', function(original, args) {
        return runInsideBedrockOverwrite(() => {
            if (getRoute() !== 'block') return original.apply(this, args);
            let readJson = window.autoParseJSON;
            let writeJson = window.autoStringify;
            let fileVersion = null;
            let readFile = function(...parseArgs) {
                let data = readJson.apply(this, parseArgs);
                if (fileVersion === null && isPlainObject(data)) fileVersion = data.format_version;
                return data;
            };
            let writeFile = function(object) {
                chooseFileVersion(object, fileVersion);
                return writeJson.apply(this, arguments);
            };
            lastCompiledVersion = null;
            return withTemporaryValue(window, 'autoParseJSON', readFile, () =>
                withTemporaryValue(window, 'autoStringify', writeFile, () => original.apply(this, args)));
        });
    });
}

// =========================
// .bbmodel files
// =========================
function onProjectCompile(event) {
    let model = event && event.model;
    if (!isBlockRouteActive() || !model || !isPlainObject(model.display)) return;
    for (let slot of BEDROCK_SLOTS) {
        if (slot.id in model.display && isSlotInherited(slot.id)) delete model.display[slot.id];
    }
    if (!Object.keys(model.display).length) delete model.display;
}

let mergeStarting = false;
let mergeSave = null;

function onProjectMerge() {
    mergeStarting = isBlockRouteActive();
}

function onInitEdit(event) {
    if (!mergeStarting) return;
    mergeStarting = false;
    mergeSave = event && event.save;
}

function onProjectFileParsed() {
    mergeStarting = false;
    mergeSave = null;
    if (!isBlockRouteActive()) return;
    let gui = Project.display_settings.gui;
    if (gui) gui.fit_to_frame = getProjectData().gui_fit_to_frame;
}

// =========================
// Following Blockbench's own edits
// =========================
function sanitizeSlot(slot) {
    let clamped = false;
    for (let channel of SLOT_CHANNELS) {
        let values = slot[channel].map(value => sanitizeSlotValue(channel, value));
        if (values.every((value, axis) => value === slot[channel][axis])) continue;
        slot[channel].replace(values);
        if (channel !== 'rotation') clamped = true;
    }
    return clamped;
}

function followEditedSlot(slotId, save) {
    let before = save.display_slots ? save.display_slots[slotId] : undefined;
    if (before === undefined) return;
    let data = getProjectData();
    let dataBefore = save[PROJECT_DATA_KEY];
    if (dataBefore && dataBefore.inherit && dataBefore.inherit[slotId] !== data.inherit[slotId]) return;
    let reference = before || new DisplaySlot(slotId).copy();
    let slot = Project.display_settings[slotId];
    let changed = SLOT_CHANNELS.filter(channel => !sameChannelValues(channel, reference[channel], slot[channel]));
    if (!changed.length) return;
    data.inherit[slotId] = false;
    forgetUnsetFields(data, slotId, changed);
}

function syncGuiFitToFrame(save, followChange) {
    let gui = Project.display_settings.gui;
    let before = save.display_slots && save.display_slots.gui;
    if (!gui || !before || before.fit_to_frame === gui.fit_to_frame) return;
    let onlyFitChanged = SLOT_CHANNELS.every(channel => sameChannelValues(channel, before[channel], gui[channel]));
    if (followChange && onlyFitChanged) {
        getProjectData().gui_fit_to_frame = gui.fit_to_frame;
    } else {
        gui.fit_to_frame = getProjectData().gui_fit_to_frame;
    }
}

function onFinishEdit(event) {
    let slotIds = event && event.aspects && event.aspects.display_slots;
    let save = Undo.current_save;
    if (isFinishingOwnEdit || !isBlockRouteActive() || !Array.isArray(slotIds) || !save) return;
    let merging = save === mergeSave;
    if (merging) mergeSave = null;
    let turns = [];
    let clamped = false;
    for (let slotId of slotIds) {
        let slot = Project.display_settings[slotId];
        if (!slot || !findBedrockSlot(slotId)) continue;
        let turn = convertMirrorToTurn(slot);
        if (turn) turns.push(turn);
        if (sanitizeSlot(slot)) clamped = true;
        if (!merging) followEditedSlot(slotId, save);
    }
    if (slotIds.includes('gui')) syncGuiFitToFrame(save, !merging);
    if (turns.length || clamped) refreshDisplayPreview(slotIds);
    reportMirrorTurns(turns, clamped);
    if (clamped) showMessage('display_sensei.message.values_clamped');
}

function reseedInheritedSlotsAfterUndo(event) {
    let save = event && event.save;
    if (!isBlockRouteActive() || !save || !(save.display_slots || save[PROJECT_DATA_KEY])) return;
    restoreProjectDataFromUndo(save);
    Object.keys(save.display_slots || {}).forEach(ensureSlot);
    refreshDisplayPreview();
}

function onConvertFormat() {
    if (!isBlockRouteActive()) return;
    let turns = BEDROCK_SLOTS.map(slot => convertMirrorToTurn(Project.display_settings[slot.id])).filter(Boolean);
    if (!turns.length) return;
    refreshDisplayPreview();
    reportMirrorTurns(turns, true);
}

// =========================
// Install
// =========================
function resetSeededSlots() {
    for (let project of ModelProject.all) {
        if (!project.format || project.format.id !== BLOCK_FORMAT_ID) continue;
        let data = getProjectData(project);
        for (let slot of BEDROCK_SLOTS) {
            let displaySlot = project.display_settings[slot.id];
            if (displaySlot && seededSlots.has(displaySlot) && data.inherit[slot.id] && matchesEngineDefaults(displaySlot)) {
                displaySlot.default();
                displaySlot.update();
            }
        }
    }
}

function installBlockRoute() {
    let hooks = createDeletables([
        wrapBedrockParse,
        wrapBedrockOverwrite,
        () => Codecs.bedrock.on('parse', guardListener('bedrock parse', onBedrockGeometryParse)),
        () => Codecs.bedrock.on('compile', guardListener('bedrock compile', onBedrockCompile)),
        () => Codecs.project.on('compile', guardListener('project compile', onProjectCompile)),
        () => Codecs.project.on('merge', guardListener('project merge', onProjectMerge)),
        () => Codecs.project.on('parsed', guardListener('project parsed', onProjectFileParsed)),
        () => Blockbench.on('init_edit', guardListener('init_edit', onInitEdit)),
        () => Blockbench.on('finish_edit', guardListener('finish_edit', onFinishEdit)),
        () => Blockbench.on('load_undo_save', guardListener('load_undo_save', reseedInheritedSlotsAfterUndo)),
        () => Blockbench.on('convert_format', guardListener('convert_format', onConvertFormat)),
        wrapBlockbenchApplyPreset,
        wrapBlockbenchPresetMenu
    ]);
    return {
        delete() {
            hooks.delete();
            openSlotEdit = null;
            savedPresets = {};
            savedPresetIds = new WeakMap();
            savedPresetCount = 0;
            unmappedBlockbenchPresets = new Set();
            isReadingBlockbenchPresets = false;
            lastCompiledVersion = null;
            mergeStarting = false;
            mergeSave = null;
            resetSeededSlots();
            seededSlots = new WeakSet();
        }
    };
}

registerModuleInstaller('block_route', installBlockRoute);
