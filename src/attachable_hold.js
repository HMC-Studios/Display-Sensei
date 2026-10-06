// =========================
// Held 3D items: holds (back end)
// =========================

// =========================
// Values
// =========================
const HOLD_RANGES = Object.freeze({
    position: Object.freeze([-128, 128]),
    rotation: Object.freeze([-360, 360]),
    scale: Object.freeze([-16, 16])
});

const HOLD_READ_ONLY_STATUSES = ['stacked', 'controller'];

function sanitizeHoldValue(channel, value) {
    let number = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(number) || !HOLD_RANGES[channel]) return null;
    if (channel === 'rotation') return roundHoldNumber(wrapAngle(number));
    return roundHoldNumber(clampToRange(number, HOLD_RANGES[channel]));
}

function readKeyframeFileValue(keyframe, channel, axis) {
    let point = keyframe.data_points[0];
    let raw = point ? point[HOLD_AXIS_LETTERS[axis]] : undefined;
    if (raw === undefined || raw === null || raw === '') return getHoldIdentity(channel)[axis];
    raw = readHoldNumberText(raw);
    if (!isHoldAxisFlipped(channel, axis)) return raw;
    return typeof raw === 'number' ? -raw : invertMolang(String(raw));
}

function toBlockbenchHoldValue(channel, axis, expression) {
    if (!isHoldAxisFlipped(channel, axis)) return expression;
    return typeof expression === 'number' ? roundHoldNumber(-expression) : invertMolang(expression);
}

function readShownTables(keyframe, channel) {
    return [0, 1, 2].map(axis => {
        let value = getHoldIdentity(channel)[axis];
        try {
            let calculated = keyframe.calc(HOLD_AXIS_LETTERS[axis], 0);
            if (Number.isFinite(calculated)) value = isHoldAxisFlipped(channel, axis) ? -calculated : calculated;
        } catch (error) {
        }
        return fillHoldTable(() => roundHoldNumber(value));
    });
}

function readHoldChannel(animator, channel) {
    let keyframes = animator && Array.isArray(animator[channel]) ? animator[channel] : [];
    if (!keyframes.length) {
        return { tables: getHoldIdentity(channel).map(value => fillHoldTable(() => value)), editable: true, keyframe: null, reason: null };
    }
    let keyframe = keyframes[0];
    let single = keyframes.length === 1 && Math.abs(keyframe.time) < HOLD_TIME_EPSILON && keyframe.data_points.length === 1;
    if (single) {
        let tables = [0, 1, 2].map(axis => readHoldMolangTable(readKeyframeFileValue(keyframe, channel, axis)));
        if (tables.every(Boolean)) return { tables, editable: true, keyframe, reason: null };
    }
    return { tables: readShownTables(keyframe, channel), editable: false, keyframe, reason: single ? 'molang' : 'animated' };
}

function readHoldCellValues(link, cell) {
    let info = link.cells[cell];
    let result = { values: cloneJson(HOLD_IDENTITY), editable: {}, reason: null };
    let readOnly = HOLD_READ_ONLY_STATUSES.includes(info.status) || !link.bone;
    let animator = readOnly ? null : findHoldAnimator(findHoldAnimation(info.animation), link.bone);
    for (let channel of HOLD_CHANNELS) {
        let read = readHoldChannel(animator, channel);
        result.values[channel] = read.tables.map(table => roundHoldNumber(table[cell]));
        result.editable[channel] = !readOnly && read.editable;
        if (!result.reason && read.reason) result.reason = read.reason;
    }
    if (readOnly) result.reason = link.bone ? info.status : 'no_bone';
    return result;
}

// =========================
// Rotations (Bedrock bones turn Z, then Y, then X)
// =========================
function holdRotationQuaternion(rotation) {
    let turned = toBlockbenchRotation(rotation);
    return new THREE.Quaternion().setFromEuler(new THREE.Euler(turned[0] * DEGREES, turned[1] * DEGREES, turned[2] * DEGREES, 'ZYX'));
}

function readHoldEulerAngles(quaternion) {
    let e = new THREE.Matrix4().makeRotationFromQuaternion(quaternion).elements;
    let toDegrees = 180 / Math.PI;
    let cosY = Math.hypot(e[0], e[1]);
    if (cosY < GIMBAL_EPSILON) {
        let side = -e[2] >= 0 ? 1 : -1;
        return [Math.atan2(side * e[4], e[5]) * toDegrees, side * 90, 0].map(wrapAngle);
    }
    let first = [Math.atan2(e[6], e[10]), Math.atan2(-e[2], cosY), Math.atan2(e[1], e[0])].map(angle => wrapAngle(angle * toDegrees));
    let second = [first[0] + 180, 180 - first[1], first[2] + 180].map(wrapAngle);
    let size = angles => angles.reduce((sum, angle) => sum + Math.abs(angle), 0);
    return size(second) < size(first) - VALUE_EPSILON ? second : first;
}

function foldHoldGimbal(angles) {
    let side = Math.sign(angles[1]);
    let change = Math.abs(Math.abs(angles[1]) - 90);
    if (!side || change > NEAR_GIMBAL_DEGREES) return null;
    return { angles: [wrapAngle(angles[0] - side * angles[2]), side * 90, 0], change: roundHoldNumber(change) };
}

function holdRotationFromQuaternion(quaternion, fold = true) {
    let angles = readHoldEulerAngles(quaternion);
    let folded = fold ? foldHoldGimbal(angles) : null;
    if (folded) angles = folded.angles;
    return { rotation: toBlockbenchRotation(angles).map(value => sanitizeHoldValue('rotation', value) + 0), change: folded ? folded.change : 0 };
}

function holdMatrix(values) {
    let position = toBlockbenchPosition(values.position);
    let scale = values.scale.map(value => (Math.abs(value) < 0.0001 ? 0.0001 : value));
    return new THREE.Matrix4().compose(new THREE.Vector3().fromArray(position), holdRotationQuaternion(values.rotation), new THREE.Vector3().fromArray(scale));
}

function holdValuesFromMatrix(matrix) {
    let position = new THREE.Vector3();
    let quaternion = new THREE.Quaternion();
    let scale = new THREE.Vector3();
    matrix.decompose(position, quaternion, scale);
    let turned = holdRotationFromQuaternion(quaternion);
    let values = {
        position: toBlockbenchPosition(position.toArray()).map(value => sanitizeHoldValue('position', value) + 0),
        rotation: turned.rotation,
        scale: scale.toArray().map(value => sanitizeHoldValue('scale', value) + 0)
    };
    let clamped = position.toArray().some(value => Math.abs(value) > HOLD_RANGES.position[1]) ||
        scale.toArray().some(value => Math.abs(value) > HOLD_RANGES.scale[1]);
    return { values, clamped, turned: turned.change };
}

function mirrorHoldValues(values) {
    return {
        position: [-values.position[0], values.position[1], values.position[2]].map(value => value + 0),
        rotation: [values.rotation[0], -values.rotation[1], -values.rotation[2]].map(value => value + 0),
        scale: values.scale.slice()
    };
}

function getHoldGimbal(rotation) {
    let angles = toBlockbenchRotation(rotation);
    let folded = foldHoldGimbal(angles);
    if (!folded) return null;
    let tidy = toBlockbenchRotation(folded.angles).map(value => value + 0);
    let same = tidy.every((value, axis) => sameAngle(value, rotation[axis]));
    return { y: tidy[1], change: folded.change, tidy: same ? null : tidy };
}

// =========================
// What the panel reads
// =========================
function isHoldEditingMode() {
    return !!Project && getRoute() === 'attachable' && !Modes.animate;
}

function getOffHandMode(link, view) {
    let main = link.cells[holdCellKey(view, 'main_hand')];
    let off = link.cells[holdCellKey(view, 'off_hand')];
    if (!main.animation || main.animation !== off.animation || HOLD_READ_ONLY_STATUSES.includes(main.status)) return 'separate';
    if (getProjectData().holds.off_hand[view] === 'own') return 'own';
    let mainValues = readHoldCellValues(link, holdCellKey(view, 'main_hand')).values;
    let offValues = readHoldCellValues(link, holdCellKey(view, 'off_hand')).values;
    return JSON.stringify(mainValues) === JSON.stringify(offValues) ? 'same' : 'own';
}

function buildHoldState(link, slot) {
    let info = link.cells[slot.cell];
    let read = readHoldCellValues(link, slot.cell);
    let offHand = getOffHandMode(link, slot.view);
    return {
        id: slot.slotId,
        view: slot.view,
        hand: slot.hand,
        cell: slot.cell,
        values: read.values,
        editable: read.editable,
        reason: read.reason,
        status: info.status,
        animation: info.animation,
        short: info.short,
        plays: info.plays.slice(),
        file: info.file || null,
        bone: link.bone ? link.bone.name : null,
        offHand,
        sameAsMain: slot.hand === 'off_hand' && offHand === 'same',
        gimbal: getHoldGimbal(read.values.rotation),
        editing: isHoldEditingMode()
    };
}

function getHoldState(slotId) {
    let slot = findHoldSlot(slotId);
    if (!slot || !Project || getRoute() !== 'attachable') return null;
    return buildHoldState(analyseHolds(), slot);
}

function getHoldValues(slotId) {
    let state = getHoldState(slotId);
    return state ? state.values : null;
}

function getHoldPose(slotId) {
    let slot = findHoldSlot(slotId);
    if (!slot || !Project || getRoute() !== 'attachable') return null;
    let link = analyseHolds();
    if (!link.bone) return null;
    return { bone: link.bone, values: readHoldCellValues(link, slot.cell).values };
}

function getHoldWearState(project = Project) {
    if (!project || getRoute() !== 'attachable') return { worn: false, slot: null };
    let wear = getWearInfo(project);
    let slot = wear.slot || (Array.isArray(wear.slots) ? wear.slots[0] : null) || null;
    let worn = wear.kind === 'armor' || (wear.kind === 'worn' && isArmorSlotId(slot));
    return { worn, slot: worn && isArmorSlotId(slot) ? slot : null };
}

function prepareHoldEditing() {
    if (!Project || getRoute() !== 'attachable') return false;
    ensureHoldAnimationsLoaded();
    noteHoldFilesSeen(analyseHolds());
    return true;
}

function getHoldOverview() {
    if (!Project || getRoute() !== 'attachable') return null;
    let link = analyseHolds();
    return {
        source: link.source,
        attachable: link.attachable,
        bone: link.bone,
        cells: cloneJson(link.cells),
        checks: runHoldRigChecks(getHoldValues),
        editing: isHoldEditingMode()
    };
}

// =========================
// Writing into the keyframes
// =========================
function createHoldAnimation(name) {
    let animation = new Animation({ name, loop: 'loop', saved: false });
    animation.add(false);
    if (openHoldEdit && openHoldEdit.project === Project) openHoldEdit.created.push(animation);
    return animation;
}

function setHoldKeyframe(animator, channel, keyframe, expressions) {
    let points = expressions.map((expression, axis) => toBlockbenchHoldValue(channel, axis, expression));
    if (!keyframe) {
        animator.addKeyframe({ channel, time: 0, uniform: false, data_points: [{ x: points[0], y: points[1], z: points[2] }] });
        return;
    }
    if (keyframe.uniform && !points.every(point => String(point) === String(points[0]))) keyframe.uniform = false;
    HOLD_AXIS_LETTERS.forEach((letter, axis) => keyframe.set(letter, points[axis]));
}

function writeHoldValues(link, slot, channel, axisValues, options = {}) {
    let info = link.cells[slot.cell];
    let bone = findHoldBone();
    if (!bone || !info.animation || HOLD_READ_ONLY_STATUSES.includes(info.status)) return false;
    let animation = findHoldAnimation(info.animation);
    let existing = animation ? findHoldAnimator(animation, bone) : null;
    let read = readHoldChannel(existing, channel);
    if (!read.editable) return false;
    let mode = options.mode || getOffHandMode(link, slot.view);
    let cells = [slot.cell];
    if (slot.hand === 'main_hand' && mode === 'same') cells.push(holdCellKey(slot.view, 'off_hand'));
    let tables = read.tables.map((table, axis) => {
        let value = axisValues[axis];
        if (value === null || value === undefined) return table;
        let next = Object.assign({}, table);
        for (let cell of cells) next[cell] = value;
        return next;
    });
    if (tables.every((table, axis) => sameHoldTables(table, read.tables[axis], info.plays))) return false;
    if (!animation) animation = createHoldAnimation(info.animation);
    let animator = findHoldAnimator(animation, bone) || animation.getBoneAnimator(bone.group);
    setHoldKeyframe(animator, channel, read.keyframe, tables.map(table => composeHoldMolang(table, info.plays)));
    if (slot.hand === 'off_hand' && mode === 'same' && !options.keepMode) getProjectData().holds.off_hand[slot.view] = 'own';
    return true;
}

function writeHoldPose(link, slot, values, options = {}) {
    let changed = false;
    let mode = options.mode || getOffHandMode(link, slot.view);
    for (let channel of HOLD_CHANNELS) {
        if (!values[channel]) continue;
        let clean = values[channel].map(value => sanitizeHoldValue(channel, value));
        if (writeHoldValues(analyseHolds(), slot, channel, clean, Object.assign({}, options, { mode }))) changed = true;
    }
    return changed;
}

// =========================
// Undo steps
// =========================
let openHoldEdit = null;

function getHoldAnimationsForUndo() {
    let link = analyseHolds();
    let names = [];
    for (let cell of HOLD_CELLS) {
        let name = link.cells[cell].animation;
        if (name && !names.includes(name)) names.push(name);
    }
    return names.map(findHoldAnimation).filter(Boolean);
}

function readHoldSignature() {
    let link = analyseHolds();
    let holds = getProjectData().holds;
    return JSON.stringify({
        cells: HOLD_CELLS.map(cell => readHoldCellValues(link, cell).values),
        off_hand: holds.off_hand,
        start: holds.start
    });
}

function isOwnHoldEditOpen() {
    return !!openHoldEdit && openHoldEdit.project === Project && !!Project && Undo.current_save === openHoldEdit.save;
}

function beginHoldEdit() {
    if (!isHoldEditingMode()) return false;
    if (isOwnHoldEditOpen()) return true;
    if (Undo.current_save) return false;
    let before = readHoldSignature();
    let save = Undo.initEdit({ animations: getHoldAnimationsForUndo(), [PROJECT_DATA_UNDO_ASPECT]: true });
    openHoldEdit = { save, project: Project, created: [], before };
    return true;
}

function takeOpenHoldEdit() {
    let edit = openHoldEdit;
    openHoldEdit = null;
    if (!edit || edit.project.undo.current_save !== edit.save) return null;
    if (edit.project !== Project) {
        edit.project.undo.cancelEdit(false);
        return null;
    }
    return edit;
}

function removeCreatedHoldAnimations(edit) {
    for (let animation of edit.created) {
        if (Animation.all.includes(animation)) animation.remove(false, false);
    }
}

function finishHoldEdit(label) {
    let edit = takeOpenHoldEdit();
    if (!edit) return false;
    if (readHoldSignature() === edit.before) {
        Undo.cancelEdit(false);
        removeCreatedHoldAnimations(edit);
        refreshHoldPreview();
        return false;
    }
    Undo.finishEdit(label || i18n('display_sensei.undo.hold_edit'), { animations: getHoldAnimationsForUndo(), [PROJECT_DATA_UNDO_ASPECT]: true });
    refreshHoldPreview();
    return true;
}

function cancelHoldEdit() {
    let edit = takeOpenHoldEdit();
    if (!edit) return false;
    Undo.cancelEdit(true);
    removeCreatedHoldAnimations(edit);
    refreshHoldPreview();
    return true;
}

function runHoldEdit(label, change) {
    if (!isHoldEditingMode()) return false;
    let result;
    if (isOwnHoldEditOpen()) {
        result = change();
    } else {
        if (Undo.current_save || !beginHoldEdit()) return false;
        try {
            result = change();
        } catch (error) {
            cancelHoldEdit();
            throw error;
        }
        finishHoldEdit(label);
    }
    refreshHoldPreview();
    return result !== false;
}

function refreshHoldPreview() {
    refreshArmorPreviewSafely();
    refreshPanelSafely();
}

// =========================
// Editing
// =========================
function setHoldChannel(slotId, channel, values, label = null) {
    let slot = findHoldSlot(slotId);
    if (!slot || !HOLD_CHANNELS.includes(channel) || !Array.isArray(values)) return false;
    let clean = [0, 1, 2].map(axis => (values[axis] === null || values[axis] === undefined ? null : sanitizeHoldValue(channel, values[axis])));
    if (clean.every(value => value === null)) return false;
    return runHoldEdit(label || i18n('display_sensei.undo.hold_edit'), () => writeHoldValues(analyseHolds(), slot, channel, clean));
}

function setHoldAxis(slotId, channel, axis, value) {
    if (![0, 1, 2].includes(axis)) return false;
    let values = [null, null, null];
    values[axis] = value;
    return setHoldChannel(slotId, channel, values);
}

function getHoldChannelDefault(slotId, channel) {
    return findHoldSlot(slotId) && HOLD_CHANNELS.includes(channel) ? getHoldIdentity(channel) : null;
}

function resetHoldChannel(slotId, channel) {
    let values = getHoldChannelDefault(slotId, channel);
    return values ? setHoldChannel(slotId, channel, values, i18n('display_sensei.undo.hold_reset_channel')) : false;
}

function setHoldPose(slotId, values, label) {
    let slot = findHoldSlot(slotId);
    if (!slot || !values) return false;
    return runHoldEdit(label, () => writeHoldPose(analyseHolds(), slot, values));
}

function setHoldOffHandSame(view, same) {
    if (!HOLD_VIEWS.includes(view)) return false;
    let link = analyseHolds();
    if (getOffHandMode(link, view) === 'separate') return false;
    let label = i18n(same ? 'display_sensei.undo.hold_off_hand_same' : 'display_sensei.undo.hold_off_hand_own');
    return runHoldEdit(label, () => {
        let holds = getProjectData().holds;
        if (!same) {
            holds.off_hand[view] = 'own';
            return true;
        }
        delete holds.off_hand[view];
        let main = readHoldCellValues(analyseHolds(), holdCellKey(view, 'main_hand')).values;
        let slot = findHoldSlot(findHoldSlotId(view, 'off_hand'));
        writeHoldPose(analyseHolds(), slot, main, { mode: 'own', keepMode: true });
        return true;
    });
}

function copyHoldFromOtherHand(slotId, mirror) {
    let slot = findHoldSlot(slotId);
    if (!slot) return false;
    let link = analyseHolds();
    let values = readHoldCellValues(link, holdCellKey(slot.view, getOtherHoldHand(slot.hand))).values;
    if (mirror) values = mirrorHoldValues(values);
    let label = i18n(mirror ? 'display_sensei.undo.hold_mirror' : 'display_sensei.undo.hold_same_pose');
    return setHoldPose(slotId, values, label);
}

function turnHoldAboutItemAxis(slotId, axis, degrees, label = null) {
    let axisIndex = TURN_AXES.indexOf(axis);
    let amount = Number(degrees);
    let state = getHoldState(slotId);
    if (!state || axisIndex < 0 || !Number.isFinite(amount) || amount === 0 || !state.editable.rotation) return false;
    let turn = axisIndex === 2 ? amount : -amount;
    let axisVector = new THREE.Vector3().setComponent(axisIndex, 1);
    let rotation = holdRotationQuaternion(state.values.rotation).multiply(new THREE.Quaternion().setFromAxisAngle(axisVector, turn * DEGREES));
    let turned = holdRotationFromQuaternion(rotation, false).rotation;
    return setHoldChannel(slotId, 'rotation', turned, label || i18n('display_sensei.undo.hold_turn_item'));
}

function turnHold180(slotId, axis) {
    return turnHoldAboutItemAxis(slotId, axis, 180, i18n('display_sensei.undo.hold_turn'));
}

function getHoldGimbalState(slotId) {
    let state = getHoldState(slotId);
    return state ? state.gimbal : null;
}

function tidyHoldRotation(slotId) {
    let gimbal = getHoldGimbalState(slotId);
    if (!gimbal || !gimbal.tidy) return null;
    let done = setHoldChannel(slotId, 'rotation', gimbal.tidy, i18n('display_sensei.undo.hold_tidy_rotation'));
    return done ? { rotation: gimbal.tidy.slice(), change: gimbal.change } : null;
}

// =========================
// Copy and paste
// =========================
let copiedHoldValues = null;

function copyHoldValues(slotId) {
    let values = getHoldValues(slotId);
    if (!values) return false;
    copiedHoldValues = cloneJson(values);
    return true;
}

function hasCopiedHoldValues() {
    return !!copiedHoldValues;
}

function pasteHoldValues(slotId) {
    if (!copiedHoldValues) return false;
    return setHoldPose(slotId, copiedHoldValues, i18n('display_sensei.undo.hold_paste'));
}

// =========================
// Presets
// =========================
const HOLD_PRESET_GROUPS = [
    { id: 'file', label: 'display_sensei.hold_preset.group_file' },
    { id: 'item_wizard', label: 'display_sensei.hold_preset.group_item_wizard' },
    { id: 'vanilla', label: 'display_sensei.hold_preset.group_vanilla' }
];

const HOLD_PRESETS = [
    {
        id: 'item_wizard_item', group: 'item_wizard', label: 'display_sensei.hold_preset.item_wizard_item', note: 'display_sensei.hold_preset.item_wizard_item_note', pivot: [0, 0, 0],
        first_person: { position: [9, 18, 5], rotation: [90, 56, -32], scale: [1, 1, 1] },
        third_person: { position: [0.5, 19, -2.5], rotation: [25, 0, 0], scale: [0.85, 0.85, 0.85] }
    },
    {
        id: 'item_wizard_tool', group: 'item_wizard', label: 'display_sensei.hold_preset.item_wizard_tool', note: 'display_sensei.hold_preset.item_wizard_tool_note', pivot: [0, 0, 0],
        first_person: { position: [3, 23, 4], rotation: [66, 60, -60], scale: [1, 1, 1] },
        third_person: { position: [0.5, 22.5, -0.5], rotation: [90, 0, 0], scale: [1, 1, 1] }
    },
    {
        id: 'vanilla_spyglass', group: 'vanilla', label: 'display_sensei.hold_preset.vanilla_spyglass', note: 'display_sensei.hold_preset.vanilla_spyglass_note', pivot: [0, 0, 0],
        first_person: { position: [2, 25, -1], rotation: [58, -48, -44], scale: [1, 1, 1] },
        third_person: { position: [1, 22, 0], rotation: [0, -90, 0], scale: [1, 1, 1] }
    },
    {
        id: 'vanilla_trident', group: 'vanilla', label: 'display_sensei.hold_preset.vanilla_trident', note: 'display_sensei.hold_preset.vanilla_trident_note', pivot: [0, 24, 0],
        first_person: { position: [-7, -3, -2], rotation: [152, -9, 25], scale: [1, 1, 1] },
        third_person: { position: [1.5, -2.5, -10.5], rotation: [97, -1.5, -49], scale: [1, 1, 1] }
    }
];

const HOLD_FALLBACK_START_ID = 'item_wizard_tool';
const HOLD_FILE_PRESET_ID = 'file';

function findHoldPreset(presetId) {
    return HOLD_PRESETS.find(preset => preset.id === presetId) || null;
}

function adaptHoldPose(pose, fromPivot, toPivot) {
    return {
        position: pose.position.map((value, axis) => roundHoldNumber(value + fromPivot[axis] - toPivot[axis])),
        rotation: pose.rotation.slice(),
        scale: pose.scale.slice()
    };
}

function readFileHoldPair(link, hand = 'main_hand', force = false) {
    let pair = {};
    for (let view of HOLD_VIEWS) {
        pair[view] = readLinkedFilePose(link, holdCellKey(view, hand), force);
        if (!pair[view]) return null;
    }
    return pair;
}

function getHoldPresetChoices() {
    if (!Project || getRoute() !== 'attachable') return [];
    let link = analyseHolds();
    let choices = [];
    if (readFileHoldPair(link)) {
        choices.push({ id: HOLD_FILE_PRESET_ID, group: 'file', label: i18n('display_sensei.hold_preset.file'), note: i18n('display_sensei.hold_preset.file_note') });
    }
    for (let preset of HOLD_PRESETS) {
        choices.push({ id: preset.id, group: preset.group, label: i18n(preset.label), note: i18n(preset.note) });
    }
    return choices;
}

function resolveHoldPresetPoses(presetId, link, hand) {
    let bone = link.bone;
    if (!bone) return null;
    if (presetId === HOLD_FILE_PRESET_ID) return readFileHoldPair(link, hand, true);
    let preset = findHoldPreset(presetId);
    if (!preset) return null;
    let poses = {};
    for (let view of HOLD_VIEWS) poses[view] = adaptHoldPose(preset[view], preset.pivot, bone.pivot);
    return poses;
}

function applyHoldPreset(presetId, slotId, scope = 'view') {
    let slot = findHoldSlot(slotId);
    let link = slot ? analyseHolds() : null;
    let poses = link ? resolveHoldPresetPoses(presetId, link, slot.hand) : null;
    if (!poses) return false;
    let views = scope === 'both' ? HOLD_VIEWS : [slot.view];
    let label = i18n('display_sensei.undo.hold_preset');
    return runHoldEdit(label, () => {
        let changed = false;
        for (let view of views) {
            let target = findHoldSlot(findHoldSlotId(view, slot.hand));
            if (writeHoldPose(analyseHolds(), target, poses[view])) changed = true;
        }
        if (scope === 'both' && slot.hand === 'main_hand') {
            let holds = getProjectData().holds;
            let start = presetId === HOLD_FILE_PRESET_ID ? null : { pivot: link.bone.pivot.slice(), first_person: poses.first_person, third_person: poses.third_person, source: presetId };
            if (JSON.stringify(holds.start) !== JSON.stringify(start)) {
                holds.start = start;
                changed = true;
            }
        }
        return changed;
    });
}

// =========================
// Matching first person to third person
// =========================
function getHoldMatchStart(link) {
    let bone = link.bone;
    let start = getProjectData().holds.start;
    if (start) return { pair: adaptPair(start, start.pivot, bone.pivot), source: start.source || 'preset' };
    let file = readFileHoldPair(link, 'main_hand', true);
    if (file) return { pair: file, source: 'file' };
    let fallback = findHoldPreset(HOLD_FALLBACK_START_ID);
    return { pair: adaptPair(fallback, fallback.pivot, bone.pivot), source: HOLD_FALLBACK_START_ID };
}

function adaptPair(pair, fromPivot, toPivot) {
    let adapted = {};
    for (let view of HOLD_VIEWS) adapted[view] = adaptHoldPose(pair[view], fromPivot, toPivot);
    return adapted;
}

function sameHoldPose(a, b) {
    return HOLD_CHANNELS.every(channel => a[channel].every((value, axis) => (channel === 'rotation' ? sameAngle : sameNumber)(value, b[channel][axis])));
}

function computeHoldFirstPerson(start, thirdPerson) {
    let matrix = holdMatrix(start.first_person).multiply(holdMatrix(start.third_person).invert()).multiply(holdMatrix(thirdPerson));
    return holdValuesFromMatrix(matrix);
}

function matchHoldFirstPerson() {
    if (!isHoldEditingMode()) return null;
    let link = analyseHolds();
    if (!link.bone) return null;
    let start = getHoldMatchStart(link);
    let result = { written: [], kept: [], clamped: [], turned: 0, start: start.source, readOnly: [] };
    let matched = {};
    for (let hand of HOLD_HANDS) {
        let slotId = findHoldSlotId('first_person', hand);
        let first = readHoldCellValues(link, holdCellKey('first_person', hand));
        let third = readHoldCellValues(link, holdCellKey('third_person', hand));
        if (hand === 'off_hand' && getOffHandMode(link, 'first_person') === 'same') continue;
        if (!HOLD_CHANNELS.every(channel => first.editable[channel])) {
            result.readOnly.push(slotId);
            continue;
        }
        if (sameHoldPose(third.values, start.pair.third_person)) {
            result.kept.push(slotId);
            continue;
        }
        let match = computeHoldFirstPerson(start.pair, third.values);
        matched[slotId] = match.values;
        result.written.push(slotId);
        if (match.clamped) result.clamped.push(slotId);
        result.turned = Math.max(result.turned, match.turned);
    }
    if (!result.written.length) return result;
    runHoldEdit(i18n('display_sensei.undo.hold_match'), () => {
        let changed = false;
        for (let slotId of result.written) {
            if (writeHoldPose(analyseHolds(), findHoldSlot(slotId), matched[slotId])) changed = true;
        }
        return changed;
    });
    return result;
}

// =========================
// Install
// =========================
function installAttachableHold() {
    return {
        delete() {
            if (openHoldEdit && openHoldEdit.project && openHoldEdit.project.undo && openHoldEdit.project.undo.current_save === openHoldEdit.save) {
                openHoldEdit.project.undo.cancelEdit(false);
            }
            openHoldEdit = null;
            copiedHoldValues = null;
            forgetHoldFiles();
        }
    };
}

registerModuleInstaller('attachable_hold', installAttachableHold);
