// =========================
// Armor data (Armor tab)
// =========================

// =========================
// Wear slots
// =========================
const WEAR_SLOTS = [
    {
        id: 'slot.armor.head', label: 'display_sensei.subtab.armor_head', info: 'display_sensei.info.armor_head',
        wearableSlot: 'slot.armor.head', enchantableSlot: 'armor_head',
        layerVariable: 'variable.helmet_layer_visible',
        bones: ['head', 'hat'], flatPiece: 'helmet', displaySlot: 'head',
        support: { block: 'edit', attachable: 'armor', entity: 'mob' }
    },
    {
        id: 'slot.armor.chest', label: 'display_sensei.subtab.armor_chest', info: 'display_sensei.info.armor_chest',
        wearableSlot: 'slot.armor.chest', enchantableSlot: 'armor_torso',
        layerVariable: 'variable.chest_layer_visible',
        bones: ['body', 'rightArm', 'leftArm'], flatPiece: 'chestplate', displaySlot: null,
        support: { block: 'worn_body', attachable: 'armor', entity: 'mob' }
    },
    {
        id: 'slot.armor.legs', label: 'display_sensei.subtab.armor_legs', info: 'display_sensei.info.armor_legs',
        wearableSlot: 'slot.armor.legs', enchantableSlot: 'armor_legs',
        layerVariable: 'variable.leg_layer_visible',
        bones: ['body', 'rightLeg', 'leftLeg'], flatPiece: 'leggings', displaySlot: null,
        support: { block: 'worn_body', attachable: 'armor', entity: 'mob' }
    },
    {
        id: 'slot.armor.feet', label: 'display_sensei.subtab.armor_feet', info: 'display_sensei.info.armor_feet',
        wearableSlot: 'slot.armor.feet', enchantableSlot: 'armor_feet',
        layerVariable: 'variable.boot_layer_visible',
        bones: ['rightLeg', 'leftLeg'], flatPiece: 'boots', displaySlot: null,
        support: { block: 'worn_body', attachable: 'armor', entity: 'mob' }
    },
    {
        id: 'slot.weapon.offhand', label: 'display_sensei.subtab.armor_offhand', info: 'display_sensei.info.armor_offhand',
        wearableSlot: 'slot.weapon.offhand', enchantableSlot: null,
        layerVariable: null,
        bones: ['leftItem'], flatPiece: null, displaySlot: null,
        support: { block: 'offhand_pointer', attachable: 'offhand_pointer', entity: 'mob' }
    }
];

function findWearSlot(id) {
    return WEAR_SLOTS.find(slot => slot.id === id) || null;
}

const WEARER_BONE_NAMES = ['head', 'hat', 'body', 'rightArm', 'leftArm', 'rightLeg', 'leftLeg', 'leftItem'];

// =========================
// Table helpers
// =========================
function vanillaBone(pivot, parent, cubes = [], extras = {}) {
    return Object.assign({ pivot, parent, cubes }, extras);
}

function vanillaCube(origin, size, uv, inflate = 0, extras = {}) {
    return Object.assign({ origin, size, inflate, uv }, extras);
}

function freezeArmorData(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.freeze(value);
        for (let key of Object.keys(value)) freezeArmorData(value[key]);
    }
    return value;
}

// =========================
// Wearers: bone tables
// =========================
const PLAYER_WIDE_BONES = {
    root: vanillaBone([0, 0, 0], null),
    body: vanillaBone([0, 24, 0], 'waist', [vanillaCube([-4, 12, -2], [8, 12, 4], [16, 16])]),
    waist: vanillaBone([0, 12, 0], 'root'),
    head: vanillaBone([0, 24, 0], 'body', [vanillaCube([-4, 24, -4], [8, 8, 8], [0, 0])]),
    cape: vanillaBone([0, 24, 3], 'body'),
    hat: vanillaBone([0, 24, 0], 'head', [vanillaCube([-4, 24, -4], [8, 8, 8], [32, 0], 0.5, { layer: true })]),
    leftArm: vanillaBone([5, 22, 0], 'body', [vanillaCube([4, 12, -2], [4, 12, 4], [32, 48])]),
    leftSleeve: vanillaBone([5, 22, 0], 'leftArm', [vanillaCube([4, 12, -2], [4, 12, 4], [48, 48], 0.25, { layer: true })]),
    leftItem: vanillaBone([6, 15, 1], 'leftArm'),
    rightArm: vanillaBone([-5, 22, 0], 'body', [vanillaCube([-8, 12, -2], [4, 12, 4], [40, 16])]),
    rightSleeve: vanillaBone([-5, 22, 0], 'rightArm', [vanillaCube([-8, 12, -2], [4, 12, 4], [40, 32], 0.25, { layer: true })]),
    rightItem: vanillaBone([-6, 15, 1], 'rightArm'),
    leftLeg: vanillaBone([1.9, 12, 0], 'root', [vanillaCube([-0.1, 0, -2], [4, 12, 4], [16, 48])]),
    leftPants: vanillaBone([1.9, 12, 0], 'leftLeg', [vanillaCube([-0.1, 0, -2], [4, 12, 4], [0, 48], 0.25, { layer: true })]),
    rightLeg: vanillaBone([-1.9, 12, 0], 'root', [vanillaCube([-3.9, 0, -2], [4, 12, 4], [0, 16])]),
    rightPants: vanillaBone([-1.9, 12, 0], 'rightLeg', [vanillaCube([-3.9, 0, -2], [4, 12, 4], [0, 32], 0.25, { layer: true })]),
    jacket: vanillaBone([0, 24, 0], 'body', [vanillaCube([-4, 12, -2], [8, 12, 4], [16, 32], 0.25, { layer: true })])
};

const PLAYER_SLIM_BONES = {
    root: vanillaBone([0, 0, 0], null),
    waist: vanillaBone([0, 12, 0], 'root'),
    body: vanillaBone([0, 24, 0], 'waist', [vanillaCube([-4, 12, -2], [8, 12, 4], [16, 16])]),
    head: vanillaBone([0, 24, 0], 'body', [vanillaCube([-4, 24, -4], [8, 8, 8], [0, 0])]),
    hat: vanillaBone([0, 24, 0], 'head', [vanillaCube([-4, 24, -4], [8, 8, 8], [32, 0], 0.5, { layer: true })]),
    rightLeg: vanillaBone([-1.9, 12, 0], 'root', [vanillaCube([-3.9, 0, -2], [4, 12, 4], [0, 16])]),
    rightPants: vanillaBone([-1.9, 12, 0], 'rightLeg', [vanillaCube([-3.9, 0, -2], [4, 12, 4], [0, 32], 0.25, { layer: true })]),
    leftLeg: vanillaBone([1.9, 12, 0], 'root', [vanillaCube([-0.1, 0, -2], [4, 12, 4], [16, 48], 0, { mirror: true })]),
    leftPants: vanillaBone([1.9, 12, 0], 'leftLeg', [vanillaCube([-0.1, 0, -2], [4, 12, 4], [0, 48], 0.25, { layer: true })]),
    leftArm: vanillaBone([5, 21.5, 0], 'body', [vanillaCube([4, 11.5, -2], [3, 12, 4], [32, 48])]),
    leftSleeve: vanillaBone([5, 21.5, 0], 'leftArm', [vanillaCube([4, 11.5, -2], [3, 12, 4], [48, 48], 0.25, { layer: true })]),
    leftItem: vanillaBone([6, 14.5, 1], 'leftArm'),
    rightArm: vanillaBone([-5, 21.5, 0], 'body', [vanillaCube([-7, 11.5, -2], [3, 12, 4], [40, 16])]),
    rightSleeve: vanillaBone([-5, 21.5, 0], 'rightArm', [vanillaCube([-7, 11.5, -2], [3, 12, 4], [40, 32], 0.25, { layer: true })]),
    rightItem: vanillaBone([-6, 14.5, 1], 'rightArm'),
    jacket: vanillaBone([0, 24, 0], 'body', [vanillaCube([-4, 12, -2], [8, 12, 4], [16, 32], 0.25, { layer: true })]),
    cape: vanillaBone([0, 24, -3], 'body')
};

const ARMOR_STAND_BONES = {
    baseplate: vanillaBone([0, 0, 0], null, [vanillaCube([-6, 0, -6], [12, 1, 12], [0, 32])]),
    waist: vanillaBone([0, 12, 0], 'baseplate'),
    body: vanillaBone([0, 24, 0], 'waist', [
        vanillaCube([-6, 21, -1.5], [12, 3, 3], [0, 26]),
        vanillaCube([-3, 14, -1], [2, 7, 2], [16, 0]),
        vanillaCube([1, 14, -1], [2, 7, 2], [48, 16]),
        vanillaCube([-4, 12, -1], [8, 2, 2], [0, 48])
    ]),
    head: vanillaBone([0, 24, 0], 'body', [vanillaCube([-1, 24, -1], [2, 7, 2], [0, 0])]),
    hat: vanillaBone([0, 24, 0], 'head', [vanillaCube([-4, 24, -4], [8, 8, 8], [32, 0])]),
    leftarm: vanillaBone([5, 22, 0], 'body', [vanillaCube([5, 12, -1], [2, 12, 2], [32, 16], 0, { mirror: true })]),
    leftitem: vanillaBone([6, 15, 1], 'leftarm'),
    leftleg: vanillaBone([1.9, 12, 0], 'body', [vanillaCube([0.9, 1, -1], [2, 11, 2], [40, 16], 0, { mirror: true })]),
    rightarm: vanillaBone([-5, 22, 0], 'body', [vanillaCube([-7, 12, -1], [2, 12, 2], [24, 0])]),
    rightitem: vanillaBone([-6, 15, 1], 'rightarm'),
    rightleg: vanillaBone([-1.9, 12, 0], 'body', [vanillaCube([-2.9, 1, -1], [2, 11, 2], [8, 0])])
};

const ZOMBIE_BONES = {
    body: vanillaBone([0, 24, 0], 'waist', [vanillaCube([-4, 12, -2], [8, 12, 4], [16, 16])]),
    waist: vanillaBone([0, 12, 0], null, [], { neverRender: true }),
    head: vanillaBone([0, 24, 0], 'body', [vanillaCube([-4, 24, -4], [8, 8, 8], [0, 0])]),
    hat: vanillaBone([0, 24, 0], 'head', [vanillaCube([-4, 24, -4], [8, 8, 8], [32, 0], 0.5)], { neverRender: true }),
    rightArm: vanillaBone([-5, 22, 0], 'body', [vanillaCube([-8, 12, -2], [4, 12, 4], [40, 16])]),
    rightItem: vanillaBone([-6, 15, 1], 'rightArm', [], { neverRender: true }),
    leftArm: vanillaBone([5, 22, 0], 'body', [vanillaCube([4, 12, -2], [4, 12, 4], [40, 16], 0, { mirror: true })]),
    leftItem: vanillaBone([6, 15, 1], 'leftArm', [], { neverRender: true }),
    rightLeg: vanillaBone([-1.9, 12, 0], 'body', [vanillaCube([-3.9, 0, -2], [4, 12, 4], [0, 16])]),
    leftLeg: vanillaBone([1.9, 12, 0], 'body', [vanillaCube([-0.1, 0, -2], [4, 12, 4], [0, 16], 0, { mirror: true })])
};

const DROWNED_BONES = {
    body: vanillaBone([0, 24, 0], null, [vanillaCube([-4, 12, -2], [8, 12, 4], [16, 16])]),
    jacket: vanillaBone([0, 24, 0], 'body', [vanillaCube([-4, 12, -2], [8, 12, 4], [16, 32], 0.5, { layer: true })]),
    head: vanillaBone([0, 24, 0], 'body', [vanillaCube([-4, 24, -4], [8, 8, 8], [0, 0], 0.5)]),
    hat: vanillaBone([0, 24, 0], 'head', [vanillaCube([-4, 24, -4], [8, 8, 8], [32, 0], 1.0, { layer: true })]),
    rightArm: vanillaBone([-5, 22, 0], 'body', [vanillaCube([-8, 12, -2], [4, 12, 4], [0, 16])]),
    rightSleeve: vanillaBone([-5, 22, 0], 'rightArm', [vanillaCube([-8, 12, -2], [4, 12, 4], [48, 48], 0.5, { layer: true })]),
    rightItem: vanillaBone([-6, 15, 1], 'rightArm'),
    leftArm: vanillaBone([5, 22, 0], 'body', [vanillaCube([4, 12, -2], [4, 12, 4], [40, 16], 0, { mirror: true })]),
    leftSleeve: vanillaBone([5, 22, 0], 'leftArm', [vanillaCube([4, 12, -2], [4, 12, 4], [40, 32], 0.5, { mirror: true, layer: true })]),
    leftItem: vanillaBone([6, 15, 1], 'leftArm'),
    rightLeg: vanillaBone([-1.9, 12, 0], 'body', [vanillaCube([-4.05, 0, -2], [4, 12, 4], [16, 48])]),
    rightPants: vanillaBone([-1.9, 12, 0], 'rightLeg', [vanillaCube([-4.25, 0, -2], [4, 12, 4], [0, 48], 0.25, { layer: true })]),
    leftLeg: vanillaBone([1.9, 12, 0], 'body', [vanillaCube([0.05, 0, -2], [4, 12, 4], [32, 48], 0, { mirror: true })]),
    leftPants: vanillaBone([1.9, 12, 0], 'leftLeg', [vanillaCube([0.25, 0, -2], [4, 12, 4], [0, 32], 0.25, { mirror: true, layer: true })]),
    waist: vanillaBone([0, 12, 0], 'body')
};

const SKELETON_BONES = {
    body: vanillaBone([0, 24, 0], 'waist', [vanillaCube([-4, 12, -2], [8, 12, 4], [16, 16])]),
    waist: vanillaBone([0, 12, 0], null),
    head: vanillaBone([0, 24, 0], 'body', [vanillaCube([-4, 24, -4], [8, 8, 8], [0, 0])]),
    hat: vanillaBone([0, 24, 0], 'head', [vanillaCube([-4, 24, -4], [8, 8, 8], [32, 0], 0.5)], { neverRender: true }),
    rightArm: vanillaBone([-5, 22, 0], 'body', [vanillaCube([-6, 12, -1], [2, 12, 2], [40, 16])]),
    rightItem: vanillaBone([-6, 15, 1], 'rightArm', [], { neverRender: true }),
    leftArm: vanillaBone([5, 22, 0], 'body', [vanillaCube([4, 12, -1], [2, 12, 2], [40, 16], 0, { mirror: true })]),
    leftItem: vanillaBone([6, 15, 1], 'leftArm', [], { neverRender: true }),
    rightLeg: vanillaBone([-2, 12, 0], 'body', [vanillaCube([-3, 0, -1], [2, 12, 2], [0, 16])]),
    leftLeg: vanillaBone([2, 12, 0], 'body', [vanillaCube([1, 0, -1], [2, 12, 2], [0, 16], 0, { mirror: true })])
};

const WITHER_SKELETON_BONES = Object.assign({}, SKELETON_BONES, {
    rightItem: vanillaBone([-5, 15, 1], 'rightArm', [], { neverRender: true })
});

const BOGGED_BONES = {
    waist: vanillaBone([0, 12, 0], null),
    body: vanillaBone([0, 24, 0], 'waist', [vanillaCube([-4, 12, -2], [8, 12, 4], [16, 16])]),
    head: vanillaBone([0, 24, 0], 'body', [vanillaCube([-4, 24, -4], [8, 8, 8], [0, 0])]),
    mushrooms: vanillaBone([3, 31.5, 3], 'head', [
        vanillaCube([-6, 31, -3], [6, 4, 0], [50, 22], 0, { pivot: [-3, 32.5, -3], rotation: [0, -45, 0] }),
        vanillaCube([-6, 31, -3], [6, 4, 0], [50, 22], 0, { pivot: [-3, 32.5, -3], rotation: [0, 45, 0] }),
        vanillaCube([0, 31, 3], [6, 4, 0], [50, 16], 0, { pivot: [3, 31.5, 3], rotation: [0, 45, 0] }),
        vanillaCube([0, 31, 3], [6, 4, 0], [50, 16], 0, { pivot: [3, 31.5, 3], rotation: [0, -45, 0] }),
        vanillaCube([-5, 25, 3], [6, 5, 0], [50, 27], 0, { pivot: [-2, 25, 3], rotation: [-90, 0, 45] }),
        vanillaCube([-5, 25, 3], [6, 5, 0], [50, 27], 0, { pivot: [-2, 25, 3], rotation: [-90, 0, 135] })
    ]),
    hat: vanillaBone([0, 24, 0], 'head', [vanillaCube([-4, 24, -4], [8, 8, 8], [32, 0], 0.2, { layer: true })]),
    rightArm: vanillaBone([-5, 22, 0], 'body', [vanillaCube([-6, 12, -1], [2, 12, 2], [40, 16])]),
    rightItem: vanillaBone([-6, 15, 1], 'rightArm'),
    leftArm: vanillaBone([5, 22, 0], 'body', [vanillaCube([4, 12, -1], [2, 12, 2], [40, 16], 0, { mirror: true })]),
    leftItem: vanillaBone([6, 15, 1], 'leftArm'),
    rightLeg: vanillaBone([-2, 12, 0], 'body', [vanillaCube([-3, 0, -1], [2, 12, 2], [0, 16])]),
    leftLeg: vanillaBone([2, 12, 0], 'body', [vanillaCube([1, 0, -1], [2, 12, 2], [0, 16], 0, { mirror: true })])
};

const SKELETON_OVERLAY_BONES = {
    body: vanillaBone([0, 24, 0], 'waist', [vanillaCube([-4, 12, -2], [8, 12, 4], [16, 16], 0.25, { layer: true })]),
    waist: vanillaBone([0, 12, 0], null, [], { neverRender: true }),
    head: vanillaBone([0, 24, 0], 'body', [vanillaCube([-4, 24, -4], [8, 8, 8], [0, 0], 0.25, { layer: true })]),
    rightArm: vanillaBone([-5, 22, 0], 'body', [vanillaCube([-8, 12, -2], [4, 12, 4], [40, 16], 0.25, { layer: true })]),
    leftArm: vanillaBone([5, 22, 0], 'body', [vanillaCube([4, 12, -2], [4, 12, 4], [40, 16], 0.25, { mirror: true, layer: true })]),
    rightLeg: vanillaBone([-1.9, 12, 0], 'body', [vanillaCube([-3.9, 0, -2], [4, 12, 4], [0, 16], 0.25, { layer: true })]),
    leftLeg: vanillaBone([1.9, 12, 0], 'body', [vanillaCube([-0.1, 0, -2], [4, 12, 4], [0, 16], 0.25, { mirror: true, layer: true })])
};

const PIGLIN_BONES = {
    body: vanillaBone([0, 24, 0], null, [
        vanillaCube([-4, 12, -2], [8, 12, 4], [16, 16]),
        vanillaCube([-4, 12, -2], [8, 12, 4], [16, 32], 0.25, { layer: true })
    ]),
    head: vanillaBone([0, 24, 0], 'body', [
        vanillaCube([-5, 24, -4], [10, 8, 8], [0, 0], -0.02),
        vanillaCube([-2, 24, -5], [4, 4, 1], [31, 1], -0.02),
        vanillaCube([2, 24, -5], [1, 2, 1], [2, 4], -0.02),
        vanillaCube([-3, 24, -5], [1, 2, 1], [2, 0], -0.02)
    ]),
    leftear: vanillaBone([5, 30, 0], 'head', [vanillaCube([4, 25, -2], [1, 5, 4], [51, 6])], { rotation: [0, 0, -30] }),
    rightear: vanillaBone([-5, 30, 0], 'head', [vanillaCube([-5, 25, -2], [1, 5, 4], [39, 6])], { rotation: [0, 0, 30] }),
    hat: vanillaBone([0, 24, 0], 'head'),
    rightarm: vanillaBone([-5, 22, 0], 'body', [
        vanillaCube([-8, 12, -2], [4, 12, 4], [40, 16]),
        vanillaCube([-8, 12, -2], [4, 12, 4], [40, 32], 0.25, { layer: true })
    ]),
    rightItem: vanillaBone([-6, 15, 1], 'rightarm'),
    leftarm: vanillaBone([5, 22, 0], 'body', [
        vanillaCube([4, 12, -2], [4, 12, 4], [32, 48]),
        vanillaCube([4, 12, -2], [4, 12, 4], [48, 48], 0.25, { layer: true })
    ]),
    leftItem: vanillaBone([6, 15, 1], 'leftarm'),
    rightleg: vanillaBone([-1.9, 12, 0], 'body', [
        vanillaCube([-4, 0, -2], [4, 12, 4], [0, 16]),
        vanillaCube([-4, 0, -2], [4, 12, 4], [0, 32], 0.25, { layer: true })
    ]),
    leftleg: vanillaBone([1.9, 12, 0], 'body', [
        vanillaCube([0, 0, -2], [4, 12, 4], [16, 48]),
        vanillaCube([0, 0, -2], [4, 12, 4], [0, 48], 0.25, { layer: true })
    ])
};

const PILLAGER_BONES = {
    head: vanillaBone([0, 24, 0], 'body', [vanillaCube([-4, 24, -4], [8, 10, 8], [0, 0])]),
    nose: vanillaBone([0, 26, 0], 'head', [vanillaCube([-1, 23, -6], [2, 4, 2], [24, 0])]),
    body: vanillaBone([0, 0, 0], 'waist', [
        vanillaCube([-4, 12, -3], [8, 12, 6], [16, 20]),
        vanillaCube([-4, 6, -3], [8, 18, 6], [0, 38], 0.5)
    ]),
    waist: vanillaBone([0, 12, 0], null, [], { neverRender: true }),
    leftLeg: vanillaBone([2, 12, 0], 'body', [vanillaCube([0, 0, -2], [4, 12, 4], [0, 22])]),
    rightLeg: vanillaBone([-2, 12, 0], 'body', [vanillaCube([-4, 0, -2], [4, 12, 4], [0, 22], 0, { mirror: true })]),
    rightarm: vanillaBone([-5, 22, 0], 'body', [vanillaCube([-8, 12, -2], [4, 12, 4], [40, 46])]),
    rightItem: vanillaBone([-6, 15, 1], 'rightarm', [], { neverRender: true }),
    leftarm: vanillaBone([5, 22, 0], 'body', [vanillaCube([4, 12, -2], [4, 12, 4], [40, 46], 0, { mirror: true })]),
    leftItem: vanillaBone([6, 15, 1], 'leftarm', [], { neverRender: true })
};

const VINDICATOR_BONES = {
    head: vanillaBone([0, 24, 0], 'body', [vanillaCube([-4, 24, -4], [8, 10, 8], [0, 0])]),
    nose: vanillaBone([0, 26, 0], 'head', [vanillaCube([-1, 23, -6], [2, 4, 2], [24, 0])]),
    body: vanillaBone([0, 24, 0], null, [
        vanillaCube([-4, 12, -3], [8, 12, 6], [16, 20]),
        vanillaCube([-4, 6, -3], [8, 18, 6], [0, 38], 0.5)
    ]),
    arms: vanillaBone([0, 22, 0], 'body', [
        vanillaCube([-8, 16, -2], [4, 8, 4], [44, 22]),
        vanillaCube([4, 16, -2], [4, 8, 4], [44, 22]),
        vanillaCube([-4, 16, -2], [8, 4, 4], [40, 38])
    ]),
    leg0: vanillaBone([-2, 12, 0], 'body', [vanillaCube([-4, 0, -2], [4, 12, 4], [0, 22])]),
    leg1: vanillaBone([2, 12, 0], 'body', [vanillaCube([0, 0, -2], [4, 12, 4], [0, 22], 0, { mirror: true })]),
    rightArm: vanillaBone([-5, 22, 0], 'body', [vanillaCube([-8, 12, -2], [4, 12, 4], [40, 46])]),
    rightItem: vanillaBone([-5.5, 16, 0.5], 'rightArm', [], { neverRender: true }),
    leftArm: vanillaBone([5, 22, 0], 'body', [vanillaCube([4, 12, -2], [4, 12, 4], [40, 46], 0, { mirror: true })]),
    leftItem: vanillaBone([6, 15, 1], 'leftArm', [], { neverRender: true })
};

const ZOMBIE_VILLAGER_BONES = {
    head: vanillaBone([0, 24, 0], 'body', [
        vanillaCube([-4, 24, -4], [8, 10, 8], [0, 0], 0.25),
        vanillaCube([-1, 23, -6], [2, 4, 2], [24, 0], 0.25)
    ]),
    helmet: vanillaBone([0, 24, 0], 'head', [vanillaCube([-4, 24, -4], [8, 10, 8], [32, 0], 0.5, { layer: true })]),
    brim: vanillaBone([0, 24, 0], 'head', [vanillaCube([-8, 16, -6], [16, 16, 1], [30, 47], 0.1, { layer: true })], { rotation: [-90, 0, 0] }),
    body: vanillaBone([0, 24, 0], 'waist', [
        vanillaCube([-4, 12, -3], [8, 12, 6], [16, 20]),
        vanillaCube([-4, 6, -3], [8, 18, 6], [0, 38], 0.5)
    ]),
    waist: vanillaBone([0, 12, 0], null, [], { neverRender: true }),
    rightArm: vanillaBone([-5, 22, 0], 'body', [vanillaCube([-8, 12, -2], [4, 12, 4], [44, 22])]),
    rightItem: vanillaBone([-6, 15, 1], 'rightArm', [], { neverRender: true }),
    leftArm: vanillaBone([5, 22, 0], 'body', [vanillaCube([4, 12, -2], [4, 12, 4], [44, 22], 0, { mirror: true })]),
    leftItem: vanillaBone([6, 15, 1], 'leftArm', [], { neverRender: true }),
    rightLeg: vanillaBone([-2, 12, 0], 'body', [vanillaCube([-4, 0, -2], [4, 12, 4], [0, 22])]),
    leftLeg: vanillaBone([2, 12, 0], 'body', [vanillaCube([0, 0, -2], [4, 12, 4], [0, 22], 0, { mirror: true })])
};

const BABY_ZOMBIE_BONES = {
    Body: vanillaBone([0, 6.5, 0], null, [vanillaCube([-2, 4, -1], [4, 5, 2], [16, 16])]),
    Head: vanillaBone([0, 8.75, 0], 'Body', [
        vanillaCube([-3, 9, -3], [6, 6, 6], [3, 3]),
        vanillaCube([-3, 8.9, -3], [6, 6, 6], [35, 3], 0.25, { layer: true })
    ]),
    rightArm: vanillaBone([-3, 8.5, 0], 'Body', [vanillaCube([-4, 4, -1], [2, 5, 2], [36, 16])]),
    rightItem: vanillaBone([-3, 6.5, 0], 'rightArm'),
    leftArm: vanillaBone([3, 8.5, 0], 'Body', [vanillaCube([2, 4, -1], [2, 5, 2], [28, 16])]),
    leftItem: vanillaBone([3, 6.5, 0], 'leftArm'),
    rightLeg: vanillaBone([-1, 4, 0], 'Body', [vanillaCube([-2, 0, -1], [2, 4, 2], [8, 16])]),
    leftLeg: vanillaBone([1, 4, 0], 'Body', [vanillaCube([0, 0, -1], [2, 4, 2], [0, 16])])
};

const COPPER_GOLEM_BONES = {
    root: vanillaBone([1, 0, 0], null),
    body: vanillaBone([0, 5, 0], 'root', [vanillaCube([-4, 5, -3], [8, 6, 6], [0, 15])]),
    head: vanillaBone([0, 11, 0], 'body', [
        vanillaCube([-4, 11, -5], [8, 5, 10], [0, 0]),
        vanillaCube([-1, 10, -6], [2, 3, 2], [56, 0]),
        vanillaCube([-1, 16, -1], [2, 4, 2], [37, 8], -0.01),
        vanillaCube([-2, 20, -2], [4, 4, 4], [37, 0], -0.01)
    ]),
    right_arm: vanillaBone([-4, 11, 0], 'body', [vanillaCube([-7, 2, -2], [3, 10, 4], [36, 16])]),
    rightItem: vanillaBone([-5, 3.6, -1], 'right_arm'),
    left_arm: vanillaBone([4, 11, 0], 'body', [vanillaCube([4, 2, -2], [3, 10, 4], [50, 16])]),
    right_leg: vanillaBone([-2, 5, 0], 'root', [vanillaCube([-3.9, 0, -1.99], [4, 5, 4], [0, 27])]),
    left_leg: vanillaBone([2, 5, 0], 'root', [vanillaCube([-0.1, 0, -2], [4, 5, 4], [16, 27])])
};

// =========================
// Wearers
// =========================
const WEARER_RIGS = [
    {
        id: 'player_wide', label: 'display_sensei.wearer.player_wide',
        geometry: 'geometry.humanoid.custom',
        scale: PLAYER_ENTITY_SCALE,
        texture: 'assets/player_skin.png',
        textureSize: [64, 64],
        bones: PLAYER_WIDE_BONES,
        outerLayers: { head: 0.5, hat: 0.5, body: 0.25, rightArm: 0.25, leftArm: 0.25, rightLeg: 0.25, leftLeg: 0.25 },
        missing: []
    },
    {
        id: 'player_slim', label: 'display_sensei.wearer.player_slim',
        geometry: 'geometry.humanoid.customSlim',
        scale: PLAYER_ENTITY_SCALE,
        texture: 'assets/player_skin.png',
        textureSize: [64, 64],
        bones: PLAYER_SLIM_BONES,
        outerLayers: { head: 0.5, hat: 0.5, body: 0.25, rightArm: 0.25, leftArm: 0.25, rightLeg: 0.25, leftLeg: 0.25 },
        missing: []
    },
    {
        id: 'armor_stand', label: 'display_sensei.wearer.armor_stand',
        geometry: 'geometry.armor_stand',
        scale: 1,
        texture: 'assets/armor_stand.png',
        textureSize: [64, 64],
        bones: ARMOR_STAND_BONES,
        outerLayers: {},
        missing: []
    },
    {
        id: 'zombie', label: 'display_sensei.wearer.zombie',
        geometry: 'geometry.zombie.v1.8',
        scale: 1,
        texture: 'assets/zombie.png',
        textureSize: [64, 32],
        bones: ZOMBIE_BONES,
        outerLayers: {},
        missing: []
    },
    {
        id: 'husk', label: 'display_sensei.wearer.husk',
        geometry: 'geometry.zombie.husk.v1.8',
        scale: 1,
        texture: null,
        textureSize: [64, 32],
        bones: ZOMBIE_BONES,
        outerLayers: {},
        missing: []
    },
    {
        id: 'drowned', label: 'display_sensei.wearer.drowned',
        geometry: 'geometry.zombie.drowned.v1.16',
        scale: 1,
        texture: null,
        textureSize: [64, 64],
        bones: DROWNED_BONES,
        outerLayers: { head: 1.0, hat: 1.0, body: 0.5, rightArm: 0.5, leftArm: 0.5, rightLeg: 0.25, leftLeg: 0.25 },
        missing: []
    },
    {
        id: 'skeleton', label: 'display_sensei.wearer.skeleton',
        geometry: 'geometry.skeleton.v1.8',
        scale: 1,
        texture: null,
        textureSize: [64, 32],
        bones: SKELETON_BONES,
        outerLayers: {},
        missing: []
    },
    {
        id: 'stray', label: 'display_sensei.wearer.stray',
        geometry: 'geometry.skeleton.stray.v1.8',
        scale: 1,
        texture: null,
        textureSize: [64, 32],
        bones: SKELETON_BONES,
        outerLayers: { head: 0.25, hat: 0.25, body: 0.25, rightArm: 0.25, leftArm: 0.25, rightLeg: 0.25, leftLeg: 0.25 },
        missing: [],
        overlay: { geometry: 'geometry.stray.armor.v1.8', bones: SKELETON_OVERLAY_BONES }
    },
    {
        id: 'wither_skeleton', label: 'display_sensei.wearer.wither_skeleton',
        geometry: 'geometry.skeleton.wither.v1.8',
        scale: 1,
        texture: null,
        textureSize: [64, 32],
        bones: WITHER_SKELETON_BONES,
        outerLayers: {},
        missing: []
    },
    {
        id: 'bogged', label: 'display_sensei.wearer.bogged',
        geometry: 'geometry.skeleton.bogged',
        scale: 1,
        texture: null,
        textureSize: [64, 32],
        bones: BOGGED_BONES,
        outerLayers: { head: 0.25, hat: 0.25, body: 0.25, rightArm: 0.25, leftArm: 0.25, rightLeg: 0.25, leftLeg: 0.25 },
        missing: [],
        overlay: { geometry: 'geometry.bogged.armor', bones: SKELETON_OVERLAY_BONES }
    },
    {
        id: 'piglin', label: 'display_sensei.wearer.piglin',
        geometry: 'geometry.piglin',
        scale: 1,
        texture: null,
        textureSize: [64, 64],
        bones: PIGLIN_BONES,
        outerLayers: { body: 0.25, rightArm: 0.25, leftArm: 0.25, rightLeg: 0.25, leftLeg: 0.25 },
        missing: []
    },
    {
        id: 'piglin_brute', label: 'display_sensei.wearer.piglin_brute',
        geometry: 'geometry.piglin',
        scale: 1,
        texture: null,
        textureSize: [64, 64],
        bones: PIGLIN_BONES,
        outerLayers: { body: 0.25, rightArm: 0.25, leftArm: 0.25, rightLeg: 0.25, leftLeg: 0.25 },
        missing: []
    },
    {
        id: 'zombie_pigman', label: 'display_sensei.wearer.zombie_pigman',
        geometry: 'geometry.piglin',
        scale: 1,
        texture: null,
        textureSize: [64, 64],
        bones: PIGLIN_BONES,
        outerLayers: { body: 0.25, rightArm: 0.25, leftArm: 0.25, rightLeg: 0.25, leftLeg: 0.25 },
        missing: []
    },
    {
        id: 'pillager', label: 'display_sensei.wearer.pillager',
        geometry: 'geometry.pillager',
        scale: 1,
        texture: null,
        textureSize: [64, 64],
        bones: PILLAGER_BONES,
        outerLayers: { body: 0.5, rightLeg: 0.5, leftLeg: 0.5 },
        missing: ['hat'],
        hideArmor: true
    },
    {
        id: 'vindicator', label: 'display_sensei.wearer.vindicator',
        geometry: 'geometry.vindicator.v1.8',
        scale: 0.9375,
        texture: null,
        textureSize: [64, 64],
        bones: VINDICATOR_BONES,
        outerLayers: { body: 0.5 },
        missing: ['hat', 'rightLeg', 'leftLeg'],
        hideArmor: true
    },
    {
        id: 'zombie_villager', label: 'display_sensei.wearer.zombie_villager',
        geometry: 'geometry.zombie.villager_v2',
        scale: 1,
        texture: null,
        textureSize: [64, 64],
        bones: ZOMBIE_VILLAGER_BONES,
        outerLayers: { head: 0.5, body: 0.5, rightLeg: 0.5, leftLeg: 0.5 },
        missing: ['hat']
    },
    {
        id: 'baby_zombie', label: 'display_sensei.wearer.baby_zombie',
        geometry: 'geometry.zombie.baby',
        scale: 1,
        texture: null,
        textureSize: [64, 64],
        bones: BABY_ZOMBIE_BONES,
        outerLayers: { head: 0.25 },
        missing: ['hat'],
        baby: true
    },
    {
        id: 'copper_golem', label: 'display_sensei.wearer.copper_golem',
        geometry: 'geometry.copper_golem',
        scale: 1,
        texture: null,
        textureSize: [64, 64],
        bones: COPPER_GOLEM_BONES,
        outerLayers: {},
        missing: ['hat', 'rightArm', 'leftArm', 'rightLeg', 'leftLeg', 'leftItem']
    }
];

function findWearerRig(id) {
    return WEARER_RIGS.find(rig => rig.id === id) || null;
}

function findRigBoneName(rig, boneName) {
    if (!rig || typeof boneName !== 'string') return null;
    let wanted = boneName.toLowerCase();
    return Object.keys(rig.bones).find(name => name.toLowerCase() === wanted) || null;
}

// =========================
// Vanilla armor
// =========================
const HUMANOID_ARMOR_SHAPES = {
    head: { pivot: [0, 24, 0], origin: [-4, 24, -4], size: [8, 8, 8], uv: [0, 0] },
    hat: { pivot: [0, 24, 0], origin: [-4, 24, -4], size: [8, 8, 8], uv: [32, 0] },
    body: { pivot: [0, 24, 0], origin: [-4, 12, -2], size: [8, 12, 4], uv: [16, 16] },
    rightArm: { pivot: [-5, 22, 0], origin: [-8, 12, -2], size: [4, 12, 4], uv: [40, 16] },
    leftArm: { pivot: [5, 22, 0], origin: [4, 12, -2], size: [4, 12, 4], uv: [40, 16], mirror: true },
    rightLeg: { pivot: [-1.9, 12, 0], origin: [-3.9, 0, -2], size: [4, 12, 4], uv: [0, 16] },
    leftLeg: { pivot: [1.9, 12, 0], origin: [-0.1, 0, -2], size: [4, 12, 4], uv: [0, 16], mirror: true }
};

const ARMOR1_INFLATES = { head: 1.0, hat: 1.5, body: 1.01, rightArm: 1.0, leftArm: 1.0, rightLeg: 1.0, leftLeg: 1.0 };
const ARMOR2_INFLATES = { head: 0.5, body: 0.5, rightArm: 0.5, leftArm: 0.5, rightLeg: 0.49, leftLeg: 0.49 };

function flatArmorBones(boneNames, inflates) {
    let bones = {};
    for (let name of boneNames) {
        let shape = HUMANOID_ARMOR_SHAPES[name];
        let extras = shape.mirror ? { mirror: true } : {};
        bones[name] = vanillaBone(shape.pivot, null, [vanillaCube(shape.origin, shape.size, shape.uv, inflates[name], extras)]);
    }
    return bones;
}

const FLAT_ARMOR = {
    helmet: {
        geometry: 'geometry.humanoid.armor.helmet',
        playerGeometry: 'geometry.player.armor.helmet',
        textureWidth: 64, textureHeight: 32,
        layer: '_1',
        bones: flatArmorBones(['head', 'hat'], ARMOR1_INFLATES),
        approximate: true
    },
    chestplate: {
        geometry: 'geometry.humanoid.armor.chestplate',
        playerGeometry: 'geometry.player.armor.chestplate',
        textureWidth: 64, textureHeight: 32,
        layer: '_1',
        bones: flatArmorBones(['body', 'rightArm', 'leftArm'], ARMOR1_INFLATES)
    },
    leggings: {
        geometry: 'geometry.humanoid.armor.leggings',
        playerGeometry: 'geometry.player.armor.leggings',
        textureWidth: 64, textureHeight: 32,
        layer: '_2',
        bones: flatArmorBones(['body', 'rightLeg', 'leftLeg'], ARMOR2_INFLATES)
    },
    boots: {
        geometry: 'geometry.humanoid.armor.boots',
        playerGeometry: 'geometry.player.armor.boots',
        textureWidth: 64, textureHeight: 32,
        layer: '_1',
        bones: flatArmorBones(['rightLeg', 'leftLeg'], ARMOR1_INFLATES)
    }
};

const FLAT_ARMOR_BABY = {
    helmet: {
        geometry: 'geometry.humanoid.baby.armor.helmet',
        textureWidth: 64, textureHeight: 64,
        layer: '_baby',
        bones: {
            armor1: vanillaBone([0, 0, 0], null),
            Head: vanillaBone([0, 9, 0.5], 'armor1', [vanillaCube([-4.5, 9, -4], [9, 8, 8.3], [0, 0], 0.3)])
        }
    },
    chestplate: {
        geometry: 'geometry.humanoid.baby.armor.chestplate',
        textureWidth: 64, textureHeight: 64,
        layer: '_baby',
        bones: {
            armor1: vanillaBone([0, 0, 0], null),
            Body: vanillaBone([0, 6, 0], 'armor1', [vanillaCube([-3, 4, -1], [6, 5, 3], [0, 17], 0.3)]),
            RightArm: vanillaBone([-4, 9, 0.5], 'armor1', [vanillaCube([-5, 4.3, -0.97], [2, 5, 3], [30, 25], 0.3)]),
            LeftArm: vanillaBone([4, 9, 0.5], 'armor1', [vanillaCube([3, 4.3, -1.03], [2, 5, 3], [30, 17], 0.3)])
        }
    },
    leggings: {
        geometry: 'geometry.humanoid.baby.armor.leggings',
        textureWidth: 64, textureHeight: 64,
        layer: '_baby',
        bones: {
            armor2: vanillaBone([0, 0, 0], null),
            Body: vanillaBone([0, 6, 0], 'armor2', [vanillaCube([-3, 4, -1.5], [6, 5, 3], [0, 33], 0.27)]),
            RightLeg: vanillaBone([-1.5, 4, 0.5], 'armor2', [vanillaCube([-3, 0.2, -1], [3, 4, 3], [18, 17], 0.3)]),
            LeftLeg: vanillaBone([1.5, 4, 0.5], 'armor2', [vanillaCube([0, 0.2, -1.002], [3, 4, 3], [18, 24], 0.3)])
        }
    },
    boots: {
        geometry: 'geometry.humanoid.baby.armor.boots',
        textureWidth: 64, textureHeight: 64,
        layer: '_baby',
        bones: {
            armor1: vanillaBone([0, 0, 0], null),
            RightLeg: vanillaBone([-1.5, 4, 0.5], 'armor1', [vanillaCube([-3, 0.21, -1.004], [3, 1, 3], [0, 25], 0.5, { mirror: true })]),
            LeftLeg: vanillaBone([1.5, 4, 0.5], 'armor1', [vanillaCube([0, 0.2, -1.002], [3, 1, 3], [0, 29], 0.5)])
        }
    }
};

// =========================
// Bone names
// =========================
const BONE_ALIASES = {
    head: 'head', helm: 'head',
    hat: 'hat', hatlayer: 'hat', headlayer: 'hat', headwear: 'hat', headoverlay: 'hat',
    body: 'body', torso: 'body', chest: 'body', chestplate: 'body',
    rightarm: 'rightArm', armright: 'rightArm', rarm: 'rightArm', armr: 'rightArm',
    leftarm: 'leftArm', armleft: 'leftArm', larm: 'leftArm', arml: 'leftArm',
    rightleg: 'rightLeg', legright: 'rightLeg', rleg: 'rightLeg', legr: 'rightLeg', rightfoot: 'rightLeg', footright: 'rightLeg',
    leftleg: 'leftLeg', legleft: 'leftLeg', lleg: 'leftLeg', legl: 'leftLeg', leftfoot: 'leftLeg', footleft: 'leftLeg',
    leftitem: 'leftItem', itemleft: 'leftItem', offhand: 'leftItem'
};

function normalizeWearerBoneName(name) {
    return String(name).toLowerCase().replace(/[\s_-]+/g, '');
}

function findCanonicalWearerBone(name) {
    return BONE_ALIASES[normalizeWearerBoneName(name)] || null;
}

const RESERVED_MARKER_BONES = [
    'helmet', 'bodyArmor', 'belt',
    'rightArmArmor', 'leftArmArmor',
    'rightLegging', 'leftLegging',
    'rightBoot', 'leftBoot',
    'rightSock', 'leftSock'
];
const RESERVED_MARKER_WEARERS = ['player_wide', 'player_slim'];

// =========================
// Pose tests
// =========================
const WALK_SWING = 57.3 * 0.5;
const WALK_LEG_FACTOR = 1.4;

const RAISED_ARM_WEARERS = ['zombie', 'husk', 'zombie_pigman', 'zombie_villager', 'baby_zombie'];

const POSE_TESTS = [
    {
        id: 'walk', label: 'display_sensei.pose_test.walk', wearers: 'humanoid', chosen: true,
        bones: {
            rightArm: [-WALK_SWING, 0, 0],
            leftArm: [WALK_SWING, 0, 0],
            rightLeg: [WALK_SWING * WALK_LEG_FACTOR, 0.1, 0.1],
            leftLeg: [-WALK_SWING * WALK_LEG_FACTOR, -0.1, -0.1]
        },
        overrides: [{ wearers: RAISED_ARM_WEARERS, bones: { rightArm: ZOMBIE_ARMS.right.slice(), leftArm: ZOMBIE_ARMS.left.slice() } }]
    },
    {
        id: 'sneak', label: 'display_sensei.pose_test.sneak', wearers: ['player_wide', 'player_slim'], chosen: false,
        root: { pivot: SNEAK_PARENTS[0].pivot.slice(), position: SNEAK_PARENTS[0].pos.slice(), rotation: SNEAK_PARENTS[0].rot.slice() },
        positions: { body: SNEAK_PARENTS[1].pos.slice(), head: [0, SNEAK_HEAD_DROP, 0] },
        bones: {
            rightArm: [SNEAK_OTHER_ARM, 0, 0],
            leftArm: [SNEAK_OTHER_ARM, 0, 0],
            rightLeg: [SNEAK_LEG_TURN, 0.1, 0.1],
            leftLeg: [SNEAK_LEG_TURN, -0.1, -0.1]
        }
    },
    {
        id: 'arms_raised', label: 'display_sensei.pose_test.arms_raised', wearers: 'humanoid', chosen: false,
        bones: { rightArm: ZOMBIE_ARMS.right.slice(), leftArm: ZOMBIE_ARMS.left.slice() }
    },
    {
        id: 'look', label: 'display_sensei.pose_test.look', wearers: 'humanoid', chosen: true,
        bones: { head: [-30, 40, 0] }
    },
    {
        id: 'sit', label: 'display_sensei.pose_test.sit', wearers: 'humanoid', chosen: false,
        bones: {
            rightArm: [-36, 0, 0],
            leftArm: [-36, 0, 0],
            rightLeg: [-81, 18, 0],
            leftLeg: [-81, -18, 0]
        },
        overrides: [{ wearers: RAISED_ARM_WEARERS, bones: { rightArm: ZOMBIE_ARMS.right.slice(), leftArm: ZOMBIE_ARMS.left.slice() } }]
    }
];

function toRigBoneNames(rig, vectors) {
    let mapped = {};
    for (let [boneName, vector] of Object.entries(vectors || {})) {
        let rigName = findRigBoneName(rig, boneName);
        if (rigName) mapped[rigName] = vector.slice();
    }
    return mapped;
}

function copyWearerPoseRoot(root) {
    return root ? { pivot: root.pivot.slice(), position: root.position.slice(), rotation: root.rotation.slice() } : null;
}

function getWearerPoses(wearerId) {
    let rig = findWearerRig(wearerId);
    if (!rig) return [];
    if (rig.id === 'armor_stand') {
        return STAND_POSES.map(pose => {
            let turns = { body: pose.body, head: pose.head, rightArm: pose.rightarm, leftArm: pose.leftarm, rightLeg: pose.rightleg, leftLeg: pose.leftleg };
            if (pose.rightItem) turns.rightItem = pose.rightItem;
            return { id: pose.id, label: pose.labelKey, chosen: false, bones: toRigBoneNames(rig, turns), positions: {}, root: null };
        });
    }
    let poses = [];
    for (let pose of POSE_TESTS) {
        if (pose.wearers !== 'humanoid' && !pose.wearers.includes(rig.id)) continue;
        let turns = Object.assign({}, pose.bones);
        for (let override of pose.overrides || []) {
            if (override.wearers.includes(rig.id)) Object.assign(turns, override.bones);
        }
        let bones = toRigBoneNames(rig, turns);
        let positions = toRigBoneNames(rig, pose.positions);
        if (!Object.keys(bones).length && !Object.keys(positions).length && !pose.root) continue;
        poses.push({ id: pose.id, label: pose.label, chosen: pose.chosen, bones, positions, root: copyWearerPoseRoot(pose.root) });
    }
    return poses;
}

freezeArmorData(WEAR_SLOTS);
freezeArmorData(WEARER_BONE_NAMES);
freezeArmorData(WEARER_RIGS);
freezeArmorData(FLAT_ARMOR);
freezeArmorData(FLAT_ARMOR_BABY);
freezeArmorData(BONE_ALIASES);
freezeArmorData(RESERVED_MARKER_BONES);
freezeArmorData(RESERVED_MARKER_WEARERS);
freezeArmorData(POSE_TESTS);
