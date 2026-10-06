const PROJECT_DATA_KEY = 'display_sensei';
const PROJECT_DATA_UNDO_ASPECT = 'display_sensei';
const PROJECT_DATA_VERSION = 1;

// =========================
// Data shape
// =========================
function createDefaultProjectData() {
    return normalizeProjectData({});
}

function normalizeProjectData(raw) {
    let data = isPlainObject(raw) ? raw : {};
    if (typeof data.v !== 'number') data.v = PROJECT_DATA_VERSION;
    if (!isPlainObject(data.inherit)) data.inherit = {};
    for (let slot of BEDROCK_SLOTS) {
        if (typeof data.inherit[slot.id] !== 'boolean') data.inherit[slot.id] = true;
    }
    data.unset_fields = normalizeUnsetFields(data.unset_fields);
    if (typeof data.gui_fit_to_frame !== 'boolean') data.gui_fit_to_frame = true;
    if (!isSupportedGeometryVersion(data.geometry_version)) data.geometry_version = DEFAULT_GEOMETRY_VERSION;
    if (!isPlainObject(data.entity_display_transforms)) data.entity_display_transforms = null;
    data.armor = normalizeArmorData(data.armor);
    data.holds = normalizeHoldData(data.holds);
    return data;
}

// =========================
// Held item data
// =========================
const PROJECT_HOLD_VIEWS = ['first_person', 'third_person'];
const PROJECT_HOLD_CHANNELS = ['position', 'rotation', 'scale'];

function isHoldVector(value) {
    return Array.isArray(value) && value.length === 3 && value.every(entry => typeof entry === 'number' && Number.isFinite(entry));
}

function normalizeHoldPose(raw) {
    if (!isPlainObject(raw)) return null;
    let pose = {};
    for (let channel of PROJECT_HOLD_CHANNELS) {
        if (!isHoldVector(raw[channel])) return null;
        pose[channel] = raw[channel].slice();
    }
    return pose;
}

function normalizeHoldStart(raw) {
    if (!isPlainObject(raw)) return null;
    let start = { pivot: isHoldVector(raw.pivot) ? raw.pivot.slice() : [0, 0, 0] };
    for (let view of PROJECT_HOLD_VIEWS) {
        start[view] = normalizeHoldPose(raw[view]);
        if (!start[view]) return null;
    }
    if (typeof raw.source === 'string') start.source = raw.source;
    return start;
}

function normalizeHoldLink(raw) {
    if (!isPlainObject(raw) || !isPlainObject(raw.cells)) return null;
    let cells = {};
    for (let key of Object.keys(raw.cells)) {
        let cell = raw.cells[key];
        if (!isPlainObject(cell) || typeof cell.animation !== 'string' || !Array.isArray(cell.plays)) continue;
        cells[key] = { animation: cell.animation, plays: cell.plays.filter(entry => typeof entry === 'string') };
    }
    return Object.keys(cells).length ? { cells } : null;
}

function normalizeHoldFiles(raw) {
    let files = {};
    if (!isPlainObject(raw)) return files;
    for (let key of Object.keys(raw)) {
        let file = raw[key];
        if (!isPlainObject(file) || typeof file.path !== 'string' || !file.path) continue;
        files[key] = {
            path: file.path,
            hash: typeof file.hash === 'string' ? file.hash : null,
            backup: typeof file.backup === 'string' ? file.backup : null,
            written: typeof file.written === 'string' ? file.written : null,
            confirmed: file.confirmed === true
        };
    }
    return files;
}

function normalizeHoldData(raw) {
    let holds = isPlainObject(raw) ? raw : {};
    let offHand = {};
    if (isPlainObject(holds.off_hand)) {
        for (let view of PROJECT_HOLD_VIEWS) {
            if (holds.off_hand[view] === 'own') offHand[view] = 'own';
        }
    }
    holds.off_hand = offHand;
    holds.start = normalizeHoldStart(holds.start);
    holds.link = normalizeHoldLink(holds.link);
    holds.files = normalizeHoldFiles(holds.files);
    if (typeof holds.target !== 'string' || !holds.target) holds.target = null;
    return holds;
}

// =========================
// Armor data
// =========================
const PROJECT_ARMOR_KINDS = ['auto', 'armor', 'worn', 'held'];
const ARMOR_FIT_IDENTITY = { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] };
const ARMOR_FIT_CHANNELS = Object.keys(ARMOR_FIT_IDENTITY);

function normalizeArmorData(raw) {
    let armor = isPlainObject(raw) ? raw : {};
    if (!PROJECT_ARMOR_KINDS.includes(armor.kind)) armor.kind = 'auto';
    if (typeof armor.slot !== 'string' || !findWearSlot(armor.slot)) armor.slot = null;
    armor.fit = normalizeFitOffsets(armor.fit);
    return armor;
}

function normalizeFitOffsets(raw) {
    let fit = {};
    if (!isPlainObject(raw)) return fit;
    for (let slotId of Object.keys(raw)) {
        if (!findWearSlot(slotId) || !isPlainObject(raw[slotId])) continue;
        let bones = {};
        for (let boneName of Object.keys(raw[slotId])) {
            let offset = normalizeFitOffset(raw[slotId][boneName]);
            if (boneName && offset) bones[boneName] = offset;
        }
        if (Object.keys(bones).length) fit[slotId] = bones;
    }
    return fit;
}

function isFitChannelValue(channel, values) {
    return Array.isArray(values) && values.length === 3 &&
        values.every(value => typeof value === 'number' && Number.isFinite(value) && (channel !== 'scale' || value > 0));
}

function normalizeFitOffset(raw) {
    if (!isPlainObject(raw)) return null;
    let offset = {};
    let changed = false;
    for (let channel of ARMOR_FIT_CHANNELS) {
        let identity = ARMOR_FIT_IDENTITY[channel];
        let values = isFitChannelValue(channel, raw[channel]) ? raw[channel].slice() : identity.slice();
        if (values.some((value, axis) => value !== identity[axis])) changed = true;
        offset[channel] = values;
    }
    return changed ? offset : null;
}

function normalizeUnsetFields(raw) {
    let fields = {};
    if (!isPlainObject(raw)) return fields;
    for (let slot of BEDROCK_SLOTS) {
        let list = Array.isArray(raw[slot.id]) ? FALLBACK_FIELDS.filter(field => raw[slot.id].includes(field)) : [];
        if (list.length) fields[slot.id] = list;
    }
    return fields;
}

function getProjectData(project = Project) {
    if (!project) return createDefaultProjectData();
    let data = normalizeProjectData(project[PROJECT_DATA_KEY]);
    project[PROJECT_DATA_KEY] = data;
    return data;
}

function updateProjectData(fn, project = Project) {
    let data = getProjectData(project);
    fn(data);
    return normalizeProjectData(data);
}

// =========================
// Saving in .bbmodel
// =========================
function createProjectDataProperty() {
    return new Property(ModelProject, 'object', PROJECT_DATA_KEY, {
        exposed: false,
        condition: { formats: BEDROCK_FORMAT_IDS }
    });
}

// =========================
// Undo
// =========================
function recordProjectDataInUndoSave(event) {
    let aspects = event.aspects || {};
    if (!aspects.display_slots && !aspects[PROJECT_DATA_UNDO_ASPECT]) return;
    if (getRoute() === 'none') return;
    event.save[PROJECT_DATA_KEY] = cloneJson(getProjectData());
}

function restoreProjectDataFromUndo(save) {
    let saved = save && save[PROJECT_DATA_KEY];
    if (!saved || getRoute() === 'none') return;
    let current = getProjectData();
    let restored = normalizeProjectData(cloneJson(saved));
    restored.holds.files = current.holds.files;
    restored.holds.link = current.holds.link;
    restored.holds.target = current.holds.target;
    Project[PROJECT_DATA_KEY] = restored;
}

// =========================
// Install
// =========================
function installProjectData() {
    return createDeletables([
        createProjectDataProperty,
        () => Blockbench.on('create_undo_save', guardListener('create_undo_save', recordProjectDataInUndoSave)),
        () => Blockbench.on('load_undo_save', guardListener('load_undo_save', event => restoreProjectDataFromUndo(event.save)))
    ]);
}

registerModuleInstaller('project_data', installProjectData);
