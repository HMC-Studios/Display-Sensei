// =========================
// Bedrock display slots
// =========================
const BEDROCK_SLOTS = [
    {
        id: 'thirdperson_righthand', bedrockKey: 'thirdperson_righthand', label: 'display_sensei.context.thirdperson_righthand',
        subtabs: ['third_back', 'third_front'], hand: 'right',
        attachableKey: 'third_person', attachableLabel: 'display_sensei.context.attachable_third_person',
        support: { block: 'edit', attachable: 'edit', entity: 'mob' }
    },
    {
        id: 'thirdperson_lefthand', bedrockKey: 'thirdperson_lefthand', label: 'display_sensei.context.thirdperson_lefthand',
        subtabs: ['third_back', 'third_front'], hand: 'left',
        attachableKey: 'third_person', attachableLabel: 'display_sensei.context.attachable_third_person',
        support: { block: 'edit', attachable: 'edit', entity: 'mob' }
    },
    {
        id: 'firstperson_righthand', bedrockKey: 'firstperson_righthand', label: 'display_sensei.context.firstperson_righthand',
        subtabs: ['first_person'], hand: 'right',
        attachableKey: 'first_person', attachableLabel: 'display_sensei.context.attachable_first_person',
        support: { block: 'edit', attachable: 'edit', entity: 'mob' }
    },
    {
        id: 'firstperson_lefthand', bedrockKey: 'firstperson_lefthand', label: 'display_sensei.context.firstperson_lefthand',
        subtabs: ['first_person'], hand: 'left',
        attachableKey: 'first_person', attachableLabel: 'display_sensei.context.attachable_first_person',
        support: { block: 'edit', attachable: 'edit', entity: 'mob' }
    },
    {
        id: 'ground', bedrockKey: 'ground', label: 'display_sensei.context.ground',
        subtabs: ['ground'],
        support: { block: 'edit', attachable: 'icon', entity: 'mob' }
    },
    {
        id: 'fixed', bedrockKey: 'fixed', label: 'display_sensei.context.fixed',
        subtabs: ['item_frame'],
        support: { block: 'edit', attachable: 'icon', entity: 'mob' }
    },
    {
        id: 'head', bedrockKey: 'head', label: 'display_sensei.context.head',
        subtabs: ['head', 'slot.armor.head'],
        support: { block: 'edit', attachable: 'worn_pointer', entity: 'mob' }
    },
    {
        id: 'gui', bedrockKey: 'gui', label: 'display_sensei.context.gui',
        subtabs: ['gui'],
        support: { block: 'edit', attachable: 'icon', entity: 'mob' }
    },
    {
        id: 'embedded', bedrockKey: 'embedded', label: 'display_sensei.context.embedded',
        subtabs: ['flower_pot'],
        support: { block: 'edit', attachable: 'block_only', entity: 'mob' }
    },
    {
        id: 'on_shelf', bedrockKey: 'shelf', label: 'display_sensei.context.shelf',
        subtabs: ['shelf'],
        support: { block: 'edit', attachable: 'block_only', entity: 'mob' }
    }
];

function findBedrockSlot(slotId) {
    return BEDROCK_SLOTS.find(slot => slot.id === slotId) || null;
}

function findSlotForContext(subtabId, handId) {
    return BEDROCK_SLOTS.find(slot => slot.subtabs.includes(subtabId) && (!slot.hand || slot.hand === handId)) || null;
}

// =========================
// Schema ranges
// =========================
const SLOT_RANGES = Object.freeze({
    translation: Object.freeze([-80, 80]),
    rotation: Object.freeze([-360, 360]),
    scale: Object.freeze([0, 4]),
    rotation_pivot: Object.freeze([-80, 80]),
    scale_pivot: Object.freeze([-80, 80])
});

const SLOT_CHANNELS = Object.keys(SLOT_RANGES);

const FALLBACK_FIELDS = ['rotation', 'translation', 'scale'];

function clampToRange(value, range) {
    return Math.min(range[1], Math.max(range[0], value));
}

// =========================
// Engine defaults
// =========================
function getEngineDefaults() {
    return JSON.parse(JSON.stringify(DisplayMode.bedrock_defaults || {}));
}

// =========================
// Geometry format versions
// =========================
const GEOMETRY_VERSIONS = [
    { version: '1.21.0', label: 'display_sensei.version.v1_21_0', hint: 'display_sensei.version.v1_21_0_hint' },
    { version: '1.21.130', label: 'display_sensei.version.v1_21_130', hint: 'display_sensei.version.v1_21_130_hint' },
    { version: '1.26.0', label: 'display_sensei.version.v1_26_0', hint: 'display_sensei.version.v1_26_0_hint' },
    { version: '1.26.40', label: 'display_sensei.version.v1_26_40', hint: 'display_sensei.version.v1_26_40_hint' }
];

const DEFAULT_GEOMETRY_VERSION = '1.26.40';
const MIN_GEOMETRY_VERSION = '1.21.0';
const FIT_TO_FRAME_GEOMETRY_VERSION = '1.21.130';
const ITEM_FRAME_GEOMETRY_VERSION = '1.26.0';
const SHELF_GEOMETRY_VERSION = '1.26.40';

function isGeometryVersionString(value) {
    return typeof value === 'string' && /^\d+(\.\d+)*$/.test(value);
}

function isSupportedGeometryVersion(value) {
    return isGeometryVersionString(value) && VersionUtil.compare(value, '>=', MIN_GEOMETRY_VERSION);
}

function laterGeometryVersion(a, b) {
    return VersionUtil.compare(a, '>=', b) ? a : b;
}

function earlierGeometryVersion(a, b) {
    return VersionUtil.compare(a, '<=', b) ? a : b;
}

function getGeometryVersionFloor(itemDisplayTransforms) {
    if (!itemDisplayTransforms || !Object.keys(itemDisplayTransforms).length) return null;
    if (itemDisplayTransforms.shelf) return SHELF_GEOMETRY_VERSION;
    return MIN_GEOMETRY_VERSION;
}

// =========================
// Left hand
// =========================
const LEFT_HAND_RULE = 'mirror';

// =========================
// Bedrock presets
// =========================
const PRESET_GROUPS = [
    { id: 'bedrock', label: 'display_sensei.preset_group.bedrock' },
    { id: 'vanilla', label: 'display_sensei.preset_group.vanilla' }
];

const CALIBRATION_IDS = ['item_hold', 'tool_hold'];

const CALIBRATED_SWORD = {
    thirdperson_righthand: { rotation: [0, 90, 0], translation: [0, 3.25, 1.75], scale: [0.925, 0.925, 0.925] },
    thirdperson_lefthand: { rotation: [0, 90, 0], translation: [0, 3.25, 1.75], scale: [0.925, 0.925, 0.925] },
    ground: { rotation: [0, 0, 0], translation: [0, 3, 0], scale: [0.61, 0.61, 0.61] },
    fixed: { rotation: [0, 0, 0], translation: [0, 0, 0], scale: [1.025, 1.025, 1.025] },
    gui: { rotation: [30, -1, 0], translation: [0, 0, 0], scale: [1.025, 1.025, 1.025], fit_to_frame: true },
    embedded: { rotation: [0, 0, -180], translation: [0, -1.5, 0], scale: [0.75, 0.75, 0.75] },
    on_shelf: { rotation: [0, 0, 0], translation: [0, 1.25, 0], scale: [1.3, 1.3, 1.3] }
};

const CALIBRATED_SWORD_HANDS = {
    thirdperson_righthand: CALIBRATED_SWORD.thirdperson_righthand,
    thirdperson_lefthand: CALIBRATED_SWORD.thirdperson_lefthand
};

const BEDROCK_PRESETS = [
    {
        id: 'bedrock_defaults',
        label: 'display_sensei.preset.bedrock_defaults',
        noteKey: 'display_sensei.preset_note.bedrock_defaults',
        group: 'bedrock',
        confidence: 'engine',
        geometryVersion: null,
        inherit: true
    },
    {
        id: 'item_hold',
        label: 'display_sensei.preset.item_hold',
        noteKey: 'display_sensei.preset_note.item_hold',
        calibratedNoteKey: 'display_sensei.preset_note.item_hold_calibrated',
        group: 'bedrock',
        confidence: 'user',
        geometryVersion: null,
        calibration: 'item_hold'
    },
    {
        id: 'tool_hold',
        label: 'display_sensei.preset.tool_hold',
        noteKey: 'display_sensei.preset_note.tool_hold',
        calibratedNoteKey: 'display_sensei.preset_note.tool_hold_calibrated',
        group: 'bedrock',
        confidence: 'calibrated',
        geometryVersion: null,
        calibration: 'tool_hold',
        matchFirstPerson: true,
        areas: CALIBRATED_SWORD_HANDS
    },
    {
        id: 'rod_hold',
        label: 'display_sensei.preset.rod_hold',
        noteKey: 'display_sensei.preset_note.rod_hold',
        calibratedNoteKey: 'display_sensei.preset_note.rod_hold_calibrated',
        group: 'bedrock',
        confidence: 'calibrated',
        geometryVersion: null,
        calibration: 'tool_hold',
        matchFirstPerson: true,
        areas: CALIBRATED_SWORD_HANDS
    },
    {
        id: 'sword_calibration',
        label: 'display_sensei.preset.sword_calibration',
        noteKey: 'display_sensei.preset_note.sword_calibration',
        group: 'bedrock',
        confidence: 'calibrated',
        geometryVersion: null,
        matchFirstPerson: true,
        areas: CALIBRATED_SWORD
    },
    {
        id: 'armor_stand_statue',
        label: 'display_sensei.preset.armor_stand_statue',
        noteKey: 'display_sensei.preset_note.armor_stand_statue',
        group: 'bedrock',
        confidence: 'derived',
        geometryVersion: null,
        standHands: 'none',
        areas: {
            head: { rotation: [0, 0, 0], translation: [0, -32, 0], scale: [1.6, 1.6, 1.6] }
        }
    },
    {
        id: 'vanilla_shelf_mushroom',
        label: 'display_sensei.preset.vanilla_shelf_mushroom',
        noteKey: 'display_sensei.preset_note.vanilla_shelf_mushroom',
        group: 'vanilla',
        confidence: 'vanilla',
        geometryVersion: '1.21.0',
        areas: {
            firstperson_righthand: { rotation: [0, 45, 0], translation: [0, 0, 0], scale: [0.5, 0.5, 0.5] },
            firstperson_lefthand: { rotation: [0, 45, 0], translation: [0.25, 0, 0], scale: [0.5, 0.5, 0.5] },
            thirdperson_righthand: { rotation: [53, 0, 0], translation: [0, 2.25, 0.25], scale: [0.375, 0.375, 0.375] },
            thirdperson_lefthand: { rotation: [53, 0, 0], translation: [0, 2.25, 0.25], scale: [0.375, 0.375, 0.375] },
            head: { rotation: [0, 0, 0], translation: [0, -4.75, -13.75], scale: [1, 1, 1] },
            gui: { rotation: [30, 225, 0], translation: [3.25, -3, 0], scale: [1, 1, 1], fit_to_frame: false },
            ground: { rotation: [0, 0, 0], translation: [0, 2.55, -1.35], scale: [0.3, 0.3, 0.3] },
            fixed: { rotation: [0, 0, 0], translation: [0, -1, -6.75], scale: [1, 1, 1] }
        }
    },
    {
        id: 'vanilla_shelf_mushroom_large',
        label: 'display_sensei.preset.vanilla_shelf_mushroom_large',
        noteKey: 'display_sensei.preset_note.vanilla_shelf_mushroom_large',
        group: 'vanilla',
        confidence: 'vanilla',
        geometryVersion: '1.21.0',
        areas: {
            firstperson_righthand: { rotation: [0, 45, 0], translation: [0, 0, 0], scale: [0.5, 0.5, 0.5] },
            firstperson_lefthand: { rotation: [0, 32, 0], translation: [2.75, 0, -0.25], scale: [0.5, 0.5, 0.5] },
            thirdperson_righthand: { rotation: [53, 0, 0], translation: [0, 2.5, 0.25], scale: [0.375, 0.375, 0.375] },
            thirdperson_lefthand: { rotation: [53, 0, 0], translation: [0, 2.5, 0.25], scale: [0.375, 0.375, 0.375] },
            head: { rotation: [0, 0, 0], translation: [0, 7.75, -2.75], scale: [1, 1, 1] },
            gui: { rotation: [30, 225, 0], translation: [1.75, -1.75, 0], scale: [0.85, 0.85, 0.85], fit_to_frame: true },
            ground: { rotation: [0, 0, 0], translation: [0, 2.55, -1.35], scale: [0.3, 0.3, 0.3] },
            fixed: { rotation: [0, 0, 0], translation: [0, -1, -6.75], scale: [1, 1, 1] }
        }
    },
    {
        id: 'vanilla_straw_bed',
        label: 'display_sensei.preset.vanilla_straw_bed',
        noteKey: 'display_sensei.preset_note.vanilla_straw_bed',
        group: 'vanilla',
        confidence: 'vanilla',
        geometryVersion: '1.26.50',
        areas: {
            firstperson_righthand: { rotation: [30, 340, 0], translation: [0, 3, 0], scale: [0.375, 0.375, 0.375] },
            firstperson_lefthand: { rotation: [30, 340, 0], translation: [0, 3, 0], scale: [0.375, 0.375, 0.375] },
            thirdperson_righthand: { rotation: [30, 340, 0], translation: [0, 3, -2], scale: [0.23, 0.23, 0.23] },
            thirdperson_lefthand: { rotation: [30, 340, 0], translation: [0, 3, -2], scale: [0.23, 0.23, 0.23] },
            head: { rotation: [0, 0, 0], translation: [0, 10, -8], scale: [1, 1, 1] },
            gui: { rotation: [30, 340, 0], translation: [2, 3, 0], scale: [0.5325, 0.5325, 0.5325], fit_to_frame: true },
            ground: { rotation: [0, 180, 0], translation: [0, 1, 2], scale: [0.25, 0.25, 0.25] },
            fixed: { rotation: [270, 180, 0], translation: [0, 4, -2], scale: [0.5, 0.5, 0.5] }
        }
    },
    {
        id: 'ms_umbrella',
        label: 'display_sensei.preset.ms_umbrella',
        noteKey: 'display_sensei.preset_note.ms_umbrella',
        group: 'vanilla',
        confidence: 'vanilla',
        geometryVersion: null,
        areas: {
            thirdperson_righthand: { rotation: [70, 0, -15], translation: [1.5, 1.75, 7.25], scale: [0.9, 0.9, 0.9] },
            firstperson_righthand: { rotation: [0, 0, 0], translation: [1.5, 3, 1], scale: [0.9, 0.9, 0.9] },
            fixed: { rotation: [0, 0, 25], translation: [2.5, -3.5, 0], scale: [0.5, 0.5, 0.5] }
        }
    }
];

function findBedrockPreset(presetId) {
    return BEDROCK_PRESETS.find(preset => preset.id === presetId) || null;
}
