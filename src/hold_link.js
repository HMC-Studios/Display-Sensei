// =========================
// Held 3D items: link (read only)
// =========================

// =========================
// Hold slots
// =========================
const HOLD_VIEWS = ['first_person', 'third_person'];
const HOLD_HANDS = ['main_hand', 'off_hand'];
const HOLD_CHANNELS = ['position', 'rotation', 'scale'];
const HOLD_IDENTITY = Object.freeze({ position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] });
const HOLD_FLIPPED_AXES = Object.freeze({ position: [true, false, false], rotation: [true, true, false], scale: [false, false, false] });
const HOLD_AXIS_LETTERS = ['x', 'y', 'z'];

const HOLD_SLOT_CELLS = Object.freeze({
    firstperson_righthand: { view: 'first_person', hand: 'main_hand' },
    firstperson_lefthand: { view: 'first_person', hand: 'off_hand' },
    thirdperson_righthand: { view: 'third_person', hand: 'main_hand' },
    thirdperson_lefthand: { view: 'third_person', hand: 'off_hand' }
});

function holdCellKey(view, hand) {
    return `${view}.${hand}`;
}

const HOLD_CELLS = HOLD_VIEWS.reduce((cells, view) => cells.concat(HOLD_HANDS.map(hand => holdCellKey(view, hand))), []);

function findHoldSlot(slotId) {
    let cell = HOLD_SLOT_CELLS[slotId];
    return cell ? { slotId, view: cell.view, hand: cell.hand, cell: holdCellKey(cell.view, cell.hand) } : null;
}

function findHoldSlotId(view, hand) {
    return Object.keys(HOLD_SLOT_CELLS).find(slotId => HOLD_SLOT_CELLS[slotId].view === view && HOLD_SLOT_CELLS[slotId].hand === hand) || null;
}

function getOtherHoldHand(hand) {
    return hand === 'main_hand' ? 'off_hand' : 'main_hand';
}

function getHoldIdentity(channel) {
    return HOLD_IDENTITY[channel].slice();
}

function isHoldAxisFlipped(channel, axis) {
    return !!HOLD_FLIPPED_AXES[channel] && HOLD_FLIPPED_AXES[channel][axis];
}

function roundHoldNumber(value) {
    let rounded = Math.round(value * 10000) / 10000;
    return rounded === 0 ? 0 : rounded;
}

function toFileHoldPivot(origin) {
    return [roundHoldNumber(-origin[0]), roundHoldNumber(origin[1]), roundHoldNumber(origin[2])];
}

// =========================
// Reading Molang (the hold patterns only)
// =========================
const HOLD_FIRST_PERSON_NAMES = ['c.is_first_person', 'context.is_first_person', 'q.is_first_person', 'query.is_first_person'];
const HOLD_ITEM_SLOT_NAMES = ['c.item_slot', 'context.item_slot', 'q.item_slot', 'query.item_slot'];
const HOLD_MOLANG_TOKEN = /\s*(?:((?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)f?|([a-z_][a-z0-9_]*(?:\.[a-z_][a-z0-9_]*)*)|'([^']*)'|(==|!=|&&|\|\||[!?:()\-]))/iy;

function tokenizeHoldMolang(text) {
    let source = String(text).trim().replace(/;\s*$/, '').trim();
    if (!source) return null;
    let pattern = new RegExp(HOLD_MOLANG_TOKEN.source, 'iy');
    let tokens = [];
    let index = 0;
    while (index < source.length) {
        pattern.lastIndex = index;
        let match = pattern.exec(source);
        if (!match || pattern.lastIndex === index) return null;
        index = pattern.lastIndex;
        if (match[1] !== undefined) tokens.push({ type: 'number', value: parseFloat(match[1]) });
        else if (match[2] !== undefined) tokens.push({ type: 'name', value: match[2].toLowerCase() });
        else if (match[3] !== undefined) tokens.push({ type: 'string', value: match[3].toLowerCase() });
        else tokens.push({ type: 'op', value: match[4] });
    }
    return tokens;
}

function parseHoldMolang(text) {
    let tokens = typeof text === 'number' ? [{ type: 'number', value: text }] : tokenizeHoldMolang(text);
    if (!tokens || !tokens.length) return null;
    let position = 0;
    let peek = value => position < tokens.length && tokens[position].type === 'op' && tokens[position].value === value;
    let take = value => {
        if (!peek(value)) throw new Error(`Expected ${value}`);
        position++;
    };
    let primary = () => {
        let token = tokens[position++];
        if (!token) throw new Error('Unexpected end');
        if (token.type === 'number' || token.type === 'string') return { type: 'value', value: token.value };
        if (token.type === 'name') return { type: 'name', value: token.value };
        if (token.value === '(') {
            let inner = ternary();
            take(')');
            return inner;
        }
        throw new Error(`Unexpected ${token.value}`);
    };
    let unary = () => {
        if (peek('!')) {
            position++;
            return { type: 'not', value: unary() };
        }
        if (peek('-')) {
            position++;
            return { type: 'negate', value: unary() };
        }
        return primary();
    };
    let equality = () => {
        let left = unary();
        while (peek('==') || peek('!=')) {
            let operator = tokens[position++].value;
            left = { type: operator === '==' ? 'equal' : 'differ', left, right: unary() };
        }
        return left;
    };
    let and = () => {
        let left = equality();
        while (peek('&&')) {
            position++;
            left = { type: 'and', left, right: equality() };
        }
        return left;
    };
    let or = () => {
        let left = and();
        while (peek('||')) {
            position++;
            left = { type: 'or', left, right: and() };
        }
        return left;
    };
    let ternary = () => {
        let condition = or();
        if (!peek('?')) return condition;
        position++;
        let yes = ternary();
        take(':');
        return { type: 'ternary', condition, yes, no: ternary() };
    };
    try {
        let tree = ternary();
        return position === tokens.length ? tree : null;
    } catch (error) {
        return null;
    }
}

function isHoldMolangTrue(value) {
    return typeof value === 'string' ? value !== '' : value !== 0;
}

function evaluateHoldMolang(node, context) {
    switch (node.type) {
        case 'value':
            return node.value;
        case 'name':
            if (node.value === 'true') return 1;
            if (node.value === 'false') return 0;
            if (HOLD_FIRST_PERSON_NAMES.includes(node.value)) return context.view === 'first_person' ? 1 : 0;
            if (HOLD_ITEM_SLOT_NAMES.includes(node.value)) return context.hand;
            throw new Error(`Unknown name ${node.value}`);
        case 'not':
            return isHoldMolangTrue(evaluateHoldMolang(node.value, context)) ? 0 : 1;
        case 'negate': {
            let value = evaluateHoldMolang(node.value, context);
            if (typeof value !== 'number') throw new Error('Not a number');
            return -value;
        }
        case 'equal':
        case 'differ': {
            let left = evaluateHoldMolang(node.left, context);
            let right = evaluateHoldMolang(node.right, context);
            let same = typeof left === typeof right && left === right;
            return (node.type === 'equal') === same ? 1 : 0;
        }
        case 'and':
            return isHoldMolangTrue(evaluateHoldMolang(node.left, context)) && isHoldMolangTrue(evaluateHoldMolang(node.right, context)) ? 1 : 0;
        case 'or':
            return isHoldMolangTrue(evaluateHoldMolang(node.left, context)) || isHoldMolangTrue(evaluateHoldMolang(node.right, context)) ? 1 : 0;
        case 'ternary':
            return evaluateHoldMolang(isHoldMolangTrue(evaluateHoldMolang(node.condition, context)) ? node.yes : node.no, context);
    }
    throw new Error('Unknown node');
}

function fillHoldTable(read) {
    let table = {};
    for (let view of HOLD_VIEWS) {
        for (let hand of HOLD_HANDS) table[holdCellKey(view, hand)] = read(view, hand);
    }
    return table;
}

function readHoldMolangTable(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? fillHoldTable(() => value) : null;
    if (typeof value !== 'string') return null;
    let tree = parseHoldMolang(value);
    if (!tree) return null;
    try {
        let table = fillHoldTable((view, hand) => evaluateHoldMolang(tree, { view, hand }));
        return Object.values(table).every(entry => typeof entry === 'number' && Number.isFinite(entry)) ? table : null;
    } catch (error) {
        return null;
    }
}

function readHoldConditionCells(condition) {
    if (condition === null || condition === undefined || condition === '') return HOLD_CELLS.slice();
    let tree = parseHoldMolang(typeof condition === 'number' ? condition : String(condition));
    if (!tree) return null;
    try {
        return HOLD_CELLS.filter(cell => {
            let [view, hand] = cell.split('.');
            return isHoldMolangTrue(evaluateHoldMolang(tree, { view, hand }));
        });
    } catch (error) {
        return null;
    }
}

// =========================
// Writing Molang (the hold patterns only)
// =========================
function composeHoldHandExpression(main, off) {
    let mainValue = roundHoldNumber(main);
    let offValue = roundHoldNumber(off);
    if (mainValue === offValue) return mainValue;
    return `c.item_slot == 'off_hand' ? ${offValue} : ${mainValue}`;
}

function composeHoldViewExpression(table, view, plays) {
    let hands = HOLD_HANDS.filter(hand => plays.includes(holdCellKey(view, hand)));
    if (!hands.length) return null;
    let main = table[holdCellKey(view, hands[0])];
    let off = table[holdCellKey(view, hands[hands.length - 1])];
    return hands.length === 2 ? composeHoldHandExpression(main, off) : roundHoldNumber(hands[0] === 'main_hand' ? main : off);
}

function composeHoldMolang(table, plays) {
    let parts = HOLD_VIEWS.map(view => composeHoldViewExpression(table, view, plays));
    let [first, third] = parts;
    if (first === null && third === null) return 0;
    if (first === null) return third;
    if (third === null || first === third) return first;
    let wrap = part => (typeof part === 'string' ? `(${part})` : String(part));
    return `c.is_first_person ? ${wrap(first)} : ${wrap(third)}`;
}

function sameHoldTables(a, b, cells = HOLD_CELLS) {
    if (!a || !b) return false;
    return cells.every(cell => roundHoldNumber(a[cell]) === roundHoldNumber(b[cell]));
}

// =========================
// The attachable
// =========================
function readBlockbenchAttachable(project = Project) {
    let manager = project && project.BedrockEntityManager;
    let entity = manager && manager.client_entity;
    return entity && entity.type === 'attachable' && isPlainObject(entity.description) ? entity.description : null;
}

function readHoldAttachable(project = Project) {
    let linked = getLinkedAttachable(project);
    if (linked && isPlainObject(linked.description)) return { description: linked.description, path: linked.path || null, source: 'pack' };
    let description = readBlockbenchAttachable(project);
    return description ? { description: cloneJson(description), path: null, source: 'file' } : null;
}

function readAnimateEntries(description) {
    let animations = isPlainObject(description.animations) ? description.animations : {};
    let scripts = isPlainObject(description.scripts) ? description.scripts : {};
    let animate = Array.isArray(scripts.animate) ? scripts.animate : (typeof scripts.animate === 'string' ? [scripts.animate] : []);
    let entries = [];
    for (let item of animate) {
        let pairs = typeof item === 'string' ? [[item, null]] : (isPlainObject(item) ? Object.entries(item) : []);
        for (let [short, condition] of pairs) {
            let id = animations[short];
            if (typeof id !== 'string') continue;
            let text = typeof condition === 'string' || typeof condition === 'number' ? String(condition) : null;
            entries.push({
                short,
                id,
                condition: text,
                cells: readHoldConditionCells(text),
                controller: id.startsWith('controller.')
            });
        }
    }
    return entries;
}

// =========================
// The hold bone
// =========================
function isHandBoundGroup(group) {
    return !!group && parseBoneBinding(group.bedrock_binding).hand;
}

function findHoldBone() {
    if (!Project || !Array.isArray(Outliner.root)) return null;
    let roots = Outliner.root.filter(node => node instanceof Group);
    let bound = roots.find(isHandBoundGroup);
    let group = bound || roots[0] || null;
    if (!group) return null;
    return {
        group,
        name: group.name,
        uuid: group.uuid,
        binding: group.bedrock_binding || null,
        bound: !!bound,
        pivot: toFileHoldPivot(group.origin),
        rotated: Array.isArray(group.rotation) && group.rotation.some(angle => angle !== 0)
    };
}

function findHoldAnimation(name) {
    if (!name || !Project) return null;
    return Animation.all.find(animation => animation.name === name) || null;
}

function findHoldAnimator(animation, bone) {
    if (!animation || !bone) return null;
    let byUuid = animation.animators[bone.uuid];
    if (byUuid && byUuid.type === 'bone') return byUuid;
    let wanted = String(bone.name).toLowerCase();
    return Object.values(animation.animators).find(animator => !!animator && animator.type === 'bone' && String(animator.name).toLowerCase() === wanted) || null;
}

function animationMovesBone(name, bone) {
    let animator = findHoldAnimator(findHoldAnimation(name), bone);
    return !!animator && HOLD_CHANNELS.some(channel => Array.isArray(animator[channel]) && animator[channel].length > 0);
}

// =========================
// Holds per view and hand
// =========================
function getHoldStem() {
    let name = Project && typeof Project.geometry_name === 'string' ? Project.geometry_name : '';
    let stem = name.replace(/^geometry\./, '').replace(/[^a-z0-9_.]+/gi, '_').replace(/^\.+|\.+$/g, '').toLowerCase();
    return stem || 'item';
}

function getPlannedHoldName(view) {
    return `animation.${getHoldStem()}.${view}_hold`;
}

function chooseHoldEntry(cell, entries, bone) {
    let candidates = entries.filter(entry => !entry.controller && Array.isArray(entry.cells) && entry.cells.includes(cell));
    if (candidates.length === 1) return { status: 'linked', entry: candidates[0] };
    let moving = candidates.filter(entry => animationMovesBone(entry.id, bone));
    if (moving.length === 1) return { status: 'linked', entry: moving[0] };
    if (moving.length > 1) return { status: 'stacked', entry: null };
    if (candidates.length) return { status: 'linked', entry: candidates[0] };
    return { status: entries.some(entry => entry.controller) ? 'controller' : 'missing', entry: null };
}

function planMissingHolds(cells, attachable) {
    for (let view of HOLD_VIEWS) {
        let missing = HOLD_HANDS.map(hand => holdCellKey(view, hand)).filter(cell => cells[cell].status === 'missing');
        if (!missing.length) continue;
        let name = getPlannedHoldName(view);
        let used = HOLD_CELLS.some(cell => cells[cell].animation === name && !missing.includes(cell));
        if (used) name = `animation.${getHoldStem()}.${view}_hold_${missing.length === 1 ? missing[0].split('.')[1] : 'both'}`;
        for (let cell of missing) {
            Object.assign(cells[cell], { status: attachable ? 'missing' : 'new', animation: name, short: null, plays: missing.slice(), condition: null });
        }
    }
}

function readSavedHoldCells() {
    let link = Project ? getProjectData().holds.link : null;
    if (!link) return null;
    let cells = {};
    for (let cell of HOLD_CELLS) {
        let saved = link.cells[cell];
        if (!saved || !findHoldAnimation(saved.animation)) return null;
        cells[cell] = { status: 'linked', animation: saved.animation, short: null, plays: saved.plays.filter(entry => HOLD_CELLS.includes(entry)), condition: null };
    }
    return cells;
}

function rememberHoldCells(cells) {
    let link = { cells: {} };
    for (let cell of HOLD_CELLS) {
        if (cells[cell].status !== 'linked' || !cells[cell].animation) return;
        link.cells[cell] = { animation: cells[cell].animation, plays: cells[cell].plays.slice() };
    }
    let holds = getProjectData().holds;
    if (JSON.stringify(holds.link) !== JSON.stringify(link)) holds.link = link;
}

function analyseHolds() {
    let bone = findHoldBone();
    let attachable = readHoldAttachable();
    let entries = attachable ? readAnimateEntries(attachable.description) : [];
    let cells = {};
    for (let cell of HOLD_CELLS) {
        let choice = chooseHoldEntry(cell, entries, bone);
        let entry = choice.entry;
        cells[cell] = {
            status: choice.status,
            animation: entry ? entry.id : null,
            short: entry ? entry.short : null,
            plays: entry ? entry.cells.slice() : [],
            condition: entry ? entry.condition : null
        };
    }
    let source = attachable ? attachable.source : 'none';
    if (!attachable) {
        let saved = readSavedHoldCells();
        if (saved) {
            cells = saved;
            source = 'project';
        }
    }
    planMissingHolds(cells, attachable);
    if (attachable) rememberHoldCells(cells);
    let files = getLinkedAnimationFiles();
    for (let cell of HOLD_CELLS) {
        let animation = findHoldAnimation(cells[cell].animation);
        cells[cell].loaded = !!animation;
        cells[cell].file = (animation && animation.path) || files[cells[cell].animation] || null;
    }
    return {
        source,
        attachable: attachable ? { path: attachable.path, identifier: readAttachableIdentifier(attachable.description) } : null,
        bone: bone ? { name: bone.name, uuid: bone.uuid, binding: bone.binding, bound: bone.bound, pivot: bone.pivot, rotated: bone.rotated } : null,
        entries: entries.map(entry => ({ short: entry.short, id: entry.id, condition: entry.condition, cells: entry.cells, controller: entry.controller })),
        cells
    };
}

function readAttachableIdentifier(description) {
    return typeof description.identifier === 'string' ? description.identifier : null;
}

function getHoldLink() {
    if (!Project || getRoute() !== 'attachable') return null;
    return analyseHolds();
}

// =========================
// The hold files on disk (read only)
// =========================
const HOLD_TIME_EPSILON = 0.0001;
const HOLD_NUMBER_TEXT = /^\s*-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?\s*$/i;

let holdFileCache = new Map();

function forgetHoldFiles() {
    holdFileCache = new Map();
}

function getHoldFileKey(path) {
    return String(path).replace(/\\/g, '/').toLowerCase();
}

function parseHoldFileJson(text) {
    try {
        let json = autoParseJSON(text, false);
        return isPlainObject(json) ? json : null;
    } catch (error) {
        return null;
    }
}

function readHoldFile(path, force = false) {
    if (typeof path !== 'string' || !path) return null;
    let key = getHoldFileKey(path);
    if (!force && holdFileCache.has(key)) return holdFileCache.get(key);
    let text = readPackTextFile(path);
    let entry = typeof text === 'string' ? { path, text, hash: fnv1aHex(text), json: parseHoldFileJson(text) } : null;
    holdFileCache.set(key, entry);
    return entry;
}

function readHoldNumberText(value) {
    return typeof value === 'string' && HOLD_NUMBER_TEXT.test(value) ? parseFloat(value) : value;
}

function findFileHoldBone(bones, boneName) {
    if (!isPlainObject(bones) || !boneName) return null;
    let wanted = String(boneName).toLowerCase();
    let key = Object.keys(bones).find(name => name.toLowerCase() === wanted);
    return key ? bones[key] : null;
}

function readFileHoldChannelTables(value, channel) {
    if (value === undefined) return getHoldIdentity(channel).map(entry => fillHoldTable(() => entry));
    let vector = value;
    if (isPlainObject(value)) {
        let keys = Object.keys(value);
        if (keys.length !== 1 || !(Math.abs(parseFloat(keys[0])) < HOLD_TIME_EPSILON)) return null;
        vector = value[keys[0]];
    }
    if (!Array.isArray(vector)) vector = [vector, vector, vector];
    if (vector.length !== 3) return null;
    let tables = vector.map(entry => readHoldMolangTable(readHoldNumberText(entry)));
    return tables.every(Boolean) ? tables : null;
}

function readFileHoldBone(file, animationName, boneName) {
    let animations = file && file.json && isPlainObject(file.json.animations) ? file.json.animations : null;
    let animation = animations && isPlainObject(animations[animationName]) ? animations[animationName] : null;
    if (!animation) return { animation: false, bone: null };
    return { animation: true, bone: findFileHoldBone(animation.bones, boneName) };
}

function readFileHoldPose(file, cellInfo, boneName, cell) {
    if (!file || !cellInfo || !cellInfo.animation) return null;
    let found = readFileHoldBone(file, cellInfo.animation, boneName);
    if (!found.animation) return null;
    let pose = {};
    for (let channel of HOLD_CHANNELS) {
        let tables = readFileChannelTablesOfBone(found.bone, channel);
        if (!tables) return null;
        pose[channel] = tables.map(table => roundHoldNumber(table[cell]));
    }
    return pose;
}

function readFileChannelTablesOfBone(bone, channel) {
    return readFileHoldChannelTables(isPlainObject(bone) ? bone[channel] : undefined, channel);
}

function readLinkedFilePose(link, cell, force = false) {
    let cellInfo = link && link.cells[cell];
    if (!cellInfo || !cellInfo.file || !link.bone) return null;
    return readFileHoldPose(readHoldFile(cellInfo.file, force), cellInfo, link.bone.name, cell);
}

// =========================
// Loading the hold animations
// =========================
function loadHoldAnimationsFromFiles(ids) {
    let files = getLinkedAnimationFiles();
    let byPath = new Map();
    for (let id of ids) {
        let path = files[id];
        if (!path || findHoldAnimation(id)) continue;
        if (!byPath.has(path)) byPath.set(path, []);
        byPath.get(path).push(id);
    }
    let codec = typeof AnimationCodec !== 'undefined' && AnimationCodec.codecs ? AnimationCodec.codecs.bedrock : null;
    let loaded = [];
    if (!codec || typeof codec.loadFile !== 'function') return loaded;
    for (let [path, names] of byPath) {
        let content = readPackTextFile(path);
        if (typeof content !== 'string') continue;
        try {
            for (let animation of codec.loadFile({ path, content }, names) || []) loaded.push(animation.name);
        } catch (error) {
            console.warn(LOG_PREFIX, 'Could not read the hold animations:', error);
        }
    }
    return loaded;
}

function ensureHoldAnimationsLoaded() {
    if (!Project || getRoute() !== 'attachable' || !isEntityFormat()) return false;
    let changed = false;
    let manager = Project.BedrockEntityManager;
    if (manager && manager.client_entity && !manager.initialized_animations && typeof manager.initAnimations === 'function') {
        try {
            manager.initAnimations();
            changed = true;
        } catch (error) {
            console.warn(LOG_PREFIX, 'Could not load the animations of this attachable:', error);
        }
    }
    let attachable = readHoldAttachable();
    let ids = attachable ? readAnimateEntries(attachable.description).filter(entry => !entry.controller).map(entry => entry.id) : [];
    if (loadHoldAnimationsFromFiles(ids).length) changed = true;
    return changed;
}

// =========================
// Rig check
// =========================
const HOLD_FAR_FROM_HAND = 12;
const HOLD_BINDING = 'q.item_slot_to_bone_name(c.item_slot)';

function measureHoldReach(values, bone) {
    let reach = [0, 1, 2].map(axis => bone.pivot[axis] - BOUND_ROOT_ANCHOR[axis] + values.position[axis]);
    return Math.hypot(reach[0], reach[1], reach[2]);
}

function runHoldRigChecks(readValues) {
    if (!Project || getRoute() !== 'attachable') return [];
    let checks = [];
    let roots = Outliner.root.filter(node => node instanceof Group);
    let looseCubes = Outliner.root.filter(node => !(node instanceof Group) && node.export !== false);
    let bound = roots.filter(isHandBoundGroup);
    if (!bound.length) {
        let target = roots.length === 1 ? roots[0] : null;
        checks.push({
            id: 'no_hand_binding',
            severity: 'error',
            values: { bone: target ? target.name : '' },
            fix: target && !target.bedrock_binding ? 'bind_root' : null,
            approximate: false
        });
        return checks;
    }
    let main = bound[0];
    let others = roots.filter(group => group !== main && !isHandBoundGroup(group)).map(group => group.name).concat(looseCubes.map(node => node.name));
    if (others.length) {
        let canMove = (!Array.isArray(main.rotation) || main.rotation.every(angle => angle === 0)) && roots.filter(group => group !== main).every(group => !isHandBoundGroup(group));
        checks.push({
            id: 'loose_roots',
            severity: 'warning',
            values: { bone: main.name, others: others.join(', ') },
            fix: canMove ? 'move_into_bound' : null,
            approximate: false
        });
    }
    let bone = findHoldBone();
    if (bone && bone.bound && typeof readValues === 'function') {
        for (let view of HOLD_VIEWS) {
            let values = readValues(findHoldSlotId(view, 'main_hand'));
            if (!values) continue;
            let reach = measureHoldReach(values, bone);
            if (reach <= HOLD_FAR_FROM_HAND) continue;
            checks.push({
                id: `far_from_hand.${view}`,
                severity: 'info',
                values: { bone: bone.name, view, distance: String(Math.round(reach * 10) / 10) },
                fix: null,
                approximate: true
            });
        }
    }
    return checks;
}

function fixHoldBinding() {
    let roots = Outliner.root.filter(node => node instanceof Group);
    let target = roots.length === 1 ? roots[0] : null;
    if (!target || target.bedrock_binding || roots.some(isHandBoundGroup)) return false;
    Undo.initEdit({ groups: [target] });
    target.bedrock_binding = HOLD_BINDING;
    Undo.finishEdit(i18n('display_sensei.undo.hold_bind_root'));
    return true;
}

function fixLooseHoldRoots() {
    let roots = Outliner.root.filter(node => node instanceof Group);
    let main = roots.find(isHandBoundGroup);
    if (!main || (Array.isArray(main.rotation) && main.rotation.some(angle => angle !== 0))) return false;
    let moving = Outliner.root.filter(node => node !== main && (!(node instanceof Group) || !isHandBoundGroup(node)) && node.export !== false);
    if (!moving.length) return false;
    Undo.initEdit({ outliner: true });
    for (let node of moving) node.addTo(main);
    Canvas.updateAllBones();
    Canvas.updateAllPositions();
    Undo.finishEdit(i18n('display_sensei.undo.hold_move_into_bone'), { outliner: true });
    return true;
}

function applyHoldRigFix(fixId) {
    if (!Project || getRoute() !== 'attachable' || Undo.current_save || Modes.animate) return false;
    if (fixId === 'bind_root') return fixHoldBinding();
    if (fixId === 'move_into_bound') return fixLooseHoldRoots();
    return false;
}
