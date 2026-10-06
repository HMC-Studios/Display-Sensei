// =========================
// Panel UI
// =========================
const PANEL_ID = 'display_sensei_panel';
const UI_STATE_STORAGE_KEY = 'display_sensei_ui_state_v1';

const MAIN_TABS = [
    {
        id: 'hand',
        label: 'display_sensei.tab.hand',
        subtabs: [
            { id: 'first_person', label: 'display_sensei.subtab.first_person', info: 'display_sensei.info.first_person' },
            { id: 'third_back', label: 'display_sensei.subtab.third_back', info: 'display_sensei.info.third_back' },
            { id: 'third_front', label: 'display_sensei.subtab.third_front', info: 'display_sensei.info.third_front' }
        ]
    },
    {
        id: 'world',
        label: 'display_sensei.tab.world',
        subtabs: [
            { id: 'item_frame', label: 'display_sensei.subtab.item_frame', info: 'display_sensei.info.item_frame' },
            { id: 'ground', label: 'display_sensei.subtab.ground', info: 'display_sensei.info.ground' },
            { id: 'shelf', label: 'display_sensei.subtab.shelf', info: 'display_sensei.info.shelf' },
            { id: 'flower_pot', label: 'display_sensei.subtab.flower_pot', info: 'display_sensei.info.flower_pot' }
        ]
    },
    {
        id: 'inventory',
        label: 'display_sensei.tab.inventory',
        subtabs: [
            { id: 'gui', label: 'display_sensei.subtab.gui', info: 'display_sensei.info.gui' },
            { id: 'head', label: 'display_sensei.subtab.head', info: 'display_sensei.info.head' }
        ]
    },
    {
        id: 'armor',
        label: 'display_sensei.tab.armor',
        subtabs: WEAR_SLOTS.map(wear => ({ id: wear.id, label: wear.label, info: wear.info }))
    },
    { id: 'output', label: 'display_sensei.tab.output', subtabs: [] }
];

const HANDS = [
    { id: 'right', label: 'display_sensei.ui.right_hand', short: 'display_sensei.ui.right' },
    { id: 'left', label: 'display_sensei.ui.left_hand', short: 'display_sensei.ui.left' }
];

const ROUTES = [
    {
        id: 'block', formatId: BLOCK_FORMAT_ID,
        label: 'display_sensei.route.block', hint: 'display_sensei.route.block_hint', output: 'display_sensei.ui.output_block'
    },
    {
        id: 'attachable', formatId: ATTACHABLE_FORMAT_ID,
        label: 'display_sensei.route.attachable', hint: 'display_sensei.route.attachable_hint', output: 'display_sensei.ui.output_attachable'
    },
    {
        id: 'entity', formatId: ENTITY_FORMAT_ID,
        label: 'display_sensei.route.entity', hint: 'display_sensei.route.entity_hint', output: 'display_sensei.ui.output_entity'
    }
];

const INFO_CARDS = {
    icon: { title: 'display_sensei.info.icon_title', text: 'display_sensei.info.icon', tip: 'display_sensei.info.icon_tip' },
    block_only: { title: 'display_sensei.info.block_only_title', text: 'display_sensei.info.block_only', tip: 'display_sensei.info.block_only_tip' },
    mob: { title: 'display_sensei.info.mob_title', text: 'display_sensei.info.mob', tip: 'display_sensei.info.mob_tip' },
    worn_body: { title: 'display_sensei.info.worn_body_title', text: 'display_sensei.info.worn_body', tip: 'display_sensei.info.worn_body_tip' },
    offhand_pointer: {
        title: 'display_sensei.info.offhand_pointer_title',
        text: 'display_sensei.info.offhand_pointer_block',
        tip: 'display_sensei.info.offhand_pointer_block_tip',
        routeTexts: { attachable: 'display_sensei.info.offhand_pointer_attachable' },
        routeTips: { attachable: 'display_sensei.info.offhand_pointer_attachable_tip' }
    },
    worn_pointer: { title: 'display_sensei.info.worn_pointer_title', text: 'display_sensei.info.worn_pointer', tip: 'display_sensei.info.worn_pointer_tip' },
    held_worn: { title: 'display_sensei.hold.worn_title', text: 'display_sensei.hold.worn', tip: 'display_sensei.hold.worn_tip' }
};

// =========================
// Your pack (Output tab)
// =========================
const LINK_EMPTY_TEXTS = {
    no_path: 'display_sensei.link.empty_no_path',
    not_in_pack: 'display_sensei.link.empty_not_in_pack',
    desktop_only: 'display_sensei.link.empty_desktop_only',
    error: 'display_sensei.link.empty_error'
};

const LINK_EMPTY_TIPS = {
    not_in_pack: 'display_sensei.link.empty_not_in_pack_tip'
};

const LINK_FILE_GROUPS = [
    { id: 'rp', label: 'display_sensei.link.files_rp' },
    { id: 'bp', label: 'display_sensei.link.files_bp' },
    { id: 'maybe_game', label: 'display_sensei.link.files_maybe_game' },
    { id: 'game', label: 'display_sensei.link.files_game' }
];

function getLinkFileGroupId(row) {
    return row.maybe_game ? 'maybe_game' : row.pack;
}

const LINK_ROLES_USING_ID = ['block', 'attachable', 'client_entity'];

const LINK_ROLE_NAMES = {
    geometry: 'display_sensei.link_role.geometry',
    attachable: 'display_sensei.link_role.attachable',
    client_entity: 'display_sensei.link_role.client_entity',
    animation: 'display_sensei.link_role.animation',
    render_controller: 'display_sensei.link_role.render_controller',
    texture: 'display_sensei.link_role.texture',
    item_texture: 'display_sensei.link_role.item_texture',
    icon: 'display_sensei.link_role.icon',
    spawn_egg: 'display_sensei.link_role.spawn_egg',
    terrain_texture: 'display_sensei.link_role.terrain_texture',
    flipbook: 'display_sensei.link_role.flipbook',
    item: 'display_sensei.link_role.item',
    entity: 'display_sensei.link_role.entity',
    block: 'display_sensei.link_role.block',
    lang: 'display_sensei.link_role.lang',
    sounds: 'display_sensei.link_role.sounds',
    blocks_json: 'display_sensei.link_role.blocks_json',
    manifest: 'display_sensei.link_role.manifest',
    pack_icon: 'display_sensei.link_role.pack_icon'
};

const WIZARD_NAMES = {
    item: 'display_sensei.wizard_name.item',
    block: 'display_sensei.wizard_name.block',
    entity: 'display_sensei.wizard_name.entity'
};

const ITEM_WIZARD_PRESET_NAMES = {
    iron_ingot: 'display_sensei.wizard_preset.iron_ingot',
    apple: 'display_sensei.wizard_preset.apple',
    sword: 'display_sensei.wizard_preset.sword',
    pickaxe: 'display_sensei.wizard_preset.pickaxe',
    helmet: 'display_sensei.wizard_preset.helmet',
    chestplate: 'display_sensei.wizard_preset.chestplate',
    leggings: 'display_sensei.wizard_preset.leggings',
    boots: 'display_sensei.wizard_preset.boots'
};

const LINK_NOTE_TEXTS = {
    no_entity_file: 'display_sensei.link_note.no_entity_file',
    wearable_armor: 'display_sensei.link_note.wearable_armor',
    wearable_offhand: 'display_sensei.link_note.wearable_offhand',
    mount_slot: 'display_sensei.link_note.mount_slot',
    hand_equipped: 'display_sensei.link_note.hand_equipped',
    glint: 'display_sensei.link_note.glint',
    use_animation: 'display_sensei.link_note.use_animation',
    saves_into: 'display_sensei.link_note.saves_into',
    own_model: 'display_sensei.wizard_note.own_model',
    block_wizard_version: 'display_sensei.wizard_note.block_wizard_version'
};

const LINK_NOTE_TIPS = {
    no_entity_file: 'display_sensei.link_note.no_entity_file_tip',
    wearable_armor: 'display_sensei.link_note.wearable_armor_tip',
    wearable_offhand: 'display_sensei.link_note.wearable_offhand_tip',
    mount_slot: 'display_sensei.link_note.mount_slot_tip',
    hand_equipped: 'display_sensei.link_note.hand_equipped_tip',
    glint: 'display_sensei.link_note.glint_tip',
    use_animation: 'display_sensei.link_note.use_animation_tip',
    own_model: 'display_sensei.wizard_note.own_model_tip',
    block_wizard_version: 'display_sensei.wizard_note.block_wizard_version_tip'
};

const WIZARD_REEXPORT_TEXTS = {
    item: 'display_sensei.wizard_note.reexport_item',
    block: 'display_sensei.wizard_note.reexport_block',
    entity: 'display_sensei.wizard_note.reexport_entity'
};

const WIZARD_REEXPORT_TIPS = {
    item: 'display_sensei.wizard_note.reexport_item_tip',
    block: 'display_sensei.wizard_note.reexport_block_tip',
    entity: 'display_sensei.wizard_note.reexport_entity_tip'
};

const WIZARD_REWRITTEN_HINTS = {
    item: 'display_sensei.link.rewritten_hint_item',
    block: 'display_sensei.link.rewritten_hint_block',
    entity: 'display_sensei.link.rewritten_hint_entity'
};

const BLOCK_WIZARD_LOSS_TEXTS = {
    shelf: 'display_sensei.wizard_feature.shelf',
    fit_to_frame_off: 'display_sensei.wizard_feature.fit_to_frame_off'
};

const HAND_CARD_NOTE_IDS = ['wearable_armor', 'mount_slot'];

const ARMOR_CARD_NOTE_IDS = ['wearable_offhand', 'mount_slot'];

function formatFileDate(mtime) {
    return new Date(mtime).toLocaleString();
}

// =========================
// Block route editor: controls
// =========================
const CHANNEL_TABS = [
    { id: 'translation', label: 'display_sensei.ui.translation' },
    { id: 'rotation', label: 'display_sensei.ui.rotation' },
    { id: 'scale', label: 'display_sensei.ui.scale' }
];

const PIVOT_CHANNELS = [
    { id: 'rotation_pivot', label: 'display_sensei.ui.rotation_pivot' },
    { id: 'scale_pivot', label: 'display_sensei.ui.scale_pivot' }
];

const CHANNEL_LABELS = {
    translation: 'display_sensei.ui.translation',
    rotation: 'display_sensei.ui.rotation',
    scale: 'display_sensei.ui.scale',
    rotation_pivot: 'display_sensei.ui.rotation_pivot',
    scale_pivot: 'display_sensei.ui.scale_pivot'
};

const FIRST_PERSON_FRAME_NOTE = {
    id: 'first_person_frame', text: 'display_sensei.info.first_person_frame', tip: 'display_sensei.info.first_person_frame_tip'
};
const BEDROCK_DIFFERENCE_NOTES = {
    firstperson_righthand: FIRST_PERSON_FRAME_NOTE,
    firstperson_lefthand: FIRST_PERSON_FRAME_NOTE,
    head: { id: 'head_wearable', text: 'display_sensei.info.head_wearable', tip: 'display_sensei.info.head_wearable_tip' },
    on_shelf: { id: 'shelf_alignment', text: 'display_sensei.info.shelf_alignment', tip: 'display_sensei.info.shelf_alignment_tip' }
};
const SHARED_THIRD_PERSON_NOTE = { id: 'shared_third_person', text: 'display_sensei.info.third_front_shared' };

const AXIS_LETTERS = ['X', 'Y', 'Z'];

const MOVE_STEPS = [0.1, 0.25, 0.5, 1, 2, 4];
const DEFAULT_MOVE_STEP = 0.5;

const INPUT_STEPS = { rotation: 1, scale: 0.05, rotation_pivot: 0.05, scale_pivot: 0.05 };

const NUDGE_BUTTONS = [
    { id: 'x-', axis: 0, sign: -1 }, { id: 'x+', axis: 0, sign: 1 },
    { id: 'y-', axis: 1, sign: -1 }, { id: 'y+', axis: 1, sign: 1 },
    { id: 'z-', axis: 2, sign: -1 }, { id: 'z+', axis: 2, sign: 1 }
];

const NUDGE_REPEAT_DELAY_MS = 400;
const NUDGE_REPEAT_INTERVAL_MS = 60;

const ROTATION_SLIDER_RANGE = [-180, 180];
const ROTATION_QUICK_VALUES = [-90, 0, 45, 90, 180];

const SCALE_QUICK_VALUES = [0.25, 0.375, 0.5, 0.625, 1, 1.5];
const SCALE_SLIDER_STEP = 0.005;

const POSE_ANGLE_STEP = 0.5;

const BACK_CAMERA_OPTIONS = [
    { id: 'shoulder', label: 'display_sensei.ui.back_camera_shoulder', hint: 'display_sensei.ui.back_camera_shoulder_hint' },
    { id: 'straight', label: 'display_sensei.ui.back_camera_straight', hint: 'display_sensei.ui.back_camera_straight_hint' }
];

const PRESET_SCOPES = [
    { id: 'context', label: 'display_sensei.ui.preset_scope_context' },
    { id: 'all', label: 'display_sensei.ui.preset_scope_all' }
];

const BLOCKBENCH_REFERENCE_NAMES = {
    block: 'display_sensei.reference.block'
};

const FIT_PREVIEW_OPTION_ID = 'fit_preview';

const SAVED_PRESET_GROUP = { id: 'saved', label: 'display_sensei.ui.saved_presets' };

const CALIBRATION_ACTIONS = [
    { id: 'item_hold', name: 'display_sensei.preset.item_hold', label: 'display_sensei.ui.calibrate_item_hold', hint: 'display_sensei.ui.calibrate_item_hold_hint' },
    { id: 'tool_hold', name: 'display_sensei.preset.tool_hold', label: 'display_sensei.ui.calibrate_tool_hold', hint: 'display_sensei.ui.calibrate_tool_hold_hint' }
];

const ITEM_TURN_STEP = 5;

const HAND_VIEW_SIZE = [320, 180];
const HAND_VIEW_REFRESH_MS = 120;

// =========================
// Held 3D items: controls
// =========================
const HOLD_EDITOR_CHANNELS = { translation: 'position', rotation: 'rotation', scale: 'scale' };

const HOLD_SLIDER_RANGES = Object.freeze({ translation: [-48, 48], rotation: ROTATION_SLIDER_RANGE, scale: [0, 4] });

const HOLD_INPUT_LIMITS = Object.freeze({ translation: HOLD_RANGES.position, rotation: HOLD_RANGES.rotation, scale: HOLD_RANGES.scale });

const HOLD_PRESET_SCOPES = [
    { id: 'context', label: 'display_sensei.hold.preset_scope_view' },
    { id: 'all', label: 'display_sensei.hold.preset_scope_both' }
];

const HOLD_STATUS_NOTES = {
    missing: { text: 'display_sensei.hold.note_missing', tip: 'display_sensei.hold.note_missing_tip' },
    new: { text: 'display_sensei.hold.note_new', tip: 'display_sensei.hold.note_new_tip' },
    stacked: { text: 'display_sensei.hold.note_stacked', tip: 'display_sensei.hold.note_stacked_tip' },
    controller: { text: 'display_sensei.hold.note_controller', tip: 'display_sensei.hold.note_controller_tip' }
};

const HOLD_REASON_NOTES = {
    animated: { text: 'display_sensei.hold.note_animated', tip: 'display_sensei.hold.note_animated_tip' },
    molang: { text: 'display_sensei.hold.note_molang', tip: 'display_sensei.hold.note_animated_tip' },
    no_bone: { text: 'display_sensei.hold.note_no_bone', tip: 'display_sensei.hold.note_no_bone_tip' }
};

const HOLD_CHECK_TEXTS = {
    no_hand_binding: { text: 'display_sensei.hold_check.no_hand_binding', tip: 'display_sensei.hold_check.no_hand_binding_tip' },
    loose_roots: { text: 'display_sensei.hold_check.loose_roots', tip: 'display_sensei.hold_check.loose_roots_tip' },
    far_from_hand: { text: 'display_sensei.hold_check.far_from_hand', tip: 'display_sensei.hold_check.far_from_hand_tip' }
};

const HOLD_FIX_LABELS = {
    bind_root: { label: 'display_sensei.hold_check.fix_bind_root', hint: 'display_sensei.hold_check.fix_bind_root_hint' },
    move_into_bound: { label: 'display_sensei.hold_check.fix_move_into_bound', hint: 'display_sensei.hold_check.fix_move_into_bound_hint' }
};

const HOLD_VIEW_NAMES = {
    first_person: 'display_sensei.hold.view_first_person',
    third_person: 'display_sensei.hold.view_third_person'
};

const HOLD_WRITE_MESSAGES = {
    written: 'display_sensei.message.hold_written',
    nothing: 'display_sensei.message.hold_nothing',
    no_file: 'display_sensei.message.hold_no_file',
    missing_file: 'display_sensei.message.hold_missing_file',
    unreadable: 'display_sensei.message.hold_unreadable',
    failed: 'display_sensei.message.hold_failed',
    loaded: 'display_sensei.message.hold_loaded',
    desktop_only: 'display_sensei.message.hold_desktop_only'
};

const HOLD_MATCH_STARTS = {
    file: 'display_sensei.message.hold_match_from_file',
    item_wizard_tool: 'display_sensei.message.hold_match_from_tool'
};

// =========================
// Armor card: controls
// =========================
const WEAR_KINDS = [
    { id: 'auto', label: 'display_sensei.armor.kind_auto' },
    { id: 'armor', label: 'display_sensei.armor.kind_armor' },
    { id: 'worn', label: 'display_sensei.armor.kind_worn' },
    { id: 'held', label: 'display_sensei.armor.kind_held' }
];

const WEAR_KIND_TEXTS = {
    armor: { text: 'display_sensei.armor.detected_armor', tip: 'display_sensei.armor.detected_armor_tip' },
    worn: { text: 'display_sensei.armor.detected_worn', tip: 'display_sensei.armor.detected_worn_tip' },
    held: { text: 'display_sensei.armor.detected_held', tip: 'display_sensei.armor.detected_held_tip' },
    unknown: { text: 'display_sensei.armor.detected_unknown', tip: 'display_sensei.armor.detected_unknown_tip' }
};
const HELD_IN_SLOT_TEXT = { text: 'display_sensei.armor.detected_held_slot', tip: 'display_sensei.armor.detected_held_tip' };
const WORN_ELSEWHERE_TEXT = { text: 'display_sensei.armor.detected_worn_elsewhere', tip: 'display_sensei.armor.detected_worn_elsewhere_tip' };

const WEAR_SOURCE_TEXTS = {
    saved: { text: 'display_sensei.armor.source_saved' },
    pack: { text: 'display_sensei.armor.source_pack', tip: 'display_sensei.armor.source_pack_tip' },
    file: { text: 'display_sensei.armor.source_file', tip: 'display_sensei.armor.source_file_tip' },
    bones: { text: 'display_sensei.armor.source_bones', tip: 'display_sensei.armor.source_bones_tip' }
};

const ARMOR_OVERLAY_TOGGLES = [
    { id: 'show', label: 'display_sensei.armor.overlay_show', hint: 'display_sensei.armor.overlay_show_hint' },
    { id: 'outerLayer', label: 'display_sensei.armor.overlay_outer_layer', hint: 'display_sensei.armor.overlay_outer_layer_hint' },
    { id: 'xray', label: 'display_sensei.armor.overlay_xray', hint: 'display_sensei.armor.overlay_xray_hint' }
];

const ARMOR_OTHER_SLOTS = [
    { id: 'none', label: 'display_sensei.armor.other_slots_none' },
    { id: 'grey', label: 'display_sensei.armor.other_slots_grey' },
    { id: 'flat', label: 'display_sensei.armor.other_slots_flat' }
];

const ARMOR_CAMERA_VIEWS = [
    { id: 'front', label: 'display_sensei.armor.camera_front', hint: 'display_sensei.armor.camera_front_hint' },
    { id: 'back', label: 'display_sensei.armor.camera_back', hint: 'display_sensei.armor.camera_back_hint' },
    { id: 'right', label: 'display_sensei.armor.camera_right', hint: 'display_sensei.armor.camera_right_hint' },
    { id: 'left', label: 'display_sensei.armor.camera_left', hint: 'display_sensei.armor.camera_left_hint' }
];

const ARMOR_SEVERITY_LABELS = {
    error: 'display_sensei.armor.severity_error',
    warning: 'display_sensei.armor.severity_warning',
    info: 'display_sensei.armor.severity_info'
};

const ARMOR_CHECK_TIPS = {
    'display_sensei.armor_check.nothing_follows': 'display_sensei.armor_check.nothing_follows_tip',
    'display_sensei.armor_check.slot_mix': 'display_sensei.armor_check.slot_mix_tip',
    'display_sensei.armor_check.name_alias': 'display_sensei.armor_check.name_alias_tip',
    'display_sensei.armor_check.pivot_delta': 'display_sensei.armor_check.pivot_delta_tip',
    'display_sensei.armor_check.pivot_wearer': 'display_sensei.armor_check.pivot_wearer_tip',
    'display_sensei.armor_check.reserved_marker': 'display_sensei.armor_check.reserved_marker_tip',
    'display_sensei.armor_check.nested_match': 'display_sensei.armor_check.nested_match_tip',
    'display_sensei.armor_check.bound_offset': 'display_sensei.armor_check.bound_offset_tip',
    'display_sensei.armor_check.item_slot_binding': 'display_sensei.armor_check.item_slot_binding_tip',
    'display_sensei.armor_check.binding_version': 'display_sensei.armor_check.binding_version_tip',
    'display_sensei.armor_check.clearance_inside': 'display_sensei.armor_check.clearance_inside_tip',
    'display_sensei.armor_check.clearance_flicker': 'display_sensei.armor_check.clearance_flicker_tip',
    'display_sensei.armor_check.vanilla_overlap': 'display_sensei.armor_check.vanilla_overlap_tip',
    'display_sensei.armor_check.no_parent_setup': 'display_sensei.armor_check.no_parent_setup_tip',
    'display_sensei.armor_check.target_missing': 'display_sensei.armor_check.target_missing_tip',
    'display_sensei.armor_check.wearer_hides_armor': 'display_sensei.armor_check.wearer_hides_armor_tip'
};

const ARMOR_FIX_LABELS = {
    rename: { label: 'display_sensei.armor.fix_rename', hint: 'display_sensei.armor.fix_rename_hint' },
    snap_pivot_keep: { label: 'display_sensei.armor.fix_snap_pivot_keep', hint: 'display_sensei.armor.fix_snap_pivot_keep_hint' },
    snap_pivot_move: { label: 'display_sensei.armor.fix_snap_pivot_move', hint: 'display_sensei.armor.fix_snap_pivot_move_hint' },
    flatten: { label: 'display_sensei.armor.fix_flatten', hint: 'display_sensei.armor.fix_flatten_hint' },
    wrap_pivot_parent: { label: 'display_sensei.armor.fix_wrap_pivot_parent', hint: 'display_sensei.armor.fix_wrap_pivot_parent_hint' }
};

const FIT_CHANNELS = [
    { id: 'position', label: 'display_sensei.armor.fit_position' },
    { id: 'rotation', label: 'display_sensei.ui.rotation' },
    { id: 'scale', label: 'display_sensei.ui.scale' }
];
const FIT_DEFAULTS = { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] };
const FIT_STEPS = { position: 0.1, rotation: 1, scale: 0.01 };
const FIT_RANGES = { position: [-16, 16], rotation: [-180, 180], scale: [0, 4] };

const ARMOR_FACTS = [
    { id: 'flat_icon', text: 'display_sensei.armor.fact_flat_icon', tip: 'display_sensei.armor.fact_flat_icon_tip' },
    { id: 'first_person', text: 'display_sensei.armor.fact_first_person', tip: 'display_sensei.armor.fact_first_person_tip' },
    { id: 'slim', text: 'display_sensei.armor.fact_slim', tip: 'display_sensei.armor.fact_slim_tip' },
    { id: 'parent_setup', text: 'display_sensei.armor.fact_parent_setup', tip: 'display_sensei.armor.fact_parent_setup_tip' },
    { id: 'trims', text: 'display_sensei.armor.fact_trims', tip: 'display_sensei.armor.fact_trims_tip' },
    { id: 'elytra', text: 'display_sensei.armor.fact_elytra', tip: 'display_sensei.armor.fact_elytra_tip' },
    { id: 'cape', text: 'display_sensei.armor.fact_cape' }
];
const ARMOR_VERSION_FACTS = [
    { version: '26.10', text: 'display_sensei.armor.version_26_10', tip: 'display_sensei.armor.version_26_10_tip' },
    { version: '26.20', text: 'display_sensei.armor.version_26_20', tip: 'display_sensei.armor.version_26_20_tip' },
    { version: '26.30', text: 'display_sensei.armor.version_26_30', tip: 'display_sensei.armor.version_26_30_tip' }
];

function readFitValues(entry) {
    let values = {};
    for (let channel of FIT_CHANNELS) {
        let stored = entry && entry[channel.id];
        values[channel.id] = Array.isArray(stored) && stored.length === 3 ? stored.slice() : FIT_DEFAULTS[channel.id].slice();
    }
    return values;
}

const PANEL_CONSTANTS = Object.freeze({
    mainTabs: MAIN_TABS,
    hands: HANDS,
    routes: ROUTES,
    channelTabs: CHANNEL_TABS,
    pivotChannels: PIVOT_CHANNELS,
    pivotMarkerColors: PIVOT_MARKER_COLORS,
    axisLetters: AXIS_LETTERS,
    moveSteps: MOVE_STEPS,
    inputSteps: INPUT_STEPS,
    nudgeButtons: NUDGE_BUTTONS,
    rotationSliderRange: ROTATION_SLIDER_RANGE,
    rotationQuickValues: ROTATION_QUICK_VALUES,
    scaleQuickValues: SCALE_QUICK_VALUES,
    scaleSliderStep: SCALE_SLIDER_STEP,
    slotRanges: SLOT_RANGES,
    presetScopes: PRESET_SCOPES,
    backCameraOptions: BACK_CAMERA_OPTIONS,
    poseAngleStep: POSE_ANGLE_STEP,
    handViewSize: HAND_VIEW_SIZE,
    itemTurnStep: ITEM_TURN_STEP,
    wearKinds: WEAR_KINDS,
    armorOverlayToggles: ARMOR_OVERLAY_TOGGLES,
    armorOtherSlots: ARMOR_OTHER_SLOTS,
    armorCameraViews: ARMOR_CAMERA_VIEWS,
    fitChannels: FIT_CHANNELS,
    fitSteps: FIT_STEPS,
    fitRanges: FIT_RANGES,
    armorFacts: ARMOR_FACTS,
    armorVersionFacts: ARMOR_VERSION_FACTS,
    holdSliderRanges: HOLD_SLIDER_RANGES,
    holdInputLimits: HOLD_INPUT_LIMITS
});

let panelInstance = null;
let panelVue = null;
const followedWearSlots = new WeakMap();

function getPanel() {
    return panelInstance;
}

function isPanelVisible() {
    return !!panelInstance && !!panelInstance.isVisible();
}

function findMainTab(tabId) {
    return MAIN_TABS.find(tab => tab.id === tabId) || null;
}

function findSubtab(tab, subtabId) {
    return tab.subtabs.find(subtab => subtab.id === subtabId) || null;
}

function findHand(handId) {
    return HANDS.find(hand => hand.id === handId) || null;
}

// =========================
// Numbers in the editor
// =========================
function roundEditorValue(value) {
    return Math.round(value * 10000) / 10000;
}

function formatEditorValue(value) {
    let rounded = roundEditorValue(Number(value) || 0);
    return String(rounded === 0 ? 0 : rounded);
}

function readTypedValue(channel, text) {
    let number = parseFloat(text);
    return Number.isFinite(number) ? sanitizeSlotValue(channel, number) : null;
}

function formatTransformsProperty(transforms) {
    let lines = compileJSON({ item_display_transforms: transforms }, { final_newline: false }).split('\n');
    let inner = lines.slice(1, -1);
    let indent = inner.length ? inner[0].match(/^\s*/)[0] : '';
    return inner.map(line => (line.startsWith(indent) ? line.slice(indent.length) : line)).join('\n');
}

function findContextsWithDefaultScale(value) {
    let defaults = getEngineDefaults();
    return BEDROCK_SLOTS
        .filter(slot => {
            let scale = defaults[slot.id] && defaults[slot.id].scale;
            return Array.isArray(scale) && scale.every(axisValue => sameNumber(axisValue, value));
        })
        .map(slot => i18n(slot.label));
}

// =========================
// Remembered UI state (last tab, sub-tab per tab, hand, editor choices)
// =========================
function getDefaultUiState() {
    return {
        tab: 'hand',
        subtabs: { hand: 'first_person', world: 'item_frame', inventory: 'gui', armor: 'slot.armor.head' },
        hand: 'right',
        channel: 'translation',
        moveStep: DEFAULT_MOVE_STEP,
        translationAxis: 0,
        rotationAxis: 0,
        scaleAxis: 0,
        scaleLocked: true,
        advancedOpen: false,
        viewOpen: true,
        handViewsOpen: true,
        presetScope: 'context',
        backCamera: 'shoulder',
        armorWearer: 'player_wide',
        armorOverlay: { show: true, outerLayer: true, otherSlots: 'none', xray: false },
        armorFitChannel: 'position',
        armorFactsOpen: false
    };
}

function loadUiState() {
    let state = getDefaultUiState();
    let stored = null;
    try {
        stored = JSON.parse(localStorage.getItem(UI_STATE_STORAGE_KEY));
    } catch (error) {
        stored = null;
    }
    if (!stored || typeof stored !== 'object') {
        return state;
    }
    if (findMainTab(stored.tab)) {
        state.tab = stored.tab;
    }
    MAIN_TABS.forEach(tab => {
        let subtabId = stored.subtabs && stored.subtabs[tab.id];
        if (findSubtab(tab, subtabId)) {
            state.subtabs[tab.id] = subtabId;
        }
    });
    if (findHand(stored.hand)) {
        state.hand = stored.hand;
    }
    if (CHANNEL_TABS.some(channel => channel.id === stored.channel)) {
        state.channel = stored.channel;
    }
    if (MOVE_STEPS.includes(stored.moveStep)) {
        state.moveStep = stored.moveStep;
    }
    for (let key of ['translationAxis', 'rotationAxis', 'scaleAxis']) {
        if ([0, 1, 2].includes(stored[key])) {
            state[key] = stored[key];
        }
    }
    if (typeof stored.scaleLocked === 'boolean') {
        state.scaleLocked = stored.scaleLocked;
    }
    if (typeof stored.advancedOpen === 'boolean') {
        state.advancedOpen = stored.advancedOpen;
    }
    if (typeof stored.viewOpen === 'boolean') {
        state.viewOpen = stored.viewOpen;
    }
    if (typeof stored.handViewsOpen === 'boolean') {
        state.handViewsOpen = stored.handViewsOpen;
    }
    if (PRESET_SCOPES.some(scope => scope.id === stored.presetScope)) {
        state.presetScope = stored.presetScope;
    }
    if (BACK_CAMERA_OPTIONS.some(option => option.id === stored.backCamera)) {
        state.backCamera = stored.backCamera;
    }
    if (getWearerChoices().some(choice => choice.id === stored.armorWearer)) {
        state.armorWearer = stored.armorWearer;
    }
    let overlay = stored.armorOverlay;
    if (overlay && typeof overlay === 'object') {
        for (let toggle of ARMOR_OVERLAY_TOGGLES) {
            if (typeof overlay[toggle.id] === 'boolean') {
                state.armorOverlay[toggle.id] = overlay[toggle.id];
            }
        }
        if (ARMOR_OTHER_SLOTS.some(choice => choice.id === overlay.otherSlots)) {
            state.armorOverlay.otherSlots = overlay.otherSlots;
        }
    }
    if (FIT_CHANNELS.some(channel => channel.id === stored.armorFitChannel)) {
        state.armorFitChannel = stored.armorFitChannel;
    }
    if (typeof stored.armorFactsOpen === 'boolean') {
        state.armorFactsOpen = stored.armorFactsOpen;
    }
    return state;
}

function saveUiState(state) {
    try {
        localStorage.setItem(UI_STATE_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.warn(LOG_PREFIX, 'Could not save the panel state:', error);
    }
}

// =========================
// X / Y / Z inputs
// =========================
const AXIS_INPUTS_TEMPLATE = `
<div class="ds-axis-inputs" :data-ds-channel="channel">
    <div class="ds-pos-labels">
        <div v-for="letter in letters" :key="letter">{{ letter }}</div>
    </div>
    <div class="ds-pos-inputs">
        <input
            v-for="(letter, axis) in letters"
            :key="letter"
            type="number"
            class="tab_target"
            :data-ds-input="channel + '.' + axis"
            :title="letter"
            :value="format(values[axis])"
            :step="step"
            :min="range[0]"
            :max="range[1]"
            @focus="rememberProject"
            @change="commit(axis, $event)"
            @keydown.enter="commit(axis, $event)"
            @keydown.esc.stop.prevent="revert(axis, $event)"
        >
    </div>
</div>
`;

function buildAxisInputsComponent() {
    return {
        name: 'display-sensei-axis-inputs',
        template: AXIS_INPUTS_TEMPLATE,
        props: {
            channel: String,
            values: Array,
            step: Number,
            limits: Array
        },
        created() {
            this.focusProject = null;
        },
        computed: {
            letters() {
                return AXIS_LETTERS;
            },
            range() {
                return this.limits || SLOT_RANGES[this.channel];
            }
        },
        methods: {
            format: formatEditorValue,
            rememberProject() {
                this.focusProject = Project;
            },
            commit(axis, event) {
                if (this.focusProject && this.focusProject !== Project) {
                    this.revert(axis, event);
                    return;
                }
                this.$emit('commit', this.channel, axis, event);
            },
            revert(axis, event) {
                event.target.value = formatEditorValue(this.values[axis]);
                event.target.blur();
            }
        }
    };
}

// =========================
// Info tips
// =========================
const TIP_TEMPLATE = `<span class="ds-tip" role="img" :title="text" :aria-label="text"></span>`;

function buildTipComponent() {
    return {
        name: 'display-sensei-tip',
        template: TIP_TEMPLATE,
        props: { text: String }
    };
}

// =========================
// Panel template
// =========================
const PANEL_TEMPLATE = `
<div class="display-sensei-body" :data-ds-route="route" :data-ds-panel-mode="panelMode">
    <div class="ds-scroll">
        <div class="ds-header">
            <div class="ds-header-text">
                <h4 class="ds-title">{{ t('display_sensei.ui.title') }}</h4>
                <p class="ds-subtitle">{{ t('display_sensei.ui.subtitle') }}</p>
            </div>
        </div>

        <div v-if="currentRoute" class="ds-route-badge" :data-ds-route="route" :title="t(currentRoute.hint)">
            <span>{{ t(currentRoute.label) }}</span>
            <span class="ds-route-format">{{ formatId }}</span>
        </div>

        <div v-else class="ds-info-card" data-ds-card="no_route">
            <h5>{{ t('display_sensei.info.no_route_title') }}</h5>
            <p>{{ t('display_sensei.info.no_route') }}</p>
            <p v-for="choice in ui.routes" :key="choice.id">
                <b>{{ t(choice.label) }}</b>
                <span class="ds-code">{{ choice.formatId }}</span><ds-tip :text="t(choice.hint)"></ds-tip>
            </p>
            <p v-if="formatId" class="ds-hint">{{ tf('display_sensei.info.current_format', { format: formatId }) }}</p>
        </div>

        <template v-if="currentRoute">
            <p v-if="entityKeepsTransforms" class="ds-card-note" data-ds-note="entity_display_kept">{{ t('display_sensei.info.entity_display_kept') }}<ds-tip :text="t('display_sensei.info.entity_display_kept_tip')"></ds-tip></p>

            <div class="ds-tabs">
                <button
                    v-for="tab in ui.mainTabs"
                    :key="tab.id"
                    type="button"
                    class="ds-tab"
                    :class="{ active: activeTab === tab.id }"
                    :data-ds-tab="tab.id"
                    @click="setMainTab(tab.id)"
                >{{ t(tab.label) }}</button>
            </div>

            <div v-if="currentSubtabs.length" class="ds-subtab-row">
                <div class="ds-subtabs" :class="'ds-grid-' + currentSubtabs.length">
                    <button
                        v-for="subtab in currentSubtabs"
                        :key="subtab.id"
                        type="button"
                        class="ds-subtab"
                        :class="{ active: activeSubtabId === subtab.id, 'ds-worn': isWornSubtab(subtab.id) }"
                        :data-ds-subtab="subtab.id"
                        :data-ds-worn="isWornSubtab(subtab.id) ? 'true' : null"
                        :title="isWornSubtab(subtab.id) ? tf('display_sensei.armor.worn_here_hint', { slot: subtab.id }) : null"
                        @click="setSubtab(subtab.id)"
                    >{{ t(subtab.label) }}</button>
                </div>
                <div v-if="activeTab === 'hand'" class="ds-hand-toggle" role="group" :aria-label="t('display_sensei.ui.hand')">
                    <button
                        v-for="handOption in ui.hands"
                        :key="handOption.id"
                        type="button"
                        class="ds-segment"
                        :class="{ active: hand === handOption.id }"
                        :title="t(handOption.label)"
                        :data-ds-hand="handOption.id"
                        @click="setHand(handOption.id)"
                    >{{ t(handOption.short) }}</button>
                </div>
            </div>

            <div
                v-if="showEditor"
                class="ds-transform-box"
                data-ds-card="edit"
                :data-ds-slot="activeSlot.id"
                :data-ds-wear-slot="activeWearSlot ? activeWearSlot.id : null"
                :data-ds-state="slotState.inherited ? 'default' : 'custom'"
                :data-ds-hold-status="isHoldEditor ? slotState.hold.status : null"
            >
                <div class="ds-card-head">
                    <h5 :title="cardNote ? t(activeSubtab.info) : null">{{ getCardTitle() }}</h5>
                    <span
                        v-if="!isHoldEditor"
                        class="ds-chip"
                        :class="{ custom: !slotState.inherited }"
                        data-ds-chip
                        :title="slotState.inherited ? t('display_sensei.ui.state_default_hint') : t('display_sensei.ui.state_custom_hint')"
                    >{{ slotState.inherited ? t('display_sensei.ui.state_default') : t('display_sensei.ui.state_custom') }}</span>
                    <span
                        v-else-if="showsOffHandChoice()"
                        class="ds-chip"
                        :class="{ custom: !slotState.inherited }"
                        data-ds-chip="off_hand"
                        :title="slotState.inherited ? t('display_sensei.hold.state_same_hint') : t('display_sensei.hold.state_own_hint')"
                    >{{ slotState.inherited ? t('display_sensei.hold.state_same') : t('display_sensei.hold.state_own') }}</span>
                </div>
                <div v-if="!isHoldEditor" class="ds-card-key"><span class="ds-code" :title="getSlotNameHint()">{{ cardTarget.key }}</span> {{ getCardTargetName() }}</div>
                <div v-else class="ds-card-key" data-ds-hold-key><span class="ds-code" data-ds-hold-animation :title="t('display_sensei.hold.animation_hint')">{{ slotState.hold.animation }}</span> <span class="ds-code" data-ds-hold-bone :title="t('display_sensei.hold.bone_hint')">{{ slotState.hold.bone }}</span></div>
                <div v-if="activeWearSlot" class="ds-card-key" data-ds-wear-key><span class="ds-code" :title="t('display_sensei.armor.wearable_slot_name')">{{ activeWearSlot.wearableSlot }}</span></div>
                <p class="ds-card-text" :data-ds-note="cardNote ? cardNote.id : null">{{ cardNote ? t(cardNote.text) : t(activeSubtab.info) }}<ds-tip v-if="getCardTextTip()" :text="getCardTextTip()"></ds-tip></p>
                <p v-for="note in getVersionNotes()" :key="note.id" class="ds-card-note" :data-ds-note="note.id">{{ note.text }}<ds-tip v-if="note.tip" :text="note.tip"></ds-tip></p>
                <p v-if="slotState.handFallbackNote" class="ds-card-note" data-ds-note="hand_fallback">{{ slotState.handFallbackNote }}</p>

                <template v-if="isHoldEditor">
                    <p v-for="note in getHoldNotes()" :key="note.id" class="ds-card-note" :data-ds-note="note.id">{{ note.text }}<ds-tip v-if="note.tip" :text="note.tip"></ds-tip></p>
                    <div v-if="!slotState.hold.editing" class="ds-info-actions">
                        <button
                            type="button"
                            class="ds-icon-button"
                            data-ds-action="hold_edit_mode"
                            :title="t('display_sensei.hold.edit_mode_hint')"
                            @click="enterEditMode"
                        ><i class="material-icons">edit</i><span>{{ t('display_sensei.hold.edit_mode') }}</span></button>
                    </div>
                    <div
                        v-for="check in holdChecks"
                        :key="check.id"
                        class="ds-armor-check"
                        :class="'ds-severity-' + check.severity"
                        :data-ds-hold-check="check.id"
                        :data-ds-severity="check.severity"
                    >
                        <div class="ds-armor-check-head">
                            <span class="ds-chip" :class="'ds-chip-' + check.severity" data-ds-chip="severity">{{ getSeverityLabel(check.severity) }}</span>
                            <span v-if="check.approximate" class="ds-chip" data-ds-chip="hold_estimate" :title="t('display_sensei.hold.estimate_hint')">{{ t('display_sensei.hold.estimate') }}</span>
                        </div>
                        <p class="ds-armor-check-text">{{ getHoldCheckText(check) }}<ds-tip :text="getHoldCheckTip(check)"></ds-tip></p>
                        <div v-if="check.fix" class="ds-armor-fixes">
                            <button
                                type="button"
                                data-ds-action="hold_fix"
                                :data-ds-fix="check.fix"
                                :title="getHoldFixHint(check)"
                                @click="applyHoldFix(check.fix)"
                            >{{ getHoldFixLabel(check) }}</button>
                        </div>
                    </div>
                </template>

                <div v-if="isHoldEditor && holdView.shown" class="ds-view" data-ds-view data-ds-hold-view>
                    <div class="ds-view-head">
                        <button
                            type="button"
                            class="ds-view-toggle"
                            :class="{ open: viewOpen }"
                            data-ds-action="toggle_view"
                            :aria-expanded="viewOpen ? 'true' : 'false'"
                            :title="t('display_sensei.ui.view_toggle_hint')"
                            @click="toggleView"
                        ><i class="material-icons">expand_more</i><span>{{ t('display_sensei.ui.view') }}</span></button>
                        <span class="ds-chip" data-ds-chip="preview_only" :title="t('display_sensei.hold.preview_only_hint')">{{ t('display_sensei.ui.preview_only') }}</span>
                        <button
                            type="button"
                            class="ds-icon-button"
                            data-ds-action="reset_view"
                            :title="t('display_sensei.hold.reset_view_hint')"
                            @click="resetView"
                        ><i class="material-icons">center_focus_strong</i><span>{{ t('display_sensei.ui.reset_view') }}</span></button>
                    </div>
                    <template v-if="viewOpen">
                        <div v-if="activeSubtabId === 'third_back'" class="ds-flex-row">
                            <span class="ds-row-label">{{ t('display_sensei.ui.back_camera') }}</span>
                            <div class="ds-segment-group" role="group" :aria-label="t('display_sensei.ui.back_camera')">
                                <button
                                    v-for="option in ui.backCameraOptions"
                                    :key="option.id"
                                    type="button"
                                    class="ds-segment"
                                    :class="{ active: backCamera === option.id }"
                                    :title="t(option.hint)"
                                    :data-ds-back-camera="option.id"
                                    @click="setBackCamera(option.id)"
                                >{{ t(option.label) }}</button>
                            </div>
                        </div>
                        <div v-if="activeSubtabId !== 'first_person'" class="ds-flex-row" :title="t('display_sensei.hold.held_by_hint')">
                            <span class="ds-row-label">{{ t('display_sensei.hold.held_by') }}</span>
                            <select data-ds-control="hold_wearer" :value="holdView.wearer" @change="setHoldWearerFrom($event)">
                                <option v-for="choice in holdView.wearers" :key="choice.id" :value="choice.id">{{ choice.label }}</option>
                            </select>
                        </div>
                        <p v-else class="ds-view-note" data-ds-note="hold_first_person_view"><span class="ds-chip" data-ds-chip="hold_view_estimate">{{ t('display_sensei.hold.estimate') }}</span> {{ t('display_sensei.hold.first_person_view') }}<ds-tip :text="t('display_sensei.hold.first_person_view_tip')"></ds-tip></p>
                    </template>
                </div>

                <div v-if="!isHoldEditor && viewState.shown" class="ds-view" data-ds-view>
                    <div class="ds-view-head">
                        <button
                            type="button"
                            class="ds-view-toggle"
                            :class="{ open: viewOpen }"
                            data-ds-action="toggle_view"
                            :aria-expanded="viewOpen ? 'true' : 'false'"
                            :title="t('display_sensei.ui.view_toggle_hint')"
                            @click="toggleView"
                        ><i class="material-icons">expand_more</i><span>{{ t('display_sensei.ui.view') }}</span></button>
                        <span class="ds-chip" data-ds-chip="preview_only" :title="t('display_sensei.ui.preview_only_hint')">{{ t('display_sensei.ui.preview_only') }}</span>
                        <button
                            type="button"
                            class="ds-icon-button"
                            data-ds-action="reset_view"
                            :title="t('display_sensei.ui.reset_view_hint')"
                            @click="resetView"
                        ><i class="material-icons">center_focus_strong</i><span>{{ t('display_sensei.ui.reset_view') }}</span></button>
                    </div>
                    <template v-if="viewOpen">
                        <div v-if="activeSubtabId === 'third_back'" class="ds-flex-row">
                            <span class="ds-row-label">{{ t('display_sensei.ui.back_camera') }}</span>
                            <div class="ds-segment-group" role="group" :aria-label="t('display_sensei.ui.back_camera')">
                                <button
                                    v-for="option in ui.backCameraOptions"
                                    :key="option.id"
                                    type="button"
                                    class="ds-segment"
                                    :class="{ active: backCamera === option.id }"
                                    :title="t(option.hint)"
                                    :data-ds-back-camera="option.id"
                                    @click="setBackCamera(option.id)"
                                >{{ t(option.label) }}</button>
                            </div>
                        </div>
                        <div v-if="showReferenceRow()" class="ds-flex-row ds-view-reference" data-ds-control="reference_model">
                            <span class="ds-row-label">{{ t('display_sensei.ui.reference_model') }}</span>
                            <div class="ds-view-picker">
                                <div v-if="viewState.references" class="ds-icon-segments" role="group" :aria-label="t('display_sensei.ui.reference_model')">
                                    <button
                                        v-for="choice in viewState.references"
                                        :key="choice.id"
                                        type="button"
                                        class="ds-segment"
                                        :class="{ active: choice.active }"
                                        :title="getReferenceName(choice)"
                                        :aria-label="getReferenceName(choice)"
                                        :data-ds-reference="choice.id"
                                        @click="setReference(choice.id)"
                                        v-html="getIconHtml(choice.icon)"
                                    ></button>
                                </div>
                                <div class="ds-view-caption-row">
                                    <span class="ds-view-caption" data-ds-output="reference_name">{{ getActiveReferenceName() }}</span>
                                    <span
                                        v-if="viewState.reference && viewState.reference.approximate"
                                        class="ds-chip"
                                        data-ds-chip="reference_estimate"
                                        :title="t('display_sensei.ui.reference_estimate_hint')"
                                    >{{ t('display_sensei.ui.reference_estimate') }}</span>
                                    <ds-tip v-if="viewState.reference && viewState.reference.note" data-ds-output="reference_note" :text="viewState.reference.note"></ds-tip>
                                </div>
                            </div>
                        </div>
                        <template v-for="option in viewState.options">
                            <div
                                v-if="option.kind === 'select'"
                                :key="option.id"
                                class="ds-flex-row"
                                :data-ds-option-row="option.id"
                                :title="option.hint"
                            >
                                <span class="ds-row-label">{{ option.label }}</span>
                                <select :data-ds-option="option.id" :value="String(option.value)" @change="setReferenceOptionFrom(option, $event)">
                                    <option v-for="choice in option.choices" :key="choice.id" :value="String(choice.id)">{{ choice.label }}</option>
                                </select>
                            </div>
                            <label v-else :key="option.id" class="ds-check-row" :data-ds-option-row="option.id" :title="option.hint">
                                <input type="checkbox" :data-ds-option="option.id" :checked="option.value" @change="setReferenceOptionFrom(option, $event)">
                                <span>{{ option.label }}</span>
                            </label>
                        </template>
                        <div v-if="viewState.poseAngle" class="ds-flex-row" data-ds-control="pose_angle" :title="t('display_sensei.ui.pose_angle_hint')">
                            <span class="ds-row-label">{{ t('display_sensei.ui.pose_angle') }}</span>
                            <input
                                type="range"
                                data-ds-slider="pose_angle"
                                :min="viewState.poseAngle.min"
                                :max="viewState.poseAngle.max"
                                :step="ui.poseAngleStep"
                                :value="viewState.poseAngle.value"
                                @input="onPoseAngle($event)"
                            >
                            <span class="ds-view-value" data-ds-output="pose_angle">{{ formatPoseAngle() }}</span>
                        </div>
                        <label v-if="viewState.previewAnimation !== null" class="ds-check-row" :title="t('display_sensei.ui.preview_animation_hint')">
                            <input type="checkbox" data-ds-control="preview_animation" :checked="viewState.previewAnimation" @change="setPreviewAnimationFrom($event)">
                            <span>{{ t('display_sensei.ui.preview_animation') }}</span>
                        </label>
                        <div v-if="viewState.skin" class="ds-view-actions">
                            <button
                                type="button"
                                class="ds-icon-button"
                                data-ds-action="open_skin"
                                :title="t('display_sensei.ui.skin_hint')"
                                @click="openSkin"
                            ><i class="material-icons">person</i><span>{{ t('display_sensei.ui.skin') }}</span></button>
                        </div>
                    </template>
                </div>

                <div v-if="isViewShown && handViews" class="ds-hand-views" data-ds-hand-views>
                    <div class="ds-hand-views-head">
                        <button
                            type="button"
                            class="ds-view-toggle"
                            :class="{ open: handViewsOpen }"
                            data-ds-action="toggle_hand_views"
                            :aria-expanded="handViewsOpen ? 'true' : 'false'"
                            :title="t('display_sensei.ui.hand_views_hint')"
                            @click="toggleHandViews"
                        ><i class="material-icons">expand_more</i><span>{{ t('display_sensei.ui.hand_views') }}</span></button>
                        <span class="ds-chip" data-ds-chip="hand_views_preview_only" :title="t('display_sensei.ui.hand_views_preview_only_hint')">{{ t('display_sensei.ui.preview_only') }}</span>
                    </div>
                    <div v-if="handViewsOpen" class="ds-hand-view-grid">
                        <button
                            v-for="view in handViews"
                            :key="view.subtabId + '/' + view.handId"
                            type="button"
                            class="ds-hand-view"
                            :data-ds-hand-view="view.subtabId"
                            :title="tf('display_sensei.ui.hand_view_hint', { view: getSubtabLabel(view.subtabId) })"
                            @click="setSubtab(view.subtabId)"
                        >
                            <span class="ds-hand-view-picture" :class="{ 'ds-crosshair': view.subtabId === 'first_person' }">
                                <canvas ref="handViewCanvas" :data-ds-hand-view-canvas="view.subtabId" :width="ui.handViewSize[0]" :height="ui.handViewSize[1]"></canvas>
                            </span>
                            <span class="ds-hand-view-label">{{ getSubtabLabel(view.subtabId) }}</span>
                        </button>
                    </div>
                </div>

                <div v-if="otherHand" class="ds-match-row" data-ds-control="match_first_person">
                    <button
                        v-if="activeSubtabId === 'first_person'"
                        type="button"
                        class="ds-icon-button"
                        data-ds-action="match_first_person"
                        :title="t('display_sensei.ui.match_first_person_hint')"
                        @click="matchFirstPerson"
                    ><i class="material-icons">sync_alt</i><span>{{ t('display_sensei.ui.match_first_person') }}</span></button>
                    <button
                        v-else
                        type="button"
                        class="ds-icon-button"
                        data-ds-action="send_to_first_person"
                        :title="t('display_sensei.ui.send_to_first_person_hint')"
                        @click="matchFirstPerson"
                    ><i class="material-icons">sync_alt</i><span>{{ t('display_sensei.ui.send_to_first_person') }}</span></button>
                </div>

                <div v-if="isHoldEditor && showsOffHandChoice()" class="ds-check-group">
                    <label class="ds-check-row" :title="t('display_sensei.hold.same_as_main_hint')">
                        <input type="checkbox" data-ds-control="hold_same" :checked="slotState.inherited" :disabled="!slotState.hold.editing" @change="setInherited($event)">
                        <span>{{ t('display_sensei.hold.same_as_main') }}</span>
                    </label>
                </div>
                <div v-if="!isHoldEditor" class="ds-check-group">
                    <label class="ds-check-row" :title="t('display_sensei.ui.use_default_hint')">
                        <input type="checkbox" data-ds-control="inherit" :checked="slotState.inherited" @change="setInherited($event)">
                        <span>{{ t('display_sensei.ui.use_default') }}</span>
                    </label>
                    <label v-if="activeSlot.id === 'gui'" class="ds-check-row" :title="t('display_sensei.ui.fit_to_frame_hint')">
                        <input type="checkbox" data-ds-control="fit_to_frame" :checked="slotState.fitToFrame" @change="setFitToFrame($event)">
                        <span>{{ getTechnicalLabel('fit_to_frame', 'display_sensei.ui.fit_to_frame') }}</span>
                    </label>
                    <label
                        v-if="viewState.fitPreview"
                        class="ds-check-row ds-check-sub"
                        :data-ds-option-row="viewState.fitPreview.id"
                        :title="viewState.fitPreview.hint"
                    >
                        <input type="checkbox" :data-ds-option="viewState.fitPreview.id" :checked="viewState.fitPreview.value" @change="setReferenceOptionFrom(viewState.fitPreview, $event)">
                        <span>{{ viewState.fitPreview.label }}</span>
                    </label>
                </div>

                <div class="ds-grid-3 ds-channel-tabs">
                    <button
                        v-for="channel in ui.channelTabs"
                        :key="channel.id"
                        type="button"
                        class="ds-subtab"
                        :class="{ active: activeChannel === channel.id }"
                        :data-ds-channel-tab="channel.id"
                        @click="setChannel(channel.id)"
                    >{{ getChannelTabLabel(channel) }}</button>
                </div>

                <fieldset v-if="activeChannel === 'translation'" class="ds-channel" data-ds-section="translation" :disabled="!isChannelEditable('translation')">
                    <div class="ds-section-head">
                        <div class="ds-section-label">{{ isHoldEditor ? t('display_sensei.hold.position_label') : t('display_sensei.ui.translation_label') }}</div>
                        <button
                            type="button"
                            class="ds-reset-button"
                            data-ds-reset="translation"
                            :title="getResetChannelTitle('translation')"
                            @click="resetChannel('translation')"
                        ><i class="material-icons">replay</i><span>{{ t('display_sensei.ui.reset_channel') }}</span></button>
                    </div>
                    <ds-axis-inputs channel="translation" :values="slotState.values.translation" :step="moveStep" :limits="getInputLimits('translation')" @commit="commitAxis"></ds-axis-inputs>
                    <div class="ds-slider-row">
                        <div class="ds-axis-toggle ds-grid-3">
                            <button
                                v-for="(letter, axis) in ui.axisLetters"
                                :key="letter"
                                type="button"
                                class="ds-subtab"
                                :class="{ active: translationAxis === axis }"
                                :data-ds-translation-axis="axis"
                                :title="tf('display_sensei.ui.slider_axis', { axis: letter })"
                                @click="setTranslationAxis(axis)"
                            >{{ letter }}</button>
                        </div>
                        <input
                            type="range"
                            data-ds-slider="translation"
                            :min="getSliderRange('translation')[0]"
                            :max="getSliderRange('translation')[1]"
                            :step="moveStep"
                            :title="getTranslationSliderTitle()"
                            :style="{ '--color-thumb': 'var(--color-axis-' + ui.axisLetters[translationAxis].toLowerCase() + ')' }"
                            :value="slotState.values.translation[translationAxis]"
                            @mousedown="beginGesture($event)"
                            @touchstart="beginGesture($event)"
                            @input="onTranslationSlider($event)"
                            @change="releasePointer"
                        >
                    </div>
                    <div class="ds-flex-row ds-field">
                        <span class="ds-row-label">{{ t('display_sensei.ui.step') }}</span>
                        <select data-ds-control="move_step" :value="String(moveStep)" @change="setMoveStep($event)">
                            <option v-for="step in ui.moveSteps" :key="step" :value="String(step)">{{ tf('display_sensei.ui.step_px', { step: step }) }}</option>
                        </select>
                    </div>
                    <div class="ds-nudge-grid">
                        <button
                            v-for="nudge in ui.nudgeButtons"
                            :key="nudge.id"
                            type="button"
                            :data-ds-nudge="nudge.id"
                            :title="getNudgeTitle(nudge)"
                            @mousedown.prevent="startNudge(nudge, $event)"
                            @mouseup="releasePointer"
                            @mouseleave="releasePointer"
                            @touchstart.prevent="startNudge(nudge, $event)"
                            @touchend="releasePointer"
                            @touchcancel="releasePointer"
                            @click="nudgeFromKeyboard(nudge, $event)"
                        >{{ getNudgeLabel(nudge) }}</button>
                    </div>
                </fieldset>

                <fieldset v-else-if="activeChannel === 'rotation'" class="ds-channel" data-ds-section="rotation" :disabled="!isChannelEditable('rotation')">
                    <div class="ds-section-head">
                        <div class="ds-section-label">{{ t('display_sensei.ui.rotation_label') }}</div>
                        <button
                            type="button"
                            class="ds-reset-button"
                            data-ds-reset="rotation"
                            :title="getResetChannelTitle('rotation')"
                            @click="resetChannel('rotation')"
                        ><i class="material-icons">replay</i><span>{{ t('display_sensei.ui.reset_channel') }}</span></button>
                    </div>
                    <ds-axis-inputs channel="rotation" :values="slotState.values.rotation" :step="ui.inputSteps.rotation" :limits="getInputLimits('rotation')" @commit="commitAxis"></ds-axis-inputs>
                    <div v-if="slotState.gimbal" class="ds-card-note ds-gimbal-note" data-ds-note="gimbal">
                        <span>{{ getGimbalNote() }}<ds-tip :text="getGimbalTip()"></ds-tip></span>
                        <button
                            v-if="slotState.gimbal.tidy"
                            type="button"
                            data-ds-action="tidy_rotation"
                            :title="getTidyRotationTitle()"
                            @click="tidyRotation"
                        >{{ getTidyRotationLabel() }}</button>
                    </div>
                    <div class="ds-slider-row">
                        <div class="ds-axis-toggle ds-grid-3">
                            <button
                                v-for="(letter, axis) in ui.axisLetters"
                                :key="letter"
                                type="button"
                                class="ds-subtab"
                                :class="{ active: rotationAxis === axis }"
                                :data-ds-rotation-axis="axis"
                                :title="tf('display_sensei.ui.slider_axis', { axis: letter })"
                                @click="setRotationAxis(axis)"
                            >{{ letter }}</button>
                        </div>
                        <input
                            type="range"
                            data-ds-slider="rotation"
                            :min="ui.rotationSliderRange[0]"
                            :max="ui.rotationSliderRange[1]"
                            step="1"
                            :style="{ '--color-thumb': 'var(--color-axis-' + ui.axisLetters[rotationAxis].toLowerCase() + ')' }"
                            :value="getRotationSliderValue()"
                            @mousedown="beginGesture($event)"
                            @touchstart="beginGesture($event)"
                            @input="onRotationSlider($event)"
                            @change="releasePointer"
                        >
                    </div>
                    <div class="ds-grid-5 ds-quick-grid">
                        <button
                            v-for="value in ui.rotationQuickValues"
                            :key="value"
                            type="button"
                            :data-ds-rotation-quick="value"
                            :title="tf('display_sensei.ui.quick_rotation_hint', { axis: ui.axisLetters[rotationAxis], value: value })"
                            @click="setRotationQuickValue(value)"
                        >{{ value }}°</button>
                    </div>
                    <div class="ds-turn-row" data-ds-control="turn_180" :title="t('display_sensei.ui.turn_180_hint')">
                        <span class="ds-row-label">{{ t('display_sensei.ui.turn_180') }}</span>
                        <div class="ds-grid-3 ds-quick-grid">
                            <button
                                v-for="(letter, axis) in ui.axisLetters"
                                :key="letter"
                                type="button"
                                :data-ds-turn="axis"
                                :title="getTurnTitle(axis)"
                                @click="turnSlot(axis)"
                            >{{ letter }}</button>
                        </div>
                    </div>
                    <div class="ds-item-turn" data-ds-control="turn_item">
                        <span class="ds-row-label" :title="tf('display_sensei.ui.turn_item_hint', { amount: ui.itemTurnStep })">{{ tf('display_sensei.ui.turn_item', { amount: ui.itemTurnStep }) }}</span>
                        <div class="ds-nudge-grid">
                            <button
                                v-for="nudge in ui.nudgeButtons"
                                :key="nudge.id"
                                type="button"
                                :data-ds-turn-item="nudge.id"
                                :title="getItemTurnTitle(nudge)"
                                @click="turnItem(nudge)"
                            >{{ getNudgeLabel(nudge) }}</button>
                        </div>
                    </div>
                </fieldset>

                <fieldset v-else class="ds-channel" data-ds-section="scale" :disabled="!isChannelEditable('scale')">
                    <div class="ds-section-head">
                        <div class="ds-section-label">{{ t('display_sensei.ui.scale_label') }}</div>
                        <button
                            type="button"
                            class="ds-reset-button"
                            data-ds-reset="scale"
                            :title="getResetChannelTitle('scale')"
                            @click="resetChannel('scale')"
                        ><i class="material-icons">replay</i><span>{{ t('display_sensei.ui.reset_channel') }}</span></button>
                    </div>
                    <ds-axis-inputs channel="scale" :values="slotState.values.scale" :step="ui.inputSteps.scale" :limits="getInputLimits('scale')" @commit="commitAxis"></ds-axis-inputs>
                    <label class="ds-check-row" :title="t('display_sensei.ui.uniform_scale_hint')">
                        <input type="checkbox" data-ds-control="uniform_scale" :checked="scaleLocked" @change="setScaleLocked($event)">
                        <span>{{ t('display_sensei.ui.uniform_scale') }}</span>
                    </label>
                    <div class="ds-slider-row">
                        <div v-if="!scaleLocked" class="ds-axis-toggle ds-grid-3">
                            <button
                                v-for="(letter, axis) in ui.axisLetters"
                                :key="letter"
                                type="button"
                                class="ds-subtab"
                                :class="{ active: scaleAxis === axis }"
                                :data-ds-scale-axis="axis"
                                :title="tf('display_sensei.ui.slider_axis', { axis: letter })"
                                @click="setScaleAxis(axis)"
                            >{{ letter }}</button>
                        </div>
                        <input
                            type="range"
                            data-ds-slider="scale"
                            :min="ui.slotRanges.scale[0]"
                            :max="ui.slotRanges.scale[1]"
                            :step="ui.scaleSliderStep"
                            :title="getScaleSliderTitle()"
                            :style="scaleLocked ? null : { '--color-thumb': 'var(--color-axis-' + ui.axisLetters[scaleAxis].toLowerCase() + ')' }"
                            :value="slotState.values.scale[scaleLocked ? 0 : scaleAxis]"
                            @mousedown="beginGesture($event)"
                            @touchstart="beginGesture($event)"
                            @input="onScaleSlider($event)"
                            @change="releasePointer"
                        >
                    </div>
                    <div class="ds-grid-3 ds-quick-grid">
                        <button
                            v-for="value in ui.scaleQuickValues"
                            :key="value"
                            type="button"
                            :data-ds-scale-quick="value"
                            :title="getScaleQuickTitle(value)"
                            @click="setUniformScale(value)"
                        >{{ value }}×</button>
                    </div>
                </fieldset>

                <button
                    v-if="!isHoldEditor"
                    type="button"
                    class="ds-collapse"
                    :class="{ open: advancedOpen }"
                    data-ds-action="toggle_advanced"
                    :aria-expanded="advancedOpen ? 'true' : 'false'"
                    @click="toggleAdvanced"
                ><span>{{ t('display_sensei.ui.advanced') }}</span><i class="material-icons">expand_more</i></button>
                <div v-if="advancedOpen && !isHoldEditor" class="ds-channel" data-ds-section="advanced">
                    <template v-for="pivot in ui.pivotChannels">
                        <div :key="pivot.id + '-head'" class="ds-section-head">
                            <div class="ds-section-label"><span class="ds-pivot-key" :data-ds-pivot-key="pivot.id" :style="{ '--ds-pivot-key-color': ui.pivotMarkerColors[pivot.id] }" aria-hidden="true"></span>{{ getTechnicalLabel(pivot.id, pivot.label) }}</div>
                            <button
                                type="button"
                                class="ds-reset-button"
                                :data-ds-reset="pivot.id"
                                :title="getResetChannelTitle(pivot.id)"
                                @click="resetChannel(pivot.id)"
                            ><i class="material-icons">replay</i><span>{{ t('display_sensei.ui.reset_channel') }}</span></button>
                        </div>
                        <ds-axis-inputs :key="pivot.id" :channel="pivot.id" :values="slotState.values[pivot.id]" :step="ui.inputSteps[pivot.id]" @commit="commitAxis"></ds-axis-inputs>
                    </template>
                    <p class="ds-hint" data-ds-note="pivot_markers">{{ pivotMarkersShown ? t('display_sensei.info.pivot_marked') : t('display_sensei.info.pivot_units') }}<ds-tip :text="t('display_sensei.info.pivot_markers_tip')"></ds-tip></p>
                </div>

                <div v-if="otherHand && !isHoldEditor" class="ds-card-actions">
                    <button
                        type="button"
                        data-ds-action="mirror_slot"
                        :title="tf('display_sensei.ui.mirror_slot_hint', { hand: t(otherHand.label) })"
                        @click="mirrorSlot"
                    >{{ tf('display_sensei.ui.mirror_from', { hand: t(otherHand.label) }) }}</button>
                    <button
                        type="button"
                        data-ds-action="same_pose_slot"
                        :title="tf('display_sensei.ui.same_pose_slot_hint', { hand: t(otherHand.label) })"
                        @click="samePoseSlot"
                    >{{ tf('display_sensei.ui.same_pose_from', { hand: t(otherHand.label) }) }}</button>
                </div>
                <div v-else-if="otherHand && showsHoldHandCopy()" class="ds-card-actions">
                    <button
                        type="button"
                        data-ds-action="mirror_slot"
                        :disabled="!slotState.hold.editing"
                        :title="tf('display_sensei.hold.mirror_hint', { hand: t(otherHand.label) })"
                        @click="mirrorSlot"
                    >{{ tf('display_sensei.hold.mirror_from', { hand: t(otherHand.label) }) }}</button>
                    <button
                        type="button"
                        data-ds-action="same_pose_slot"
                        :disabled="!slotState.hold.editing"
                        :title="tf('display_sensei.hold.same_pose_hint', { hand: t(otherHand.label) })"
                        @click="samePoseSlot"
                    >{{ tf('display_sensei.ui.same_pose_from', { hand: t(otherHand.label) }) }}</button>
                </div>

                <div class="ds-section-head">
                    <div class="ds-section-label">{{ t('display_sensei.ui.preset') }}</div>
                    <span v-if="selectedPreset && selectedPreset.note" class="ds-preset-note" data-ds-output="preset_note">
                        <span v-if="selectedPreset.estimate" class="ds-chip" data-ds-chip="estimate">{{ t('display_sensei.ui.preset_estimate') }}</span>
                        <span v-if="selectedPreset.uncalibrated" class="ds-chip" data-ds-chip="uncalibrated">{{ t('display_sensei.ui.preset_uncalibrated') }}</span>
                        <span v-if="selectedPreset.calibrated" class="ds-chip custom" data-ds-chip="calibrated">{{ t('display_sensei.ui.preset_calibrated') }}</span>
                        <ds-tip :text="selectedPreset.note"></ds-tip>
                    </span>
                </div>
                <select class="ds-field" data-ds-control="preset" v-model="presetId" @mousedown="refreshPresetChoices" @focus="refreshPresetChoices">
                    <option value="" disabled>{{ t('display_sensei.ui.preset_choose') }}</option>
                    <optgroup v-for="group in presetGroups" :key="group.id" :label="t(group.label)" :data-ds-preset-group="group.id">
                        <option v-for="choice in group.choices" :key="choice.id" :value="choice.id">{{ choice.label }}</option>
                    </optgroup>
                </select>
                <div class="ds-preset-row">
                    <select data-ds-control="preset_scope" :value="presetScope" @change="setPresetScope($event)">
                        <option v-for="scope in presetScopeChoices" :key="scope.id" :value="scope.id">{{ t(scope.label) }}</option>
                    </select>
                    <button
                        type="button"
                        class="ds-primary"
                        data-ds-action="apply_preset"
                        :disabled="!presetId || (!!selectedPreset && selectedPreset.uncalibrated) || (isHoldEditor && !slotState.hold.editing)"
                        @click="applySelectedPreset"
                    >{{ t('display_sensei.ui.apply_preset') }}</button>
                </div>
                <div v-if="selectedCalibration" class="ds-calibration-actions" data-ds-control="calibration">
                    <button
                        type="button"
                        :data-ds-action="'calibrate_' + selectedCalibration.id"
                        :title="t(selectedCalibration.hint)"
                        @click="calibrateHold(selectedCalibration.id)"
                    >{{ t(selectedCalibration.label) }}</button>
                    <button
                        v-if="selectedPreset.calibrated"
                        type="button"
                        data-ds-action="forget_calibration"
                        :title="tf('display_sensei.ui.forget_calibration_hint', { hold: getCalibrationName(selectedPreset.calibration) })"
                        @click="forgetHold(selectedPreset.calibration)"
                    >{{ tf('display_sensei.ui.forget_calibration', { hold: getCalibrationName(selectedPreset.calibration) }) }}</button>
                </div>
                <div v-if="viewState.shown" class="ds-slot-actions">
                    <button type="button" data-ds-action="copy_slot" :title="t('display_sensei.ui.copy_slot_hint')" @click="copySlot">{{ t('display_sensei.ui.copy_slot') }}</button>
                    <button type="button" data-ds-action="paste_slot" :title="t('display_sensei.ui.paste_slot_hint')" @click="pasteSlot">{{ t('display_sensei.ui.paste_slot') }}</button>
                    <button type="button" data-ds-action="save_preset" :title="t('display_sensei.ui.save_preset_hint')" @click="savePreset">{{ t('display_sensei.ui.save_preset') }}</button>
                </div>
                <div v-if="isHoldEditor" class="ds-slot-actions ds-grid-2">
                    <button type="button" data-ds-action="copy_slot" :title="t('display_sensei.hold.copy_hint')" @click="copySlot">{{ t('display_sensei.ui.copy_slot') }}</button>
                    <button type="button" data-ds-action="paste_slot" :disabled="!slotState.hold.editing" :title="t('display_sensei.hold.paste_hint')" @click="pasteSlot">{{ t('display_sensei.ui.paste_slot') }}</button>
                </div>
                <p v-for="note in getLinkNotes(linkHandNotes)" :key="note.id" class="ds-card-note" :data-ds-note="'link_' + note.id">{{ note.text }}<ds-tip v-if="note.tip" :text="note.tip"></ds-tip></p>
            </div>

            <div v-else-if="cardKind === 'edit'" class="ds-transform-box" data-ds-card="edit" :data-ds-slot="activeSlot ? activeSlot.id : null">
                <h5>{{ getCardTitle() }}</h5>
                <div class="ds-card-key"><span class="ds-code">{{ cardTarget.key }}</span> {{ getCardTargetName() }}</div>
                <p class="ds-card-text">{{ t('display_sensei.hold.note_no_bone') }}<ds-tip :text="getEditCardTip()"></ds-tip></p>
                <p v-for="note in getLinkNotes(linkHandNotes)" :key="note.id" class="ds-card-note" :data-ds-note="'link_' + note.id">{{ note.text }}<ds-tip v-if="note.tip" :text="note.tip"></ds-tip></p>
            </div>

            <div
                v-if="infoCard"
                class="ds-info-card"
                :data-ds-card="cardKind"
                :data-ds-slot="activeSlot ? activeSlot.id : null"
                :data-ds-wear-slot="activeWearSlot ? activeWearSlot.id : null"
            >
                <h5 :title="activeWearSlot && cardKind !== 'mob' ? t(activeWearSlot.info) : null">{{ t(infoCard.title) }}</h5>
                <div v-if="activeWearSlot" class="ds-card-key" data-ds-wear-key><span class="ds-code" :title="t('display_sensei.armor.wearable_slot_name')">{{ activeWearSlot.wearableSlot }}</span></div>
                <p>{{ t(getInfoCardText()) }}<ds-tip :text="t(getInfoCardTip())"></ds-tip></p>
                <p v-for="note in getLinkNotes(cardKind === 'held_worn' ? linkHandNotes : linkArmorNotes)" :key="note.id" class="ds-card-note" :data-ds-note="'link_' + note.id">{{ note.text }}<ds-tip v-if="note.tip" :text="note.tip"></ds-tip></p>
                <div v-if="cardKind === 'held_worn' && holdWearSlot" class="ds-info-actions">
                    <button
                        type="button"
                        class="ds-icon-button"
                        data-ds-action="go_worn_armor"
                        :data-ds-go-slot="holdWearSlot"
                        :title="tf('display_sensei.hold.go_armor_hint', { slot: holdWearSlot })"
                        @click="openArmorSubtab(holdWearSlot)"
                    ><span>{{ tf('display_sensei.hold.go_armor', { tab: getWearSlotLabel(holdWearSlot) }) }}</span></button>
                </div>
                <div v-if="cardKind === 'offhand_pointer'" class="ds-info-actions">
                    <button
                        type="button"
                        class="ds-icon-button"
                        data-ds-action="go_left_hand"
                        :title="t('display_sensei.ui.go_left_hand_hint')"
                        @click="goToLeftHand"
                    ><span>{{ t('display_sensei.ui.go_left_hand') }}</span></button>
                </div>
                <div v-if="cardKind === 'worn_pointer'" class="ds-info-actions">
                    <button
                        type="button"
                        class="ds-icon-button"
                        data-ds-action="go_armor_head"
                        :title="t('display_sensei.ui.go_armor_head_hint')"
                        @click="openArmorSubtab('slot.armor.head')"
                    ><span>{{ t('display_sensei.ui.go_armor_head') }}</span></button>
                </div>
            </div>

            <div
                v-if="cardKind === 'armor' && armor && armor.slotId === activeSubtabId"
                class="ds-transform-box ds-armor-card"
                data-ds-card="armor"
                :data-ds-wear-slot="armor.slotId"
            >
                <h5 :title="t(activeSubtab.info)">{{ getCardTitle() }}</h5>
                <div class="ds-card-key" data-ds-wear-key><span class="ds-code" :title="t('display_sensei.armor.wearable_slot_name')">{{ activeWearSlot.wearableSlot }}</span></div>

                <template v-if="armorWornSlot">
                    <p
                        class="ds-card-text"
                        data-ds-note="armor_other_slot"
                        data-ds-armor-detected
                        :data-ds-wear-kind="wearInfo ? wearInfo.kind : 'unknown'"
                    >{{ tf('display_sensei.armor.other_slot', { tab: t(armorWornSlot.label) }) }}<ds-tip :text="getWornSlotTip()"></ds-tip></p>
                    <div class="ds-info-actions">
                        <button
                            type="button"
                            class="ds-icon-button"
                            data-ds-action="go_worn_slot"
                            :data-ds-go-slot="armorWornSlot.id"
                            :title="tf('display_sensei.armor.go_worn_slot_hint', { tab: t(armorWornSlot.label), slot: armorWornSlot.wearableSlot })"
                            @click="openArmorSubtab(armorWornSlot.id)"
                        ><span>{{ tf('display_sensei.armor.go_worn_slot', { tab: t(armorWornSlot.label) }) }}</span></button>
                    </div>
                </template>
                <p
                    v-else
                    class="ds-card-text"
                    data-ds-armor-detected
                    :data-ds-wear-kind="wearInfo ? wearInfo.kind : 'unknown'"
                >{{ getWearInfoText() }}<ds-tip :text="getWearInfoTip()"></ds-tip></p>
                <div class="ds-flex-row ds-armor-kind" :title="t('display_sensei.armor.kind_hint')">
                    <span class="ds-row-label">{{ t('display_sensei.armor.kind') }}</span>
                    <select data-ds-control="armor_kind" :value="getWearKindChoice()" @change="setWearKindFrom($event)">
                        <option v-for="choice in ui.wearKinds" :key="choice.id" :value="choice.id">{{ t(choice.label) }}</option>
                    </select>
                </div>

                <div class="ds-view ds-armor-view" data-ds-armor-view>
                    <div class="ds-view-head">
                        <span class="ds-section-label ds-armor-view-label">{{ t('display_sensei.armor.wearer_section') }}</span>
                        <span class="ds-chip" data-ds-chip="armor_preview_only" :title="t('display_sensei.armor.preview_only_hint')">{{ t('display_sensei.ui.preview_only') }}</span>
                    </div>
                    <div class="ds-flex-row" :title="t('display_sensei.armor.wearer_hint')">
                        <span class="ds-row-label">{{ t('display_sensei.armor.wearer') }}</span>
                        <select data-ds-control="armor_wearer" :value="armor.wearer" @change="setWearerFrom($event)">
                            <option v-for="choice in armor.wearers" :key="choice.id" :value="choice.id">{{ t(choice.label) }}</option>
                        </select>
                        <ds-tip v-if="isWearerShaded()" data-ds-note="armor_wearer_shaded" :text="t('display_sensei.armor.wearer_shaded')"></ds-tip>
                    </div>
                    <label v-for="toggle in ui.armorOverlayToggles" :key="toggle.id" class="ds-check-row" :title="t(toggle.hint)">
                        <input type="checkbox" :data-ds-control="'armor_overlay_' + toggle.id" :checked="armorOverlay[toggle.id]" @change="setOverlayToggle(toggle.id, $event)">
                        <span>{{ t(toggle.label) }}</span>
                    </label>
                    <div class="ds-flex-row" :title="t('display_sensei.armor.other_slots_hint')">
                        <span class="ds-row-label">{{ t('display_sensei.armor.other_slots') }}</span>
                        <select data-ds-control="armor_overlay_otherSlots" :value="armorOverlay.otherSlots" @change="setOtherSlotsFrom($event)">
                            <option v-for="choice in ui.armorOtherSlots" :key="choice.id" :value="choice.id">{{ t(choice.label) }}</option>
                        </select>
                    </div>
                    <div class="ds-flex-row" :title="t('display_sensei.armor.flat_texture_hint')">
                        <span class="ds-row-label">{{ t('display_sensei.armor.flat_texture') }}</span>
                        <select
                            data-ds-control="armor_overlay_flatTexture"
                            :value="armor.flatTexture || ''"
                            :disabled="armorOverlay.otherSlots !== 'flat'"
                            @change="setFlatTextureFrom($event)"
                        >
                            <option value="">{{ t('display_sensei.armor.flat_texture_none') }}</option>
                            <option v-for="texture in armor.textures" :key="texture.uuid" :value="texture.uuid">{{ texture.name }}</option>
                        </select>
                    </div>

                    <div class="ds-section-label ds-armor-view-label">{{ t('display_sensei.armor.camera') }}</div>
                    <div class="ds-grid-4">
                        <button
                            v-for="view in ui.armorCameraViews"
                            :key="view.id"
                            type="button"
                            class="ds-subtab"
                            :class="{ active: armor.camera === view.id }"
                            data-ds-action="armor_camera"
                            :data-ds-view="view.id"
                            :title="t(view.hint)"
                            @click="showArmorCamera(view.id)"
                        >{{ t(view.label) }}</button>
                    </div>
                    <button
                        type="button"
                        class="ds-icon-button ds-armor-wide-button"
                        data-ds-action="armor_camera_restore"
                        :title="t('display_sensei.armor.camera_restore_hint')"
                        @click="restoreCamera"
                    ><i class="material-icons">center_focus_strong</i><span>{{ t('display_sensei.armor.camera_restore') }}</span></button>

                    <div class="ds-section-label ds-armor-view-label">{{ t('display_sensei.armor.pose_test') }}<ds-tip v-if="getChosenPoseNote()" data-ds-note="armor_chosen_poses" :text="getChosenPoseNote()"></ds-tip></div>
                    <div v-if="armor.poses.length" class="ds-armor-poses">
                        <button
                            v-for="pose in armor.poses"
                            :key="pose.id"
                            type="button"
                            class="ds-subtab"
                            :class="{ active: armor.activePose === pose.id }"
                            data-ds-action="armor_pose"
                            :data-ds-pose="pose.id"
                            :aria-pressed="armor.activePose === pose.id ? 'true' : 'false'"
                            :title="t('display_sensei.armor.pose_hint')"
                            @click="togglePose(pose.id)"
                        >{{ t(pose.label) }}</button>
                    </div>
                    <p v-else class="ds-view-note" data-ds-note="armor_no_poses">{{ t('display_sensei.armor.no_poses') }}</p>
                </div>

                <template v-if="!armorWornSlot">
                    <div class="ds-armor-section" data-ds-armor-checks>
                        <div class="ds-section-label">{{ tf('display_sensei.armor.checks_label', { wearer: getWearerName() }) }}</div>
                        <div v-if="!armor.checks.length" class="ds-empty-note" data-ds-armor-checks-empty>{{ t('display_sensei.armor.checks_empty') }}</div>
                        <div
                            v-for="(check, index) in armor.checks"
                            :key="index + '|' + check.id"
                            class="ds-armor-check"
                            :class="'ds-severity-' + check.severity"
                            :data-ds-armor-check="check.id"
                            :data-ds-severity="check.severity"
                        >
                            <div class="ds-armor-check-head">
                                <span class="ds-chip" :class="'ds-chip-' + check.severity" data-ds-chip="severity">{{ getSeverityLabel(check.severity) }}</span>
                                <span v-if="check.approximate" class="ds-chip" data-ds-chip="armor_estimate" :title="t('display_sensei.armor.estimate_hint')">{{ t('display_sensei.armor.estimate') }}</span>
                            </div>
                            <p class="ds-armor-check-text">{{ tf(check.textKey, check.values) }}<ds-tip v-if="getCheckTip(check)" :text="getCheckTip(check)"></ds-tip></p>
                            <div v-if="check.fixes && check.fixes.length" class="ds-armor-fixes">
                                <button
                                    v-for="fixId in check.fixes"
                                    :key="fixId"
                                    type="button"
                                    data-ds-action="armor_fix"
                                    :data-ds-fix="fixId"
                                    :title="getFixHint(fixId)"
                                    @click="applyFix(check, fixId)"
                                >{{ getFixLabel(fixId) }}</button>
                            </div>
                        </div>
                    </div>

                    <div class="ds-armor-section ds-armor-fit" data-ds-armor-fit>
                        <div class="ds-section-label">{{ t('display_sensei.armor.fit_label') }}<ds-tip :text="t('display_sensei.armor.fit_intro')"></ds-tip></div>
                        <label class="ds-check-row" :title="t('display_sensei.armor.fit_preview_hint')">
                            <input type="checkbox" data-ds-control="armor_fit_preview" :checked="armor.fitPreview" @change="setFitPreviewFrom($event)">
                            <span>{{ t('display_sensei.armor.fit_preview') }}</span>
                        </label>
                        <div v-if="!armor.fitRows.length" class="ds-empty-note" data-ds-armor-fit-empty>{{ tf('display_sensei.armor.fit_empty', { bones: activeWearSlot.bones.join(', ') }) }}</div>
                        <template v-else>
                            <div class="ds-grid-3 ds-channel-tabs">
                                <button
                                    v-for="channel in ui.fitChannels"
                                    :key="channel.id"
                                    type="button"
                                    class="ds-subtab"
                                    :class="{ active: armorFitChannel === channel.id }"
                                    :data-ds-armor-fit-channel="channel.id"
                                    @click="setArmorFitChannel(channel.id)"
                                >{{ t(channel.label) }}</button>
                            </div>
                            <div v-for="row in armor.fitRows" :key="row.name" class="ds-armor-fit-bone" :data-ds-armor-fit-bone="row.name">
                                <div class="ds-armor-fit-name"><span class="ds-code">{{ row.name }}</span> {{ getFitTargetName(row) }}</div>
                                <ds-axis-inputs
                                    :channel="armorFitChannel"
                                    :values="row.values[armorFitChannel]"
                                    :step="ui.fitSteps[armorFitChannel]"
                                    :limits="ui.fitRanges[armorFitChannel]"
                                    @commit="commitFitOffset(row.name, arguments[0], arguments[1], arguments[2])"
                                ></ds-axis-inputs>
                            </div>
                        </template>
                        <div class="ds-armor-fit-actions">
                            <button
                                type="button"
                                data-ds-action="armor_fit_reset"
                                :disabled="!armor.hasFitOffsets"
                                :title="t('display_sensei.armor.fit_reset_hint')"
                                @click="resetFit"
                            >{{ t('display_sensei.armor.fit_reset') }}</button>
                            <button
                                type="button"
                                class="ds-primary"
                                data-ds-action="armor_bake"
                                :disabled="!armor.hasFitOffsets"
                                :title="t('display_sensei.armor.bake_hint')"
                                @click="bakeFit"
                            >{{ t('display_sensei.armor.bake') }}</button>
                        </div>
                    </div>

                    <p v-for="note in getLinkNotes(linkArmorNotes)" :key="note.id" class="ds-card-note" :data-ds-note="'link_' + note.id">{{ note.text }}<ds-tip v-if="note.tip" :text="note.tip"></ds-tip></p>

                    <button
                        type="button"
                        class="ds-collapse ds-armor-facts-toggle"
                        :class="{ open: armorFactsOpen }"
                        data-ds-action="toggle_armor_facts"
                        :aria-expanded="armorFactsOpen ? 'true' : 'false'"
                        @click="toggleArmorFacts"
                    ><span>{{ t('display_sensei.armor.facts') }}</span><i class="material-icons">expand_more</i></button>
                    <div v-if="armorFactsOpen" class="ds-armor-facts" data-ds-armor-facts>
                        <p v-for="fact in ui.armorFacts" :key="fact.id" class="ds-armor-fact" :data-ds-armor-fact="fact.id">{{ t(fact.text) }}<ds-tip v-if="fact.tip" :text="t(fact.tip)"></ds-tip></p>
                        <p v-for="entry in ui.armorVersionFacts" :key="entry.version" class="ds-armor-fact" :data-ds-armor-version="entry.version">
                            <span class="ds-chip">{{ entry.version }}</span> {{ t(entry.text) }}<ds-tip v-if="entry.tip" :text="t(entry.tip)"></ds-tip>
                        </p>
                    </div>
                </template>
            </div>

            <div
                v-if="activeTab === 'output'"
                class="ds-info-card ds-link-card"
                data-ds-card="pack_link"
                :data-ds-link-status="link ? link.status : 'pending'"
            >
                <h5>{{ t('display_sensei.link.title') }}<ds-tip :text="t('display_sensei.link.intro')"></ds-tip></h5>
                <div v-if="!link" class="ds-empty-note" data-ds-link-empty="pending">{{ t('display_sensei.link.pending') }}</div>
                <div v-else-if="link.status !== 'linked'" class="ds-empty-note" :data-ds-link-empty="link.status">{{ getLinkEmptyText() }}<ds-tip v-if="getLinkEmptyTip()" :text="getLinkEmptyTip()"></ds-tip></div>
                <template v-else>
                    <div class="ds-link-packs">
                        <p class="ds-link-line" data-ds-link="rp" :title="link.rp.path">{{ tf('display_sensei.link.rp', { name: link.rp.name }) }}</p>
                        <p class="ds-link-line" data-ds-link="bp" :data-ds-bp-status="link.bp.status" :title="link.bp.path || null">{{ getBehaviorPackText() }}<ds-tip v-if="link.bp.status === 'ambiguous'" :text="t('display_sensei.link.bp_ambiguous_tip')"></ds-tip></p>
                        <p class="ds-link-line" data-ds-link="stamps">{{ getStampText() }}<ds-tip v-if="link.stamps.length" data-ds-link="stamps_hint" :text="t('display_sensei.link.stamps_hint')"></ds-tip></p>
                    </div>
                    <p v-for="note in getLinkNotes(link.notes)" :key="note.id" class="ds-card-note" :data-ds-note="'link_' + note.id">{{ note.text }}<ds-tip v-if="note.tip" :text="note.tip"></ds-tip></p>
                    <div v-for="group in getLinkFileGroups()" :key="group.id" class="ds-link-files" :data-ds-link-group="group.id">
                        <div class="ds-section-label">{{ t(group.label) }}</div>
                        <div
                            v-for="(row, index) in group.rows"
                            :key="index + '|' + row.path + '|' + (row.id || '')"
                            class="ds-link-file"
                            :class="{ 'ds-link-absent': row.exists !== true }"
                            :data-ds-link-file="row.path"
                            :data-ds-pack="row.pack"
                            :data-ds-kind="row.kind"
                            :data-ds-exists="String(row.exists)"
                            :data-ds-maybe-game="String(row.maybe_game)"
                            :data-ds-rewritten="String(row.rewritten)"
                            :data-ds-role="row.role"
                        >
                            <div class="ds-link-file-head">
                                <span class="ds-chip" data-ds-chip="file_kind" :title="getLinkKindHint(row)">{{ getLinkKindLabel(row) }}</span>
                                <span class="ds-code"><template v-for="(part, partIndex) in getPathParts(row.path)"><wbr v-if="partIndex > 0">{{ part }}</template></span>
                            </div>
                            <div class="ds-link-file-detail">
                                <p class="ds-hint">{{ getLinkFileDetail(row) }}</p>
                                <span v-if="row.exists === false" class="ds-chip" data-ds-chip="not_found">{{ t('display_sensei.link.not_found') }}</span>
                                <span v-if="row.rewritten" class="ds-chip custom" data-ds-chip="rewritten" :title="getRewrittenHint()">{{ t('display_sensei.link.rewritten') }}</span>
                            </div>
                        </div>
                    </div>
                    <p v-if="link.dates === 'unavailable'" class="ds-hint" data-ds-link="dates">{{ t('display_sensei.link.dates_unavailable') }}</p>
                    <p v-if="link.dates === 'shown' && link.bp.status === 'found' && !link.bp_dates" class="ds-hint" data-ds-link="dates_rp_only">{{ t('display_sensei.link.dates_rp_only') }}</p>
                </template>
                <div v-if="showLinkActions()" class="ds-link-actions">
                    <button type="button" data-ds-action="link_refresh" :title="t('display_sensei.link.refresh_hint')" @click="refreshLink">{{ t('display_sensei.link.refresh') }}</button>
                    <button v-if="canShowFileDates()" type="button" data-ds-action="link_dates" :title="t('display_sensei.link.dates_hint')" @click="showFileDates">{{ t('display_sensei.link.dates') }}</button>
                    <button v-if="link && link.status === 'linked'" type="button" data-ds-action="link_open_folder" :title="t('display_sensei.link.open_rp_hint')" @click="openLinkedFolder('rp')">{{ t('display_sensei.link.open_rp') }}</button>
                    <button v-if="link && link.status === 'linked' && link.bp.status === 'found'" type="button" data-ds-action="link_open_bp_folder" :title="t('display_sensei.link.open_bp_hint')" @click="openLinkedFolder('bp')">{{ t('display_sensei.link.open_bp') }}</button>
                </div>
            </div>

            <div v-if="activeTab === 'output' && output" class="ds-section" data-ds-card="output">
                <div class="ds-section-label">{{ getTechnicalLabel('format_version', 'display_sensei.ui.geometry_version') }}<ds-tip v-if="getSelectedVersionHint()" :text="getSelectedVersionHint()"></ds-tip></div>
                <select data-ds-control="geometry_version" :value="output.selected" @change="setVersion($event)">
                    <option v-for="choice in output.choices" :key="choice.version" :value="choice.version" :title="choice.hint">{{ choice.label }}</option>
                </select>
                <p v-if="output.text" class="ds-output-version" data-ds-output="effective_version">{{ tf('display_sensei.ui.effective_version', { version: output.effective }) }}</p>
                <p v-if="output.raised" class="ds-card-note" data-ds-note="version_raised">{{ tf('display_sensei.ui.version_raised', { selected: output.selected, version: output.effective }) }}</p>

                <div class="ds-section-label ds-output-label">{{ t(currentRoute.output) }}<ds-tip v-if="output.text" :text="t('display_sensei.ui.output_block_hint')"></ds-tip></div>
                <textarea v-if="output.text" class="ds-output-code" data-ds-output="json" rows="12" readonly spellcheck="false" :value="output.text"></textarea>
                <div v-else class="ds-empty-note" data-ds-output="empty">{{ t('display_sensei.ui.output_empty') }}<ds-tip :text="t('display_sensei.ui.output_empty_tip')"></ds-tip></div>
                <div class="ds-grid-2 ds-output-actions">
                    <button type="button" class="ds-primary" data-ds-action="copy_output" :disabled="!output.text" @click="copyOutput">{{ t('display_sensei.ui.copy') }}</button>
                    <button type="button" data-ds-action="export_output" :title="t('display_sensei.ui.export_geometry_hint')" @click="exportGeometry">{{ t('display_sensei.ui.export_geometry') }}</button>
                </div>
            </div>

            <div v-else-if="activeTab === 'output' && route === 'entity'" class="ds-section" data-ds-card="output">
                <div class="ds-section-label">{{ t(currentRoute.output) }}</div>
                <p class="ds-hint">{{ t('display_sensei.info.output_entity') }}</p>
            </div>

            <div
                v-else-if="activeTab === 'output'"
                class="ds-section ds-hold-write"
                data-ds-card="output"
                data-ds-hold-write
                :data-ds-hold-pending="holdWrite ? String(holdWrite.pending) : null"
            >
                <div class="ds-section-label">{{ t('display_sensei.hold_write.title') }}<ds-tip :text="t('display_sensei.hold_write.title_tip')"></ds-tip></div>
                <template v-if="holdWrite">
                    <p
                        v-for="file in holdWrite.files"
                        :key="file.path"
                        class="ds-hint ds-hold-file"
                        :data-ds-hold-file="file.path"
                        :data-ds-hold-file-state="getHoldFileState(file)"
                        :title="file.path"
                    ><span class="ds-code">{{ file.name }}</span> {{ getHoldFileStateText(file) }}</p>
                    <p v-if="holdWrite.target" class="ds-card-note" data-ds-note="hold_target" :title="holdWrite.target">{{ tf('display_sensei.hold_write.target', { file: getFileName(holdWrite.target) }) }}<ds-tip :text="t('display_sensei.hold_write.target_tip')"></ds-tip></p>
                    <button
                        v-if="holdWrite.target"
                        type="button"
                        class="ds-wide-button"
                        data-ds-action="hold_clear_target"
                        :title="t('display_sensei.hold_write.clear_target_hint')"
                        @click="clearTarget"
                    >{{ t('display_sensei.hold_write.clear_target') }}</button>
                    <p v-if="holdFileChanged()" class="ds-card-note" data-ds-note="hold_file_changed">{{ t('display_sensei.hold_write.changed') }}<ds-tip :text="t('display_sensei.hold_write.changed_tip')"></ds-tip></p>
                    <p v-if="!holdWrite.files.length" class="ds-empty-note" data-ds-note="hold_no_file">{{ t('display_sensei.hold_write.no_file') }}<ds-tip :text="t('display_sensei.hold_write.no_file_tip')"></ds-tip></p>
                    <p v-if="holdWrite.skipped.length" class="ds-card-note" data-ds-note="hold_skipped">{{ t('display_sensei.hold_write.skipped') }}<ds-tip :text="t('display_sensei.hold_write.skipped_tip')"></ds-tip></p>
                    <div class="ds-grid-2 ds-output-actions">
                        <button
                            type="button"
                            class="ds-primary"
                            data-ds-action="hold_write"
                            :disabled="!canWriteHolds()"
                            :title="t('display_sensei.hold_write.write_hint')"
                            @click="writeHolds"
                        >{{ t('display_sensei.hold_write.write') }}</button>
                        <button
                            type="button"
                            data-ds-action="hold_restore"
                            :disabled="!getHoldBackupFile() || holdBusy"
                            :title="t('display_sensei.hold_write.restore_hint')"
                            @click="restoreHolds"
                        >{{ t('display_sensei.hold_write.restore') }}</button>
                    </div>
                </template>
                <div class="ds-section-label ds-output-label">{{ t('display_sensei.hold_write.json_label') }}<ds-tip :text="t('display_sensei.hold_write.json_tip')"></ds-tip></div>
                <textarea v-if="holdJson" class="ds-output-code" data-ds-output="hold_json" rows="10" readonly spellcheck="false" :value="holdJson"></textarea>
                <div v-else class="ds-empty-note" data-ds-output="hold_empty">{{ t('display_sensei.hold_write.empty') }}</div>
                <div class="ds-grid-2 ds-output-actions">
                    <button type="button" class="ds-primary" data-ds-action="copy_output" :disabled="!holdJson" @click="copyHoldJson">{{ t('display_sensei.ui.copy') }}</button>
                    <button type="button" data-ds-action="export_output" :disabled="!holdJson" :title="t('display_sensei.hold_write.export_hint')" @click="exportHoldJson">{{ t('display_sensei.ui.export') }}</button>
                </div>
                <button
                    v-if="holdAttachableLines"
                    type="button"
                    class="ds-wide-button"
                    data-ds-action="hold_copy_attachable"
                    :title="t('display_sensei.hold_write.attachable_lines_hint')"
                    @click="copyAttachableLines"
                >{{ t('display_sensei.hold_write.attachable_lines') }}</button>
            </div>
        </template>
    </div>

    <div class="ds-footer">
        <div v-if="!isMobile" class="ds-grid-2">
            <button v-if="panelMode !== 'floating'" type="button" data-ds-action="float_panel" @click="movePanelToFloat">{{ t('display_sensei.ui.float_panel') }}</button>
            <button v-if="panelMode !== 'docked'" type="button" data-ds-action="dock_panel" @click="movePanelToDock">{{ t('display_sensei.ui.dock_panel') }}</button>
            <button v-if="panelMode !== 'tabbed'" type="button" data-ds-action="tab_panel" @click="movePanelToTab">{{ t('display_sensei.ui.tab_panel') }}</button>
        </div>
        <button type="button" data-ds-action="close_panel" @click="closePanel">{{ t('display_sensei.ui.close_panel') }}</button>
    </div>
</div>
`;

// =========================
// Panel component
// =========================
function buildPanelComponent() {
    let savedState = loadUiState();
    setBackCameraStyle(savedState.backCamera);
    setWearer(savedState.armorWearer);
    setOverlayOptions({
        show: false,
        outerLayer: savedState.armorOverlay.outerLayer,
        otherSlots: savedState.armorOverlay.otherSlots,
        xray: savedState.armorOverlay.xray
    });
    return {
        name: 'display-sensei-panel',
        template: PANEL_TEMPLATE,
        components: {
            'ds-axis-inputs': buildAxisInputsComponent(),
            'ds-tip': buildTipComponent()
        },
        data() {
            return {
                activeTab: savedState.tab,
                activeSubtabs: savedState.subtabs,
                hand: savedState.hand,
                route: getRoute(),
                formatId: getFormatId(),
                panelMode: 'docked',
                isMobile: Blockbench.isMobile,
                slotState: null,
                viewState: {
                    shown: false, references: null, reference: null, poseAngle: null, previewAnimation: null,
                    options: [], fitPreview: null, skin: false
                },
                output: null,
                link: null,
                linkHandNotes: [],
                linkArmorNotes: [],
                wearInfo: null,
                armor: null,
                armorWearer: getWearer(),
                armorOverlay: savedState.armorOverlay,
                armorFitChannel: savedState.armorFitChannel,
                armorFactsOpen: savedState.armorFactsOpen,
                entityKeepsTransforms: false,
                presetChoices: [],
                presetId: '',
                presetScope: savedState.presetScope,
                backCamera: savedState.backCamera,
                activeChannel: savedState.channel,
                moveStep: savedState.moveStep,
                translationAxis: savedState.translationAxis,
                rotationAxis: savedState.rotationAxis,
                scaleAxis: savedState.scaleAxis,
                scaleLocked: savedState.scaleLocked,
                advancedOpen: savedState.advancedOpen,
                pivotMarkersShown: false,
                viewOpen: savedState.viewOpen,
                handViews: null,
                handViewsOpen: savedState.handViewsOpen,
                holdWearSlot: null,
                holdOverview: null,
                holdView: getHeldPreviewState(),
                holdWrite: null,
                holdJson: '',
                holdAttachableLines: '',
                holdPresetChoices: [],
                holdBusy: false
            };
        },
        created() {
            this.gesture = null;
            this.nudgeDelayTimer = null;
            this.nudgeRepeatTimer = null;
            this.followedContextKey = '';
            this.showingOwnContext = false;
            this.handViewsKey = '';
            this.handViewTimer = null;
            this.armorCardShown = false;
            this.overlayProjectKey = '';
            this.onWindowPointerUp = () => this.releasePointer();
            this.onWindowKeyDown = event => {
                if (event.key === 'Escape' && this.cancelGesture()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            };
            this.syncCard();
        },
        beforeDestroy() {
            this.releasePointer();
            clearTimeout(this.handViewTimer);
            this.handViewTimer = null;
            this.endArmorPreview();
            hideHoldView();
            setPivotMarkersShown(false);
        },
        watch: {
            cardSlotId() {
                this.syncSlotState();
                this.syncPivotMarkers();
            },
            holdSlotId() {
                this.syncSlotState();
                this.syncHoldView();
            }
        },
        computed: {
            ui() {
                return PANEL_CONSTANTS;
            },
            currentRoute() {
                return ROUTES.find(entry => entry.id === this.route) || null;
            },
            currentSubtabs() {
                let tab = findMainTab(this.activeTab);
                return tab ? tab.subtabs : [];
            },
            activeSubtabId() {
                return this.activeSubtabs[this.activeTab] || '';
            },
            activeSubtab() {
                return this.currentSubtabs.find(subtab => subtab.id === this.activeSubtabId) || null;
            },
            activeHand() {
                return findHand(this.hand);
            },
            activeSlot() {
                return findSlotForContext(this.activeSubtabId, this.hand);
            },
            activeWearSlot() {
                return findWearSlot(this.activeSubtabId) || null;
            },
            cardKind() {
                if (this.activeWearSlot) return this.activeWearSlot.support[this.route] || '';
                if (!this.activeSlot) return '';
                let kind = this.activeSlot.support[this.route] || '';
                if (kind === 'edit' && this.route === 'attachable' && this.holdWearSlot) return 'held_worn';
                return kind;
            },
            infoCard() {
                return INFO_CARDS[this.cardKind] || null;
            },
            cardNote() {
                if (this.activeSubtabId === 'third_front') return SHARED_THIRD_PERSON_NOTE;
                return (this.activeSlot && BEDROCK_DIFFERENCE_NOTES[this.activeSlot.id]) || null;
            },
            armorWornSlot() {
                let wear = this.wearInfo;
                let slot = wear && wear.slot ? findWearSlot(wear.slot) : null;
                return slot && this.armor && slot.id !== this.armor.slotId ? slot : null;
            },
            cardTarget() {
                let slot = this.activeSlot;
                if (!slot) {
                    let wear = this.activeWearSlot;
                    return wear ? { key: wear.wearableSlot, label: wear.label } : null;
                }
                if (this.route === 'attachable') {
                    return { key: slot.attachableKey, label: slot.attachableLabel };
                }
                return { key: slot.bedrockKey, label: slot.label };
            },
            cardSlotId() {
                if (this.route !== 'block' || this.cardKind !== 'edit' || !this.activeSlot) return '';
                return this.activeSlot.id;
            },
            armorSlotId() {
                return this.cardKind === 'armor' ? this.activeSubtabId : '';
            },
            showBlockEditor() {
                return !!this.cardSlotId && !!this.slotState && this.slotState.id === this.cardSlotId;
            },
            holdSlotId() {
                if (this.route !== 'attachable' || this.cardKind !== 'edit' || !this.activeSlot || !findHoldSlot(this.activeSlot.id)) return '';
                return this.activeSlot.id;
            },
            showHoldEditor() {
                return !!this.holdSlotId && !!this.slotState && this.slotState.id === this.holdSlotId && !!this.slotState.hold;
            },
            isHoldEditor() {
                return this.showHoldEditor;
            },
            showEditor() {
                return this.showBlockEditor || this.showHoldEditor;
            },
            isViewShown() {
                return this.isHoldEditor ? this.holdView.shown : this.viewState.shown;
            },
            holdChecks() {
                return this.isHoldEditor && this.holdOverview ? this.holdOverview.checks : [];
            },
            currentPresetChoices() {
                return this.route === 'attachable' ? this.holdPresetChoices : this.presetChoices;
            },
            presetScopeChoices() {
                return this.route === 'attachable' ? HOLD_PRESET_SCOPES : PRESET_SCOPES;
            },
            otherHand() {
                let slot = this.activeSlot;
                if (!slot || !slot.hand) return null;
                return HANDS.find(hand => hand.id !== slot.hand) || null;
            },
            presetGroups() {
                if (this.route === 'attachable') {
                    return HOLD_PRESET_GROUPS
                        .map(group => ({ id: group.id, label: group.label, choices: this.holdPresetChoices.filter(choice => choice.group === group.id) }))
                        .filter(group => group.choices.length);
                }
                let groups = PRESET_GROUPS.map(group => ({
                    id: group.id,
                    label: group.label,
                    choices: this.presetChoices.filter(choice => !choice.saved && choice.group === group.id)
                }));
                groups.push(Object.assign({}, SAVED_PRESET_GROUP, { choices: this.presetChoices.filter(choice => choice.saved) }));
                return groups.filter(group => group.choices.length);
            },
            selectedPreset() {
                return this.currentPresetChoices.find(choice => choice.id === this.presetId) || null;
            },
            selectedCalibration() {
                let preset = this.selectedPreset;
                return (preset && CALIBRATION_ACTIONS.find(action => action.id === preset.calibration)) || null;
            }
        },
        methods: {
            t(key) {
                return i18n(key);
            },
            tf(key, values) {
                return i18nFormat(key, values);
            },
            getTechnicalLabel(key, labelKey) {
                return this.tf('display_sensei.ui.technical_label', { key, label: this.t(labelKey) });
            },
            getCardTitle() {
                let contextLabel = this.t(this.activeSubtab.label);
                if (this.activeTab !== 'hand') {
                    return contextLabel;
                }
                return this.tf('display_sensei.ui.card_title_hand', {
                    context: contextLabel,
                    hand: this.t(this.activeHand.label)
                });
            },
            getCardTargetName() {
                let name = this.t(this.cardTarget.label);
                if (name.toLowerCase() === this.cardTarget.key.toLowerCase()) {
                    return '';
                }
                return this.tf('display_sensei.ui.card_target_name', { name });
            },
            getNudgeLabel(nudge) {
                return `${AXIS_LETTERS[nudge.axis]} ${nudge.sign < 0 ? '−' : '+'}`;
            },
            getNudgeTitle(nudge) {
                return this.tf('display_sensei.ui.nudge_hint', {
                    axis: AXIS_LETTERS[nudge.axis],
                    amount: (nudge.sign < 0 ? '−' : '+') + this.moveStep
                });
            },
            getRotationSliderValue() {
                return wrapAngle(this.slotState.values.rotation[this.rotationAxis]);
            },
            getScaleQuickTitle(value) {
                let contexts = this.isHoldEditor ? [] : findContextsWithDefaultScale(value);
                let title = this.tf('display_sensei.ui.scale_quick_hint', { value: value });
                if (contexts.length) {
                    title += '\n' + this.tf('display_sensei.ui.scale_default_for', { contexts: contexts.join(', ') });
                }
                return title;
            },
            getTurnTitle(axis) {
                let others = AXIS_LETTERS.filter((letter, index) => index !== axis).join('+');
                return this.tf('display_sensei.ui.turn_axis_hint', { axis: AXIS_LETTERS[axis], axes: others });
            },
            getItemTurnTitle(nudge) {
                return this.tf('display_sensei.ui.turn_item_axis_hint', {
                    axis: AXIS_LETTERS[nudge.axis],
                    amount: (nudge.sign < 0 ? '−' : '+') + ITEM_TURN_STEP
                });
            },
            getGimbalNote() {
                let gimbal = this.slotState.gimbal;
                let key = gimbal.change > 0 ? 'display_sensei.info.gimbal_near' : 'display_sensei.info.gimbal_lock';
                return this.tf(key, { y: formatEditorValue(gimbal.y) });
            },
            getGimbalTip() {
                let gimbal = this.slotState.gimbal;
                let key = gimbal.change > 0 ? 'display_sensei.info.gimbal_near_tip' : 'display_sensei.info.gimbal_lock_tip';
                return this.tf(key, { y: formatEditorValue(gimbal.y) });
            },
            getTidyRotationLabel() {
                return this.tf('display_sensei.ui.tidy_rotation', { values: this.slotState.gimbal.tidy.map(formatEditorValue).join(', ') });
            },
            getTidyRotationTitle() {
                let gimbal = this.slotState.gimbal;
                return this.tf('display_sensei.ui.tidy_rotation_hint', {
                    values: gimbal.tidy.map(formatEditorValue).join(', '),
                    change: formatEditorValue(gimbal.change)
                });
            },
            getSelectedVersionHint() {
                let choice = this.output.choices.find(entry => entry.version === this.output.selected);
                return choice ? choice.hint : '';
            },
            getResetChannelTitle(channel) {
                if (this.isHoldEditor) {
                    let holdValues = getHoldChannelDefault(this.slotState.id, HOLD_EDITOR_CHANNELS[channel]);
                    return this.tf('display_sensei.hold.reset_channel_hint', {
                        channel: this.getChannelName(channel),
                        values: holdValues ? holdValues.map(formatEditorValue).join(', ') : ''
                    });
                }
                let values = this.slotState ? getChannelDefault(this.slotState.id, channel) : null;
                return this.tf('display_sensei.ui.reset_channel_hint', {
                    channel: this.t(CHANNEL_LABELS[channel]),
                    values: values ? values.map(formatEditorValue).join(', ') : ''
                });
            },
            getChannelName(channel) {
                return this.isHoldEditor && channel === 'translation' ? this.t('display_sensei.hold.position') : this.t(CHANNEL_LABELS[channel]);
            },
            getChannelTabLabel(channel) {
                return this.getChannelName(channel.id);
            },
            isChannelEditable(channel) {
                if (!this.isHoldEditor) return true;
                let hold = this.slotState.hold;
                return hold.editing && !!hold.editable[HOLD_EDITOR_CHANNELS[channel]];
            },
            getInputLimits(channel) {
                return this.isHoldEditor ? HOLD_INPUT_LIMITS[channel] : undefined;
            },
            getSliderRange(channel) {
                return this.isHoldEditor ? HOLD_SLIDER_RANGES[channel] : SLOT_RANGES[channel];
            },
            getTranslationSliderTitle() {
                let axis = AXIS_LETTERS[this.translationAxis];
                if (this.isHoldEditor) return this.tf('display_sensei.hold.position_slider_hint', { axis });
                return this.tf('display_sensei.ui.translation_slider_hint', { axis });
            },
            getCardTextTip() {
                if (this.cardNote && this.cardNote.tip) return this.t(this.cardNote.tip);
                return this.isHoldEditor ? this.t('display_sensei.info.attachable_hands') : '';
            },
            showsOffHandChoice() {
                return this.isHoldEditor && this.slotState.hold.hand === 'off_hand' && this.slotState.hold.offHand !== 'separate';
            },
            showsHoldHandCopy() {
                return this.isHoldEditor && this.slotState.hold.hand === 'off_hand';
            },
            getHoldNotes() {
                let hold = this.slotState.hold;
                let values = { bone: hold.bone || '' };
                let notes = [];
                let add = (id, entry) => {
                    if (entry) notes.push({ id, text: this.tf(entry.text, values), tip: entry.tip ? this.tf(entry.tip, values) : '' });
                };
                add(`hold_${hold.status}`, HOLD_STATUS_NOTES[hold.status]);
                if (hold.reason && !HOLD_STATUS_NOTES[hold.reason]) add(`hold_${hold.reason}`, HOLD_REASON_NOTES[hold.reason]);
                if (!hold.editing) add('hold_animate', { text: 'display_sensei.hold.note_animate', tip: 'display_sensei.hold.note_animate_tip' });
                return notes;
            },
            getHoldCheckEntry(check) {
                return HOLD_CHECK_TEXTS[check.id.split('.')[0]] || null;
            },
            getHoldCheckValues(check) {
                let values = Object.assign({}, check.values);
                if (HOLD_VIEW_NAMES[values.view]) values.view = this.t(HOLD_VIEW_NAMES[values.view]);
                return values;
            },
            getHoldCheckText(check) {
                let entry = this.getHoldCheckEntry(check);
                return entry ? this.tf(entry.text, this.getHoldCheckValues(check)) : '';
            },
            getHoldCheckTip(check) {
                let entry = this.getHoldCheckEntry(check);
                return entry ? this.tf(entry.tip, this.getHoldCheckValues(check)) : '';
            },
            getHoldFixLabel(check) {
                let fix = HOLD_FIX_LABELS[check.fix];
                return fix ? this.tf(fix.label, this.getHoldCheckValues(check)) : '';
            },
            getHoldFixHint(check) {
                let fix = HOLD_FIX_LABELS[check.fix];
                return fix ? this.tf(fix.hint, this.getHoldCheckValues(check)) : '';
            },
            getWearSlotLabel(slotId) {
                let slot = findWearSlot(slotId);
                return slot ? this.t(slot.label) : String(slotId || '');
            },
            getHoldFileState(file) {
                if (!file.exists) return 'missing';
                if (file.changedAfterWrite) return 'changed';
                if (file.pending) return 'pending';
                if (file.written) return 'written';
                return 'same';
            },
            getHoldFileStateText(file) {
                let state = this.getHoldFileState(file);
                if (state === 'missing') return this.t('display_sensei.hold_write.state_missing');
                if (state === 'changed') return this.t('display_sensei.hold_write.state_changed');
                if (state === 'pending') return this.tf('display_sensei.hold_write.state_pending', { count: file.pending });
                if (state === 'written') return this.t('display_sensei.hold_write.state_written');
                return this.t('display_sensei.hold_write.state_same');
            },
            holdFileChanged() {
                return !!this.holdWrite && this.holdWrite.files.some(file => file.changedAfterWrite);
            },
            canWriteHolds() {
                if (!this.holdWrite || this.holdBusy) return false;
                return (this.holdWrite.pending > 0 && this.holdWrite.files.some(file => file.exists)) || this.holdWrite.noFile.length > 0;
            },
            getHoldBackupFile() {
                let file = this.holdWrite ? this.holdWrite.files.find(entry => entry.hasBackup) : null;
                return file ? file.path : null;
            },
            getScaleSliderTitle() {
                if (this.scaleLocked) return this.t('display_sensei.ui.scale_slider_hint');
                return this.tf('display_sensei.ui.scale_axis_slider_hint', { axis: AXIS_LETTERS[this.scaleAxis] });
            },
            getSubtabLabel(subtabId) {
                let subtab = findSubtab(findMainTab('hand'), subtabId);
                return subtab ? this.t(subtab.label) : '';
            },
            getCalibrationName(calibrationId) {
                let action = CALIBRATION_ACTIONS.find(entry => entry.id === calibrationId);
                return action ? this.t(action.name) : '';
            },
            getSlotNameHint() {
                let slot = this.activeSlot;
                if (!slot || slot.id === slot.bedrockKey) return null;
                return this.tf('display_sensei.info.blockbench_slot_name', { slot: slot.id, key: slot.bedrockKey });
            },
            getEditCardTip() {
                let keys = [this.activeSubtab.info];
                if (this.activeSubtabId === 'third_front') keys.push(SHARED_THIRD_PERSON_NOTE.text);
                if (this.route === 'attachable' && this.activeTab === 'hand') keys.push('display_sensei.info.attachable_hands');
                return keys.map(key => this.t(key)).join('\n');
            },
            getIconHtml(icon) {
                return Blockbench.getIconNode(icon).outerHTML;
            },
            getReferenceName(choice) {
                let key = BLOCKBENCH_REFERENCE_NAMES[choice.id];
                return key ? this.t(key) : choice.name;
            },
            getActiveReferenceName() {
                let active = this.viewState.reference;
                return active ? this.getReferenceName(active) : '';
            },
            showReferenceRow() {
                let active = this.viewState.reference;
                return !!this.viewState.references || (!!active && (!!active.note || active.approximate));
            },
            formatPoseAngle() {
                return `${formatEditorValue(this.viewState.poseAngle.value)}°`;
            },
            isShelfVersionRaised() {
                return !!this.output && VersionUtil.compare(this.output.selected, '<', SHELF_GEOMETRY_VERSION);
            },
            getVersionNotes() {
                let output = this.output;
                let slotId = this.slotState.id;
                if (!output) return [];
                let notes = [];
                if (slotId === 'on_shelf' && this.slotState.copiesItemFrame) {
                    let values = { selected: output.selected };
                    notes.push({
                        id: 'shelf_copies_frame',
                        text: this.tf('display_sensei.info.shelf_copies_frame', values),
                        tip: this.tf('display_sensei.info.shelf_copies_frame_tip', values)
                    });
                }
                if (slotId === 'on_shelf' && this.isShelfVersionRaised()) {
                    let values = { selected: output.selected, version: SHELF_GEOMETRY_VERSION };
                    notes.push({
                        id: 'shelf_version',
                        text: this.tf('display_sensei.info.shelf_version', values),
                        tip: this.tf('display_sensei.info.shelf_version_tip', values)
                    });
                }
                if (slotId === 'gui' && VersionUtil.compare(output.effective, '<', FIT_TO_FRAME_GEOMETRY_VERSION)) {
                    notes.push({ id: 'fit_to_frame_version', text: this.tf('display_sensei.info.fit_to_frame_version', { selected: output.effective, version: FIT_TO_FRAME_GEOMETRY_VERSION }) });
                }
                if (slotId === 'fixed' && VersionUtil.compare(output.effective, '<', ITEM_FRAME_GEOMETRY_VERSION)) {
                    let values = { selected: output.effective, version: ITEM_FRAME_GEOMETRY_VERSION };
                    notes.push({
                        id: 'item_frame_version',
                        text: this.tf('display_sensei.info.item_frame_version', values),
                        tip: this.tf('display_sensei.info.item_frame_version_tip', values)
                    });
                }
                return notes;
            },

            getLinkEmptyText() {
                let key = LINK_EMPTY_TEXTS[this.link.status];
                return key ? this.t(key) : '';
            },
            getLinkEmptyTip() {
                let key = LINK_EMPTY_TIPS[this.link.status];
                return key ? this.t(key) : '';
            },
            getBehaviorPackText() {
                let bp = this.link.bp;
                if (bp.status === 'found') return this.tf('display_sensei.link.bp', { name: bp.name });
                if (bp.status === 'ambiguous') return this.tf('display_sensei.link.bp_ambiguous', { names: bp.candidates.join(', ') });
                return this.t('display_sensei.link.bp_missing');
            },
            getWizardName(wizardId) {
                let key = WIZARD_NAMES[wizardId];
                return key ? this.t(key) : String(wizardId || '');
            },
            getStampText() {
                let stamps = this.link.stamps;
                if (!stamps.length) return this.t('display_sensei.link.no_stamp');
                let tools = stamps.map(stamp => {
                    let name = WIZARD_NAMES[stamp.wizard] ? this.t(WIZARD_NAMES[stamp.wizard]) : stamp.key;
                    return stamp.versions.length ? `${name} ${stamp.versions.join(', ')}` : name;
                });
                return this.tf('display_sensei.link.stamps', { tools: tools.join('; ') });
            },
            getLinkNotes(notes) {
                return (notes || [])
                    .map(note => ({ id: note.id, text: this.getLinkNoteText(note), tip: this.getLinkNoteTip(note) }))
                    .filter(note => note.text);
            },
            getLinkNoteText(note) {
                let wizard = note.values ? note.values.wizard : null;
                let key = note.id === 'reexport' ? WIZARD_REEXPORT_TEXTS[wizard] : LINK_NOTE_TEXTS[note.id];
                return key ? this.tf(key, this.getLinkNoteValues(note)) : '';
            },
            getLinkNoteTip(note) {
                let wizard = note.values ? note.values.wizard : null;
                let key = note.id === 'reexport' ? WIZARD_REEXPORT_TIPS[wizard] : LINK_NOTE_TIPS[note.id];
                return key ? this.tf(key, this.getLinkNoteValues(note)) : '';
            },
            getLinkNoteValues(note) {
                let values = Object.assign({}, note.values);
                if (ITEM_WIZARD_PRESET_NAMES[values.preset]) {
                    values.preset = this.t(ITEM_WIZARD_PRESET_NAMES[values.preset]);
                }
                if (Array.isArray(values.losses)) {
                    let sentences = [];
                    for (let loss of values.losses) {
                        if (BLOCK_WIZARD_LOSS_TEXTS[loss]) sentences.push(this.t(BLOCK_WIZARD_LOSS_TEXTS[loss]));
                    }
                    values.features = sentences.join(' ');
                }
                return values;
            },
            getLinkFileGroups() {
                let groups = [];
                for (let group of LINK_FILE_GROUPS) {
                    let rows = this.link.files.filter(row => getLinkFileGroupId(row) === group.id);
                    if (rows.length) groups.push({ id: group.id, label: group.label, rows });
                }
                return groups;
            },
            getPathParts(path) {
                let parts = String(path).split('/');
                return parts
                    .map((part, index) => (index < parts.length - 1 ? part + '/' : part))
                    .filter(part => part !== '');
            },
            getLinkKindLabel(row) {
                return this.t(row.kind === 'look' ? 'display_sensei.link.kind_look' : 'display_sensei.link.kind_code');
            },
            getLinkKindHint(row) {
                return this.t(row.kind === 'look' ? 'display_sensei.link.kind_look_hint' : 'display_sensei.link.kind_code_hint');
            },
            getRewrittenHint() {
                let key = WIZARD_REWRITTEN_HINTS[this.link.wizard];
                return key ? this.t(key) : '';
            },
            getLinkFileDetail(row) {
                let parts = [LINK_ROLE_NAMES[row.role] ? this.t(LINK_ROLE_NAMES[row.role]) : row.role];
                if (row.pack === 'game') {
                    parts.push(this.t('display_sensei.link.game_detail'));
                } else if (row.maybe_game) {
                    parts.push(this.t('display_sensei.link.maybe_game_detail'));
                } else if (row.exists === false && LINK_ROLES_USING_ID.includes(row.role)) {
                    parts.push(this.tf('display_sensei.link.not_found_uses_detail', { path: row.path, id: row.id || '' }));
                } else if (row.exists === false) {
                    parts.push(this.tf('display_sensei.link.not_found_detail', { path: row.path, id: row.id || '' }));
                } else if (row.exists !== true) {
                    let ambiguous = this.link.bp && this.link.bp.status === 'ambiguous';
                    parts.push(this.t(ambiguous ? 'display_sensei.link.bp_ambiguous_detail' : 'display_sensei.link.bp_unknown_detail'));
                } else if (typeof row.mtime === 'number') {
                    parts.push(this.tf('display_sensei.link.date', { date: formatFileDate(row.mtime) }));
                }
                return parts.join(' · ');
            },
            showLinkActions() {
                return !this.link || this.link.status !== 'desktop_only';
            },
            canShowFileDates() {
                return !!this.link && this.link.status === 'linked' && this.link.dates !== 'shown' && canAskForFileDates();
            },

            getInfoCardText() {
                let card = this.infoCard;
                return (card.routeTexts && card.routeTexts[this.route]) || card.text;
            },
            getInfoCardTip() {
                let card = this.infoCard;
                return (card.routeTips && card.routeTips[this.route]) || card.tip;
            },
            isWornSubtab(subtabId) {
                return this.activeTab === 'armor' && !!this.wearInfo && this.wearInfo.slot === subtabId;
            },
            getWearKindEntry() {
                let wear = this.wearInfo;
                if (!wear || !WEAR_KIND_TEXTS[wear.kind] || wear.kind === 'unknown') return WEAR_KIND_TEXTS.unknown;
                if (wear.kind === 'held' && wear.slot) return HELD_IN_SLOT_TEXT;
                if (wear.kind === 'worn' && !wear.slot) return WORN_ELSEWHERE_TEXT;
                return WEAR_KIND_TEXTS[wear.kind];
            },
            getWearSource() {
                let wear = this.wearInfo;
                let entry = this.getWearKindEntry();
                return entry !== WEAR_KIND_TEXTS.unknown && wear ? WEAR_SOURCE_TEXTS[wear.source] || null : null;
            },
            getWearInfoText() {
                let wear = this.wearInfo;
                let slot = (wear && (wear.slot || (wear.slots || []).join(', '))) || this.t('display_sensei.armor.slot_unknown');
                let text = this.tf(this.getWearKindEntry().text, { slot });
                let source = this.getWearSource();
                return source ? `${text} ${this.t(source.text)}` : text;
            },
            getWearInfoTip() {
                let source = this.getWearSource();
                return [this.getWearKindEntry().tip, source && source.tip]
                    .filter(Boolean)
                    .map(key => this.t(key))
                    .join(' ');
            },
            getWornSlotTip() {
                let slot = this.armorWornSlot;
                let lines = [this.getWearInfoText()];
                if (slot) lines.push(this.tf('display_sensei.armor.other_slot_tip', { slot: slot.wearableSlot, tab: this.t(slot.label) }));
                return lines.join('\n');
            },
            getWearKindChoice() {
                let wear = this.wearInfo;
                return wear && wear.source === 'saved' && WEAR_KINDS.some(choice => choice.id === wear.kind) ? wear.kind : 'auto';
            },
            findArmorWearer() {
                return this.armor.wearers.find(choice => choice.id === this.armor.wearer) || null;
            },
            getWearerName() {
                let wearer = this.findArmorWearer();
                return wearer ? this.t(wearer.label) : '';
            },
            isWearerShaded() {
                let wearer = this.findArmorWearer();
                return !!wearer && !wearer.textured;
            },
            getSeverityLabel(severity) {
                let key = ARMOR_SEVERITY_LABELS[severity];
                return key ? this.t(key) : String(severity);
            },
            getFixLabel(fixId) {
                let fix = ARMOR_FIX_LABELS[fixId];
                return fix ? this.t(fix.label) : String(fixId);
            },
            getFixHint(fixId) {
                let fix = ARMOR_FIX_LABELS[fixId];
                return fix ? this.t(fix.hint) : '';
            },
            getCheckTip(check) {
                let lines = [];
                let tip = ARMOR_CHECK_TIPS[check.textKey];
                if (tip) lines.push(this.tf(tip, check.values));
                if (check.bones && check.bones.length) lines.push(this.tf('display_sensei.armor.check_bones', { bones: check.bones.join(', ') }));
                return lines.join('\n');
            },
            getFitTargetName(row) {
                if (!row.target || row.target === row.name) return '';
                return this.tf('display_sensei.armor.fit_target', { bone: row.target });
            },
            getChosenPoseNote() {
                let chosen = this.armor.poses.filter(pose => pose.chosen).map(pose => this.t(pose.label));
                return chosen.length ? this.tf('display_sensei.armor.poses_chosen', { poses: chosen.join(', ') }) : '';
            },

            setMainTab(tabId) {
                if (!findMainTab(tabId)) return;
                this.releasePointer();
                this.activeTab = tabId;
                this.saveState();
                if (this.activeSubtabId) {
                    this.showOwnContext(this.activeSubtabId, this.hand);
                }
                this.syncLinkState(tabId === 'output');
                this.syncArmorState();
                if (this.route === 'attachable') this.syncHoldCard(tabId === 'output');
            },
            setSubtab(subtabId) {
                if (!this.currentSubtabs.some(subtab => subtab.id === subtabId)) return;
                this.releasePointer();
                this.activeSubtabs[this.activeTab] = subtabId;
                this.saveState();
                this.showOwnContext(subtabId, this.hand);
                this.syncArmorState();
                if (this.route === 'attachable') this.syncHoldCard();
            },
            showOwnContext(subtabId, handId) {
                this.showingOwnContext = true;
                try {
                    if (this.route === 'attachable') return this.showOwnHoldView(subtabId, handId);
                    return showContext(subtabId, handId);
                } finally {
                    this.showingOwnContext = false;
                }
            },
            showOwnHoldView(subtabId, handId) {
                this.syncHoldContext();
                if (!this.holdSlotId || !isPanelVisible()) {
                    hideHoldView();
                    return null;
                }
                return showHoldView(subtabId, handId, true);
            },
            syncHoldCard(forceFiles = false) {
                this.syncHoldContext();
                this.syncSlotState();
                this.syncHoldView();
                this.syncHandViews();
                this.syncHoldOutput(forceFiles);
            },
            goToLeftHand() {
                this.setHand('left');
                this.setMainTab('hand');
            },
            openArmorSubtab(subtabId) {
                if (!findSubtab(findMainTab('armor'), subtabId)) return;
                this.activeSubtabs.armor = subtabId;
                this.setMainTab('armor');
            },
            setHand(handId) {
                if (!findHand(handId)) return;
                this.releasePointer();
                this.hand = handId;
                this.saveState();
                this.showOwnContext(this.activeSubtabId, handId);
                if (this.route === 'attachable') this.syncHoldCard();
            },
            setBackCamera(style) {
                if (!BACK_CAMERA_OPTIONS.some(option => option.id === style)) return;
                this.backCamera = style;
                setBackCameraStyle(style);
                this.saveState();
                this.showOwnContext(this.activeSubtabId, this.hand);
                if (this.route === 'attachable') this.syncHoldCard();
            },
            saveState() {
                saveUiState({
                    tab: this.activeTab,
                    subtabs: this.activeSubtabs,
                    hand: this.hand,
                    channel: this.activeChannel,
                    moveStep: this.moveStep,
                    translationAxis: this.translationAxis,
                    rotationAxis: this.rotationAxis,
                    scaleAxis: this.scaleAxis,
                    scaleLocked: this.scaleLocked,
                    advancedOpen: this.advancedOpen,
                    viewOpen: this.viewOpen,
                    handViewsOpen: this.handViewsOpen,
                    presetScope: this.presetScope,
                    backCamera: this.backCamera,
                    armorWearer: this.armorWearer,
                    armorOverlay: this.armorOverlay,
                    armorFitChannel: this.armorFitChannel,
                    armorFactsOpen: this.armorFactsOpen
                });
            },

            refreshFromBlockbench() {
                this.route = getRoute();
                this.formatId = getFormatId();
                this.syncPanelMode();
                this.followDisplayMode();
                this.syncCard();
            },
            syncPanelMode() {
                this.panelMode = getPanelMode();
            },
            followDisplayMode() {
                let active = getActiveContext();
                let key = active ? `${active.subtabId}/${active.handId || ''}` : '';
                if (key === this.followedContextKey) return;
                this.followedContextKey = key;
                if (this.showingOwnContext) return;
                if (!active || !findMainTab(active.tabId)) return;
                if (this.showsSameView(active)) return;
                this.activeTab = active.tabId;
                this.activeSubtabs[active.tabId] = active.subtabId;
                if (active.handId) this.hand = active.handId;
                this.saveState();
            },
            showsSameView(active) {
                let current = findContextView(this.activeSubtabId, this.hand);
                let shown = findContextView(active.subtabId, active.handId);
                return !!current && !!shown && current.slotId === shown.slotId && current.camera === shown.camera;
            },
            syncCard() {
                if (this.route === 'block' && !this.presetChoices.length) {
                    this.presetChoices = getPresetChoices() || [];
                }
                this.entityKeepsTransforms = hasEntityDisplayTransforms();
                this.syncHoldContext();
                this.syncSlotState();
                this.syncViewState();
                this.syncPivotMarkers();
                this.syncOutputState();
                this.syncLinkState();
                this.syncArmorState();
                this.syncHoldOutput();
            },
            syncHoldContext() {
                if (this.route !== 'attachable') {
                    this.holdWearSlot = null;
                    this.holdOverview = null;
                    this.holdPresetChoices = [];
                    return;
                }
                let worn = getHoldWearState();
                this.holdWearSlot = worn.worn ? (worn.slot || '') : null;
                if (this.activeTab !== 'hand' || worn.worn) {
                    this.holdOverview = null;
                    return;
                }
                prepareHoldEditing();
                this.holdOverview = getHoldOverview();
                this.holdPresetChoices = getHoldPresetChoices();
                if (this.presetId && !this.holdPresetChoices.some(choice => choice.id === this.presetId)) this.presetId = '';
            },
            syncHoldView() {
                if (this.showHoldEditor && isPanelVisible()) {
                    showHoldView(this.activeSubtabId, this.hand, false);
                } else {
                    hideHoldView();
                }
                this.holdView = getHeldPreviewState();
            },
            syncHoldOutput(forceFiles = false) {
                if (this.route !== 'attachable' || this.activeTab !== 'output') {
                    this.holdWrite = null;
                    this.holdJson = '';
                    this.holdAttachableLines = '';
                    return;
                }
                this.holdWrite = getHoldWriteState(forceFiles);
                this.holdJson = buildHoldAnimationText();
                this.holdAttachableLines = buildAttachableHoldLines();
            },
            readHoldSlotState(slotId) {
                let hold = getHoldState(slotId);
                if (!hold) return null;
                return {
                    id: slotId,
                    values: {
                        translation: hold.values.position,
                        rotation: hold.values.rotation,
                        scale: hold.values.scale,
                        rotation_pivot: [0, 0, 0],
                        scale_pivot: [0, 0, 0]
                    },
                    inherited: hold.sameAsMain,
                    fitToFrame: null,
                    copiesItemFrame: false,
                    handFallbackNote: null,
                    gimbal: hold.gimbal,
                    hold
                };
            },
            syncViewState() {
                let slotId = this.cardSlotId;
                let references = slotId ? getReferenceChoices(slotId) : null;
                let options = (slotId && getReferenceOptions(slotId)) || [];
                this.viewState = {
                    shown: !!slotId && isShowingSlot(slotId),
                    references: references && references.length > 1 ? references : null,
                    reference: (references && references.find(choice => choice.active)) || null,
                    poseAngle: slotId ? getPoseAngle(slotId) : null,
                    previewAnimation: slotId ? getPreviewAnimation(slotId) : null,
                    options: options.filter(option => option.id !== FIT_PREVIEW_OPTION_ID),
                    fitPreview: options.find(option => option.id === FIT_PREVIEW_OPTION_ID) || null,
                    skin: !!slotId && canOpenSkinDialog()
                };
                this.syncHoldView();
                this.syncHandViews();
            },

            syncHandViews() {
                let views;
                if (this.isHoldEditor) {
                    views = this.holdView.shown ? getHoldViewChoices(this.activeSubtabId, this.hand) : null;
                } else {
                    views = this.viewState.shown ? getHandViewChoices() : null;
                }
                let key = views ? views.map(view => `${view.subtabId}/${view.handId}`).join() : '';
                this.handViews = views;
                if (!views || !this.handViewsOpen) {
                    this.handViewsKey = '';
                    return;
                }
                if (key !== this.handViewsKey) {
                    this.handViewsKey = key;
                    this.$nextTick(() => this.drawHandViews());
                } else {
                    this.scheduleHandViews();
                }
            },
            scheduleHandViews() {
                if (this.handViewTimer) return;
                this.handViewTimer = setTimeout(() => {
                    this.handViewTimer = null;
                    this.drawHandViews();
                }, HAND_VIEW_REFRESH_MS);
            },
            drawHandViews() {
                let canvases = [].concat(this.$refs.handViewCanvas || []);
                if (!this.handViews || !this.handViewsOpen) return;
                if (!isPanelVisible()) {
                    this.handViewsKey = '';
                    return;
                }
                for (let canvas of canvases) {
                    let view = this.handViews.find(entry => entry.subtabId === canvas.getAttribute('data-ds-hand-view-canvas'));
                    let draw = this.route === 'attachable' ? renderHoldView : renderHandView;
                    let image = view ? draw(view.subtabId, view.handId, canvas.width, canvas.height) : null;
                    if (image) canvas.getContext('2d').putImageData(image, 0, 0);
                    canvas.classList.toggle('ds-stale', !image);
                }
            },
            onPanelShown() {
                if (this.route === 'attachable') {
                    let shown = this.holdView.shown;
                    this.syncHoldView();
                    if (shown !== this.holdView.shown) this.handViewsKey = '';
                }
                if (!this.handViewsKey && isPanelVisible()) this.syncHandViews();
            },
            syncPivotMarkers() {
                let slotId = this.advancedOpen && this.showBlockEditor && isPanelVisible() ? this.cardSlotId : '';
                this.pivotMarkersShown = setPivotMarkersShown(!!slotId, slotId || null);
            },
            toggleHandViews() {
                this.handViewsOpen = !this.handViewsOpen;
                this.saveState();
                this.handViewsKey = '';
                this.syncHandViews();
            },
            refreshPresetChoices() {
                if (this.route === 'attachable') {
                    this.holdPresetChoices = getHoldPresetChoices();
                    if (this.presetId && !this.holdPresetChoices.some(choice => choice.id === this.presetId)) this.presetId = '';
                    return;
                }
                if (this.route !== 'block') return;
                this.presetChoices = getPresetChoices() || [];
                if (this.presetId && !this.presetChoices.some(choice => choice.id === this.presetId)) {
                    this.presetId = '';
                }
            },
            syncSlotState() {
                if (this.holdSlotId) {
                    this.slotState = this.readHoldSlotState(this.holdSlotId);
                    return;
                }
                let slotId = this.cardSlotId;
                let values = slotId ? getSlotValues(slotId) : null;
                if (!values) {
                    this.slotState = null;
                    return;
                }
                this.slotState = {
                    id: slotId,
                    values,
                    inherited: isSlotInherited(slotId) === true,
                    fitToFrame: slotId === 'gui' ? values.fit_to_frame !== false : null,
                    copiesItemFrame: slotId === 'on_shelf' && shelfCopiesItemFrame(),
                    handFallbackNote: getHandFallbackNote(slotId),
                    gimbal: getGimbalState(slotId)
                };
            },
            syncOutputState() {
                if (this.route !== 'block') {
                    this.output = null;
                    return;
                }
                let transforms = buildItemDisplayTransforms();
                let selected = getGeometryVersion();
                let effective = getEffectiveGeometryVersion();
                this.output = {
                    choices: getGeometryVersionChoices() || [],
                    selected,
                    effective,
                    raised: !!transforms && effective !== selected,
                    text: transforms ? formatTransformsProperty(transforms) : ''
                };
            },
            syncLinkState(force = false) {
                let bedrock = this.route !== 'none';
                let attachableNotes = this.route === 'attachable' && (this.activeTab === 'hand' || this.activeTab === 'armor');
                let shown = bedrock && (this.activeTab === 'output' || attachableNotes);
                let view = shown ? getPackLinkView() : null;
                this.link = this.activeTab === 'output' ? view : null;
                this.linkHandNotes = view && this.activeTab === 'hand'
                    ? view.notes.filter(note => HAND_CARD_NOTE_IDS.includes(note.id))
                    : [];
                this.linkArmorNotes = view && this.activeTab === 'armor'
                    ? view.notes.filter(note => ARMOR_CARD_NOTE_IDS.includes(note.id))
                    : [];
                if (shown || (bedrock && isPackScanNeededForRoute())) requestPackLinkScan(Project, force);
            },
            onProjectSaved(event) {
                if (!event || event.saved !== true || event.project !== Project) return;
                this.syncLinkState(true);
            },

            syncArmorState() {
                let onArmorTab = this.route === 'attachable' && this.activeTab === 'armor';
                this.wearInfo = onArmorTab ? getWearInfo() : null;
                if (onArmorTab) this.followWornSubtab();
                let slotId = this.armorSlotId;
                if (!slotId) {
                    this.armor = null;
                    this.syncArmorPreview();
                    return;
                }
                let wearer = getWearer();
                let preview = getArmorPreviewState() || {};
                let fitRows = this.readFitRows(slotId);
                let wornSlot = this.wearInfo ? findWearSlot(this.wearInfo.slot) : null;
                let onWornSlot = !wornSlot || wornSlot.id === slotId;
                this.armorWearer = wearer;
                this.armor = {
                    slotId,
                    wearers: getWearerChoices(),
                    wearer,
                    flatTexture: getOverlayOptions().flatTexture || null,
                    textures: Array.isArray(preview.textures) ? preview.textures : [],
                    camera: typeof preview.camera === 'string' ? preview.camera : null,
                    checks: onWornSlot ? runArmorChecks(slotId, wearer) || [] : [],
                    poses: getPoseChoices(wearer) || [],
                    activePose: getActivePose() || null,
                    fitPreview: preview.fitPreview === true,
                    fitRows,
                    hasFitOffsets: fitRows.some(row => row.moved)
                };
                this.syncArmorPreview();
            },
            followWornSubtab() {
                let slotId = (this.wearInfo && this.wearInfo.slot) || null;
                if (!Project || followedWearSlots.get(Project) === slotId) return;
                followedWearSlots.set(Project, slotId);
                if (!findSubtab(findMainTab('armor'), slotId) || this.activeSubtabs.armor === slotId) return;
                this.activeSubtabs.armor = slotId;
                this.saveState();
            },
            getWornArmorSlotId() {
                let slot = this.wearInfo ? findWearSlot(this.wearInfo.slot) : null;
                return slot && slot.support.attachable === 'armor' ? slot.id : '';
            },
            readFitRows(slotId) {
                let offsets = getFitOffsets(slotId) || {};
                return Object.keys(offsets).map(name => {
                    let values = readFitValues(offsets[name]);
                    let moved = FIT_CHANNELS.some(channel => values[channel.id].some((value, axis) => !sameNumber(value, FIT_DEFAULTS[channel.id][axis])));
                    return { name, target: findCanonicalWearerBone(name), values, moved };
                });
            },
            syncArmorPreview() {
                let cardShown = !!this.armorSlotId;
                if (this.armorCardShown && !cardShown) {
                    stopPoseTest();
                    setFitPreview(false);
                }
                this.armorCardShown = cardShown;
                setArmorPreviewSlot(cardShown ? this.getWornArmorSlotId() || this.armorSlotId : null);
                let show = cardShown && this.armorOverlay.show;
                let key = show ? String(Project.uuid) : '';
                if (key === this.overlayProjectKey) return;
                this.overlayProjectKey = key;
                setOverlayOptions({ show });
            },
            endArmorPreview() {
                if (this.armorCardShown) {
                    stopPoseTest();
                    setFitPreview(false);
                }
                if (this.overlayProjectKey) setOverlayOptions({ show: false });
                setArmorPreviewSlot(null);
                this.armorCardShown = false;
                this.overlayProjectKey = '';
            },

            setWearKindFrom(event) {
                let kind = event.target.value;
                if (this.armor && WEAR_KINDS.some(choice => choice.id === kind)) {
                    let found = this.wearInfo && this.wearInfo.slot;
                    let slot = (kind === 'armor' || kind === 'worn') && !found ? this.armor.slotId : null;
                    setWearKind(kind, slot);
                }
                this.syncCard();
                event.target.value = this.getWearKindChoice();
            },
            setWearerFrom(event) {
                setWearer(event.target.value);
                this.armorWearer = getWearer();
                this.saveState();
                this.syncArmorState();
                event.target.value = this.armorWearer;
            },
            setOverlayToggle(optionId, event) {
                if (!ARMOR_OVERLAY_TOGGLES.some(toggle => toggle.id === optionId)) return;
                this.armorOverlay[optionId] = event.target.checked;
                this.saveState();
                if (optionId === 'show') {
                    this.syncArmorPreview();
                } else {
                    setOverlayOptions({ [optionId]: event.target.checked });
                }
                this.syncArmorState();
            },
            setOtherSlotsFrom(event) {
                if (ARMOR_OTHER_SLOTS.some(choice => choice.id === event.target.value)) {
                    this.armorOverlay.otherSlots = event.target.value;
                    this.saveState();
                    setOverlayOptions({ otherSlots: event.target.value });
                }
                this.syncArmorState();
                event.target.value = this.armorOverlay.otherSlots;
            },
            setFlatTextureFrom(event) {
                setOverlayOptions({ flatTexture: event.target.value || null });
                this.syncArmorState();
                event.target.value = this.armor ? this.armor.flatTexture || '' : '';
            },

            showArmorCamera(viewId) {
                this.releasePointer();
                applyArmorCamera(viewId);
                this.syncArmorState();
            },
            restoreCamera() {
                this.releasePointer();
                restoreArmorCamera();
                this.syncArmorState();
            },
            togglePose(poseId) {
                this.releasePointer();
                if (!this.armor) return;
                if (this.armor.activePose === poseId) {
                    stopPoseTest();
                } else if (startPoseTest(poseId) === false) {
                    showMessage('display_sensei.message.armor_pose_edit_mode');
                }
                this.syncArmorState();
            },

            applyFix(check, fixId) {
                this.releasePointer();
                if (!this.armor) return;
                if (!applyArmorFix(check.id, fixId, this.armor.slotId, this.armor.wearer)) {
                    showMessage('display_sensei.message.armor_fix_failed');
                }
                this.syncCard();
            },
            setArmorFitChannel(channelId) {
                if (!FIT_CHANNELS.some(channel => channel.id === channelId)) return;
                this.armorFitChannel = channelId;
                this.saveState();
            },
            commitFitOffset(boneName, channel, axis, event) {
                let input = event.target;
                let slotId = this.armor ? this.armor.slotId : '';
                let value = parseFloat(input.value);
                if (slotId && Number.isFinite(value)) {
                    let current = readFitValues((getFitOffsets(slotId) || {})[boneName])[channel];
                    if (!sameNumber(current[axis], value)) {
                        let next = current.slice();
                        next[axis] = value;
                        setFitOffset(slotId, boneName, channel, next);
                    }
                }
                this.syncCard();
                let row = this.armor ? this.armor.fitRows.find(entry => entry.name === boneName) : null;
                if (row) input.value = formatEditorValue(row.values[channel][axis]);
            },
            resetFit() {
                this.releasePointer();
                if (this.armor) resetFitOffsets(this.armor.slotId);
                this.syncCard();
            },
            bakeFit() {
                this.releasePointer();
                if (!this.armor) return;
                if (!bakeFitOffsets(this.armor.slotId)) {
                    showMessage('display_sensei.message.armor_bake_failed');
                }
                this.syncCard();
            },
            setFitPreviewFrom(event) {
                setFitPreview(event.target.checked);
                this.syncArmorState();
                event.target.checked = !!this.armor && this.armor.fitPreview;
            },
            toggleArmorFacts() {
                this.armorFactsOpen = !this.armorFactsOpen;
                this.saveState();
            },

            setChannel(channelId) {
                if (!CHANNEL_TABS.some(channel => channel.id === channelId)) return;
                this.releasePointer();
                this.activeChannel = channelId;
                this.saveState();
            },
            setMoveStep(event) {
                let step = Number(event.target.value);
                if (MOVE_STEPS.includes(step)) {
                    this.moveStep = step;
                    this.saveState();
                }
                event.target.value = String(this.moveStep);
            },
            setTranslationAxis(axis) {
                this.translationAxis = axis;
                this.saveState();
            },
            setRotationAxis(axis) {
                this.rotationAxis = axis;
                this.saveState();
            },
            setScaleAxis(axis) {
                this.scaleAxis = axis;
                this.saveState();
            },
            setScaleLocked(event) {
                this.scaleLocked = event.target.checked;
                this.saveState();
            },
            toggleAdvanced() {
                this.advancedOpen = !this.advancedOpen;
                this.saveState();
                this.syncPivotMarkers();
            },
            toggleView() {
                this.viewOpen = !this.viewOpen;
                this.saveState();
            },
            setPresetScope(event) {
                if (PRESET_SCOPES.some(scope => scope.id === event.target.value)) {
                    this.presetScope = event.target.value;
                    this.saveState();
                }
                event.target.value = this.presetScope;
            },

            editorValues(slotId) {
                if (this.route !== 'attachable') return getSlotValues(slotId);
                let values = getHoldValues(slotId);
                return values ? { translation: values.position, rotation: values.rotation, scale: values.scale } : null;
            },
            editorReadTyped(channel, text) {
                if (this.route !== 'attachable') return readTypedValue(channel, text);
                return sanitizeHoldValue(HOLD_EDITOR_CHANNELS[channel], text);
            },
            editorSetChannel(slotId, channel, values) {
                if (this.route !== 'attachable') return setSlotChannel(slotId, channel, values);
                return setHoldChannel(slotId, HOLD_EDITOR_CHANNELS[channel], values);
            },
            editorSetAxis(slotId, channel, axis, value) {
                if (this.route !== 'attachable') return setSlotAxis(slotId, channel, axis, value);
                return setHoldAxis(slotId, HOLD_EDITOR_CHANNELS[channel], axis, value);
            },
            editorBegin(slotId) {
                return this.route === 'attachable' ? beginHoldEdit() : beginSlotEdit([slotId]);
            },
            editorIsOpen(route) {
                return route === 'attachable' ? isOwnHoldEditOpen() : isOwnSlotEditOpen();
            },
            editorFinish(route) {
                return route === 'attachable' ? finishHoldEdit() : finishSlotEdit();
            },
            editorCancel(route) {
                return route === 'attachable' ? cancelHoldEdit() : cancelSlotEdit();
            },
            commitAxis(channel, axis, event) {
                let input = event.target;
                let slotId = this.slotState && this.slotState.id;
                let current = slotId ? this.editorValues(slotId) : null;
                let value = this.editorReadTyped(channel, input.value);
                if (current && value !== null) {
                    let linked = channel === 'scale' && this.scaleLocked;
                    let same = channel === 'rotation' ? sameAngle : sameNumber;
                    if (linked && !current.scale.every(old => sameNumber(old, value))) {
                        this.editorSetChannel(slotId, 'scale', [value, value, value]);
                    } else if (!linked && !same(current[channel][axis], value)) {
                        this.editorSetAxis(slotId, channel, axis, value);
                    }
                }
                this.syncCard();
                if (this.slotState) {
                    input.value = formatEditorValue(this.slotState.values[channel][axis]);
                }
            },

            beginGesture(event) {
                if (event && event.type === 'mousedown' && event.button !== 0) return false;
                this.releasePointer();
                if (!this.slotState) return false;
                let slotId = this.slotState.id;
                let route = this.route;
                this.gesture = { slotId, route, project: Project, ownsEdit: this.editorBegin(slotId), cancelled: false };
                window.addEventListener('mouseup', this.onWindowPointerUp, true);
                window.addEventListener('touchend', this.onWindowPointerUp, true);
                window.addEventListener('touchcancel', this.onWindowPointerUp, true);
                window.addEventListener('blur', this.onWindowPointerUp);
                window.addEventListener('keydown', this.onWindowKeyDown, true);
                return true;
            },
            ensureGestureEdit() {
                let gesture = this.gesture;
                if (gesture && !gesture.cancelled && gesture.route === this.route && !this.editorIsOpen(gesture.route)) {
                    gesture.ownsEdit = this.editorBegin(gesture.slotId);
                }
            },
            stopNudgeRepeat() {
                clearTimeout(this.nudgeDelayTimer);
                clearInterval(this.nudgeRepeatTimer);
                this.nudgeDelayTimer = null;
                this.nudgeRepeatTimer = null;
            },
            releasePointer() {
                this.stopNudgeRepeat();
                let gesture = this.gesture;
                if (!gesture) return;
                this.gesture = null;
                window.removeEventListener('mouseup', this.onWindowPointerUp, true);
                window.removeEventListener('touchend', this.onWindowPointerUp, true);
                window.removeEventListener('touchcancel', this.onWindowPointerUp, true);
                window.removeEventListener('blur', this.onWindowPointerUp);
                window.removeEventListener('keydown', this.onWindowKeyDown, true);
                if (gesture.cancelled) {
                    this.$forceUpdate();
                } else if (gesture.ownsEdit) {
                    this.editorFinish(gesture.route);
                }
            },
            cancelGesture() {
                let gesture = this.gesture;
                if (!gesture || gesture.cancelled) return false;
                this.stopNudgeRepeat();
                gesture.cancelled = true;
                if (gesture.ownsEdit) this.editorCancel(gesture.route);
                if (this.$el.contains(document.activeElement)) document.activeElement.blur();
                this.syncCard();
                return true;
            },
            endGestureOf(project) {
                if (this.gesture && this.gesture.project === project) {
                    this.releasePointer();
                }
            },
            getEditSlotId() {
                if (this.gesture) return this.gesture.cancelled ? null : this.gesture.slotId;
                return this.slotState ? this.slotState.id : null;
            },
            startNudge(nudge, event) {
                if (!this.beginGesture(event)) return;
                this.nudgeStep(nudge);
                this.nudgeDelayTimer = setTimeout(() => {
                    this.nudgeRepeatTimer = setInterval(() => this.nudgeStep(nudge), NUDGE_REPEAT_INTERVAL_MS);
                }, NUDGE_REPEAT_DELAY_MS);
            },
            nudgeStep(nudge) {
                let slotId = this.getEditSlotId();
                let values = slotId ? this.editorValues(slotId) : null;
                if (!values) {
                    this.releasePointer();
                    return;
                }
                this.ensureGestureEdit();
                let next = roundEditorValue(values.translation[nudge.axis] + nudge.sign * this.moveStep);
                this.editorSetAxis(slotId, 'translation', nudge.axis, next);
            },
            nudgeFromKeyboard(nudge, event) {
                if (event.detail === 0) {
                    this.nudgeStep(nudge);
                }
            },
            onRotationSlider(event) {
                let slotId = this.getEditSlotId();
                if (!slotId) return;
                this.ensureGestureEdit();
                this.editorSetAxis(slotId, 'rotation', this.rotationAxis, Number(event.target.value));
            },
            setRotationQuickValue(value) {
                let slotId = this.getEditSlotId();
                let current = slotId ? this.editorValues(slotId) : null;
                if (current && !sameAngle(current.rotation[this.rotationAxis], value)) {
                    this.editorSetAxis(slotId, 'rotation', this.rotationAxis, value);
                }
            },
            onTranslationSlider(event) {
                let slotId = this.getEditSlotId();
                if (!slotId) return;
                this.ensureGestureEdit();
                this.editorSetAxis(slotId, 'translation', this.translationAxis, Number(event.target.value));
            },
            onScaleSlider(event) {
                let slotId = this.getEditSlotId();
                let value = Number(event.target.value);
                if (!slotId) return;
                this.ensureGestureEdit();
                if (this.scaleLocked) {
                    this.editorSetChannel(slotId, 'scale', [value, value, value]);
                } else {
                    this.editorSetAxis(slotId, 'scale', this.scaleAxis, value);
                }
            },
            setUniformScale(value) {
                let slotId = this.getEditSlotId();
                let current = slotId ? this.editorValues(slotId) : null;
                if (current && !current.scale.every(old => sameNumber(old, value))) {
                    this.editorSetChannel(slotId, 'scale', [value, value, value]);
                }
            },

            setInherited(event) {
                if (this.isHoldEditor) {
                    setHoldOffHandSame(this.slotState.hold.view, event.target.checked);
                } else if (this.slotState) {
                    setSlotInherited(this.slotState.id, event.target.checked);
                }
                this.syncCard();
                event.target.checked = !!this.slotState && this.slotState.inherited;
            },
            setFitToFrame(event) {
                setGuiFitToFrame(event.target.checked);
                this.syncCard();
                event.target.checked = !!this.slotState && this.slotState.fitToFrame === true;
            },
            mirrorSlot() {
                if (this.isHoldEditor) {
                    copyHoldFromOtherHand(this.slotState.id, true);
                    this.syncCard();
                } else if (this.slotState) {
                    mirrorFromOtherHand(this.slotState.id);
                }
            },
            samePoseSlot() {
                if (this.isHoldEditor) {
                    copyHoldFromOtherHand(this.slotState.id, false);
                    this.syncCard();
                } else if (this.slotState) {
                    samePoseFromOtherHand(this.slotState.id);
                }
            },
            matchFirstPerson() {
                this.releasePointer();
                if (this.isHoldEditor) {
                    let holdResult = matchHoldFirstPerson();
                    this.syncCard();
                    if (holdResult) Blockbench.showQuickMessage(this.describeHoldMatch(holdResult), QUICK_MESSAGE_MS);
                    return;
                }
                let result = this.slotState ? matchFirstPersonToThirdPerson() : null;
                if (!result) return;
                Blockbench.showQuickMessage(this.describeMatch(result), QUICK_MESSAGE_MS);
            },
            describeHoldMatch(result) {
                let handName = slotId => this.t(slotId === 'firstperson_righthand' ? 'display_sensei.ui.right_hand' : 'display_sensei.ui.left_hand');
                let parts = [];
                if (!result.written.length) {
                    parts.push(this.t(result.readOnly.length ? 'display_sensei.message.hold_match_read_only' : 'display_sensei.message.hold_nothing_to_match'));
                } else if (result.kept.length) {
                    parts.push(this.tf('display_sensei.message.hold_matched_hand', { hand: handName(result.written[0]), kept: handName(result.kept[0]) }));
                } else {
                    parts.push(this.t('display_sensei.message.hold_matched'));
                }
                if (result.written.length && HOLD_MATCH_STARTS[result.start]) parts.push(this.t(HOLD_MATCH_STARTS[result.start]));
                if (result.clamped.length) parts.push(this.t('display_sensei.message.hold_clamped'));
                if (result.turned > 0) parts.push(this.tf('display_sensei.message.first_person_turned', { change: formatEditorValue(result.turned) }));
                return parts.join(' ');
            },
            describeMatch(result) {
                let handName = slotId => this.t(slotId === 'firstperson_righthand' ? 'display_sensei.ui.right_hand' : 'display_sensei.ui.left_hand');
                let parts = [];
                if (!result.written.length) {
                    parts.push(this.t('display_sensei.message.first_person_nothing_to_match'));
                } else if (result.kept.length) {
                    parts.push(this.tf('display_sensei.message.first_person_matched_hand', { hand: handName(result.written[0]), kept: handName(result.kept[0]) }));
                } else {
                    parts.push(this.t('display_sensei.message.first_person_matched'));
                }
                if (result.clamped.length) parts.push(this.t('display_sensei.message.first_person_clamped'));
                if (result.turned > 0) parts.push(this.tf('display_sensei.message.first_person_turned', { change: formatEditorValue(result.turned) }));
                return parts.join(' ');
            },
            turnSlot(axis) {
                if (this.isHoldEditor) {
                    turnHold180(this.slotState.id, ['x', 'y', 'z'][axis]);
                } else if (this.slotState) {
                    turnSlot180(this.slotState.id, ['x', 'y', 'z'][axis]);
                }
            },
            turnItem(nudge) {
                if (this.isHoldEditor) {
                    turnHoldAboutItemAxis(this.slotState.id, ['x', 'y', 'z'][nudge.axis], nudge.sign * ITEM_TURN_STEP);
                } else if (this.slotState) {
                    turnSlotAboutItemAxis(this.slotState.id, ['x', 'y', 'z'][nudge.axis], nudge.sign * ITEM_TURN_STEP);
                }
            },
            tidyRotation() {
                this.releasePointer();
                let tidied = null;
                if (this.isHoldEditor) {
                    tidied = tidyHoldRotation(this.slotState.id);
                } else if (this.slotState) {
                    tidied = tidyNearGimbalRotation(this.slotState.id);
                }
                if (!tidied) return;
                Blockbench.showQuickMessage(this.tf('display_sensei.message.rotation_tidied', {
                    values: tidied.rotation.map(formatEditorValue).join(', '),
                    change: formatEditorValue(tidied.change)
                }), QUICK_MESSAGE_MS);
            },
            resetChannel(channel) {
                this.releasePointer();
                if (this.isHoldEditor) {
                    resetHoldChannel(this.slotState.id, HOLD_EDITOR_CHANNELS[channel]);
                } else if (this.slotState) {
                    resetSlotChannel(this.slotState.id, channel);
                }
            },
            applySelectedPreset() {
                if (!this.slotState || !this.presetId) return;
                if (this.isHoldEditor) {
                    if (!applyHoldPreset(this.presetId, this.slotState.id, this.presetScope === 'all' ? 'both' : 'view')) {
                        showMessage('display_sensei.message.hold_preset_failed');
                    }
                    this.syncCard();
                    return;
                }
                if (this.selectedPreset && this.selectedPreset.uncalibrated) {
                    showMessage('display_sensei.message.preset_not_calibrated');
                    return;
                }
                let slotIds = this.presetScope === 'all' ? undefined : [this.slotState.id];
                if (!applyPreset(this.presetId, slotIds)) {
                    showMessage('display_sensei.message.preset_not_applicable');
                }
            },
            calibrateHold(calibrationId) {
                this.releasePointer();
                let save = () => {
                    if (!saveCalibratedHold(calibrationId)) return;
                    this.refreshPresetChoices();
                    Blockbench.showQuickMessage(this.tf('display_sensei.message.hold_calibrated', { hold: this.getCalibrationName(calibrationId) }), QUICK_MESSAGE_MS);
                };
                if (!hasCalibratedHold(calibrationId)) {
                    save();
                    return;
                }
                this.confirmHoldChange('display_sensei.ui.replace_hold_title', 'display_sensei.ui.replace_hold_message', 'display_sensei.ui.replace_hold_confirm', calibrationId, save);
            },
            forgetHold(calibrationId) {
                this.releasePointer();
                this.confirmHoldChange('display_sensei.ui.forget_hold_title', 'display_sensei.ui.forget_hold_message', 'display_sensei.ui.forget_hold_confirm', calibrationId, () => {
                    if (!clearCalibratedHold(calibrationId)) return;
                    this.refreshPresetChoices();
                    Blockbench.showQuickMessage(this.tf('display_sensei.message.hold_forgotten', { hold: this.getCalibrationName(calibrationId) }), QUICK_MESSAGE_MS);
                });
            },
            confirmHoldChange(titleKey, messageKey, confirmKey, calibrationId, onConfirm) {
                let hold = this.getCalibrationName(calibrationId);
                Blockbench.showMessageBox({
                    title: this.tf(titleKey, { hold }),
                    message: this.tf(messageKey, { hold }),
                    icon: 'warning',
                    buttons: [this.tf(confirmKey, { hold }), this.t('display_sensei.ui.cancel')],
                    confirmIndex: 0,
                    cancelIndex: 1
                }, button => {
                    if (button === 0) onConfirm();
                });
            },

            resetView() {
                this.releasePointer();
                if (this.isHoldEditor) {
                    resetHoldView(this.activeSubtabId, this.hand);
                    this.syncHoldView();
                    return;
                }
                resetContextView(this.activeSubtabId, this.hand);
            },
            enterEditMode() {
                this.releasePointer();
                if (Modes.options.edit && !Modes.edit) Modes.options.edit.select();
                this.syncCard();
            },
            applyHoldFix(fixId) {
                this.releasePointer();
                if (!applyHoldRigFix(fixId)) showMessage('display_sensei.message.armor_fix_failed');
                this.syncCard();
            },
            setHoldWearerFrom(event) {
                setHeldWearer(event.target.value);
                this.handViewsKey = '';
                this.syncHoldView();
                this.syncHandViews();
                event.target.value = this.holdView.wearer;
            },
            async writeHolds() {
                this.releasePointer();
                if (this.holdBusy) return;
                this.holdBusy = true;
                let result;
                let onDone = later => {
                    this.syncCard();
                    this.syncHoldOutput(true);
                    this.showHoldWriteMessage(later);
                };
                try {
                    result = await writeHoldDisplay({ onDone });
                } catch (error) {
                    console.warn(LOG_PREFIX, 'Write display failed:', error);
                    result = { status: 'failed' };
                } finally {
                    this.holdBusy = false;
                }
                this.syncCard();
                this.syncHoldOutput(true);
                this.showHoldWriteMessage(result);
            },
            showHoldWriteMessage(result) {
                let key = result ? HOLD_WRITE_MESSAGES[result.status] : null;
                if (!key) return;
                let written = result.written && result.written.length ? result.written.map(entry => PathModule.basename(entry.path)).join(', ') : '';
                Blockbench.showQuickMessage(this.tf(key, { file: written }), QUICK_MESSAGE_MS);
            },
            async restoreHolds() {
                this.releasePointer();
                let path = this.getHoldBackupFile();
                if (!path || this.holdBusy) return;
                this.holdBusy = true;
                let result;
                try {
                    result = await restoreHoldFile(path);
                } finally {
                    this.holdBusy = false;
                }
                this.syncCard();
                this.syncHoldOutput(true);
                if (result && result.status === 'restored') showMessage('display_sensei.message.hold_restored');
                else if (result && result.status === 'failed') showMessage('display_sensei.message.hold_failed');
            },
            getFileName(path) {
                return String(path || '').split(/[\\/]/).pop();
            },
            clearTarget() {
                this.releasePointer();
                clearHoldTarget();
                this.syncHoldOutput(true);
            },
            copyHoldJson() {
                if (!this.holdJson) return;
                Clipbench.setText(this.holdJson);
                showMessage('display_sensei.message.hold_json_copied');
            },
            exportHoldJson() {
                try {
                    exportHoldAnimationFile();
                } catch (error) {
                    console.error(LOG_PREFIX, 'The hold export failed:', error);
                }
            },
            copyAttachableLines() {
                if (!this.holdAttachableLines) return;
                Clipbench.setText(this.holdAttachableLines);
                showMessage('display_sensei.message.hold_attachable_lines_copied');
            },
            setReference(referenceId) {
                if (this.slotState) setReferenceModel(this.slotState.id, referenceId);
                this.syncViewState();
            },
            onPoseAngle(event) {
                if (this.slotState) setPoseAngle(this.slotState.id, Number(event.target.value));
                this.syncViewState();
            },
            setPreviewAnimationFrom(event) {
                if (this.slotState) setPreviewAnimation(this.slotState.id, event.target.checked);
                this.syncViewState();
                event.target.checked = this.viewState.previewAnimation === true;
            },
            setReferenceOptionFrom(option, event) {
                let value = option.kind === 'toggle' ? event.target.checked : event.target.value;
                if (this.slotState) setReferenceOption(this.slotState.id, option.id, value);
                this.syncViewState();
                let current = this.viewState.options.concat(this.viewState.fitPreview || []).find(entry => entry.id === option.id);
                if (!current) return;
                if (option.kind === 'toggle') {
                    event.target.checked = current.value === true;
                } else {
                    event.target.value = String(current.value);
                }
            },
            openSkin() {
                openSkinDialog();
            },

            copySlot() {
                if (!this.slotState) return;
                this.releasePointer();
                if (this.isHoldEditor) {
                    if (copyHoldValues(this.slotState.id)) showMessage('display_sensei.message.hold_copied');
                    return;
                }
                let slotId = ensureContextShown(this.activeSubtabId, this.hand);
                if (slotId && copyShownSlot(slotId)) {
                    showMessage('display_sensei.message.slot_copied');
                }
            },
            pasteSlot() {
                if (!this.slotState) return;
                this.releasePointer();
                if (this.isHoldEditor) {
                    if (!hasCopiedHoldValues()) {
                        showMessage('display_sensei.message.hold_nothing_to_paste');
                        return;
                    }
                    pasteHoldValues(this.slotState.id);
                    this.syncCard();
                    return;
                }
                if (!hasCopiedSlot()) {
                    showMessage('display_sensei.message.nothing_to_paste');
                    return;
                }
                let slotId = ensureContextShown(this.activeSubtabId, this.hand);
                if (slotId) pasteIntoShownSlot(slotId);
            },
            savePreset() {
                if (!this.slotState) return;
                this.releasePointer();
                if (ensureContextShown(this.activeSubtabId, this.hand)) {
                    openSavePresetDialog();
                }
            },

            setVersion(event) {
                setGeometryVersion(event.target.value);
                this.syncCard();
                event.target.value = this.output ? this.output.selected : '';
            },
            copyOutput() {
                if (!this.output || !this.output.text) return;
                Clipbench.setText(this.output.text);
                showMessage('display_sensei.message.copied');
            },
            exportGeometry() {
                try {
                    let result = Codecs.bedrock.export();
                    if (result && typeof result.catch === 'function') {
                        result.catch(error => console.error(LOG_PREFIX, 'The geometry export failed:', error));
                    }
                } catch (error) {
                    console.error(LOG_PREFIX, 'The geometry export failed:', error);
                }
            },

            refreshLink() {
                forgetHoldFiles();
                refreshPackLink(Project);
            },
            showFileDates() {
                refreshFileDates(Project, true);
            },
            openLinkedFolder(which) {
                openPackFolder(which);
            },

            movePanelToFloat() {
                setPanelFloating(true);
            },
            movePanelToDock() {
                setPanelFloating(false);
            },
            movePanelToTab() {
                if (!setPanelTabbed()) {
                    showMessage('display_sensei.message.no_tab_host');
                }
            },
            closePanel() {
                destroyPanel();
            }
        }
    };
}

// =========================
// Panel creation and removal
// =========================
function createPanel() {
    if (panelInstance) {
        return panelInstance;
    }
    panelInstance = new Panel(PANEL_ID, {
        name: i18n('display_sensei.ui.title'),
        icon: PANEL_ICON,
        plugin: PLUGIN_ID,
        default_position: {
            slot: 'right_bar',
            float_position: [100, 60],
            float_size: [400, 880],
            height: 480,
            fixed_height: true,
            sidebar_index: 20
        },
        mode_positions: {
            [FILL_SIDEBAR_MODE_ID]: { fixed_height: false }
        },
        resizable: true,
        growable: true,
        min_height: 280,
        component: buildPanelComponent()
    });
    panelVue = panelInstance.vue;
    panelInstance.on('update', () => {
        if (!panelVue) return;
        panelVue.syncPanelMode();
        panelVue.onPanelShown();
        panelVue.syncPivotMarkers();
    });
    syncNativeDisplayPanel();
    return panelInstance;
}

function destroyPanel() {
    let panel = panelInstance;
    let vue = panelVue;
    if (!panel) return;
    panelInstance = null;
    panelVue = null;
    releaseAttachedPanels(panel);
    removeFromFloatingOrder(panel);
    if (vue) vue.$destroy();
    panel.delete();
    syncNativeDisplayPanel();
}

function refreshPanel() {
    if (panelVue) panelVue.refreshFromBlockbench();
}

const refreshPanelSafely = guardListener('panel refresh', () => refreshPanel());

// =========================
// Following edits made elsewhere
// =========================
const EDIT_SYNC_EVENTS = 'finished_edit undo redo';

const GESTURE_END_EVENTS = 'save_editor_state close_project unselect_project';

const SAVED_STATE_EVENT = 'saved_state_changed';

function installPanelSync() {
    return createDeletables([
        () => Blockbench.on(EDIT_SYNC_EVENTS, refreshPanelSafely),
        () => Blockbench.on(GESTURE_END_EVENTS, guardListener('gesture end', event => {
            if (panelVue) panelVue.endGestureOf(event && event.project);
        })),
        () => Blockbench.on(SAVED_STATE_EVENT, guardListener('saved state', event => {
            if (panelVue) panelVue.onProjectSaved(event);
        }))
    ]);
}

registerModuleInstaller('panel_sync', installPanelSync);
