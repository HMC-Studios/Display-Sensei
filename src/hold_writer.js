// =========================
// Held 3D items: writing the hold numbers (back end)
// =========================

// =========================
// Reading JSON text (positions only)
// =========================
function skipJsonGap(text, index) {
    while (index < text.length) {
        let char = text[index];
        if (char === ' ' || char === '\t' || char === '\n' || char === '\r' || char === '﻿') {
            index++;
        } else if (char === '/' && text[index + 1] === '/') {
            let end = text.indexOf('\n', index);
            index = end < 0 ? text.length : end + 1;
        } else if (char === '/' && text[index + 1] === '*') {
            let end = text.indexOf('*/', index + 2);
            if (end < 0) throw new Error('Unclosed comment');
            index = end + 2;
        } else {
            break;
        }
    }
    return index;
}

function scanJsonString(text, index) {
    if (text[index] !== '"') throw new Error(`Expected a string at ${index}`);
    for (let position = index + 1; position < text.length; position++) {
        if (text[position] === '\\') {
            position++;
        } else if (text[position] === '"') {
            return position + 1;
        }
    }
    throw new Error('Unclosed string');
}

function scanJsonValue(text, index) {
    let char = text[index];
    if (char === '"') return scanJsonString(text, index);
    if (char === '{' || char === '[') {
        let close = char === '{' ? '}' : ']';
        let position = skipJsonGap(text, index + 1);
        if (text[position] === close) return position + 1;
        while (position < text.length) {
            if (char === '{') {
                position = skipJsonGap(text, scanJsonString(text, position));
                if (text[position] !== ':') throw new Error(`Expected : at ${position}`);
                position = skipJsonGap(text, position + 1);
            }
            position = skipJsonGap(text, scanJsonValue(text, position));
            if (text[position] === ',') {
                position = skipJsonGap(text, position + 1);
            } else if (text[position] === close) {
                return position + 1;
            } else {
                throw new Error(`Expected , or ${close} at ${position}`);
            }
        }
        throw new Error('Unclosed value');
    }
    let match = /^[^\s,}\]/]+/.exec(text.slice(index, index + 64));
    if (!match) throw new Error(`Expected a value at ${index}`);
    return index + match[0].length;
}

function readJsonMembers(text, objectStart) {
    if (text[objectStart] !== '{') throw new Error(`Expected an object at ${objectStart}`);
    let members = [];
    let position = skipJsonGap(text, objectStart + 1);
    if (text[position] === '}') return { members, close: position };
    while (position < text.length) {
        let keyEnd = scanJsonString(text, position);
        let key = JSON.parse(text.slice(position, keyEnd));
        let colon = skipJsonGap(text, keyEnd);
        if (text[colon] !== ':') throw new Error(`Expected : at ${colon}`);
        let valueStart = skipJsonGap(text, colon + 1);
        let valueEnd = scanJsonValue(text, valueStart);
        members.push({ key, keyStart: position, valueStart, valueEnd });
        position = skipJsonGap(text, valueEnd);
        if (text[position] === ',') {
            position = skipJsonGap(text, position + 1);
        } else if (text[position] === '}') {
            return { members, close: position };
        } else {
            throw new Error(`Expected , or } at ${position}`);
        }
    }
    throw new Error('Unclosed object');
}

function findJsonRoot(text) {
    let start = skipJsonGap(text, 0);
    if (text[start] !== '{') throw new Error('The file is not a JSON object');
    return start;
}

// =========================
// Text style of the file
// =========================
function detectNewline(text) {
    return text.includes('\r\n') ? '\r\n' : '\n';
}

function readLineIndent(text, index) {
    let lineStart = text.lastIndexOf('\n', index - 1) + 1;
    let match = /^[ \t]*/.exec(text.slice(lineStart, index));
    return match ? match[0] : '';
}

function detectIndentUnit(text) {
    let match = /\n([ \t]+)"/.exec(text);
    return match ? match[1] : '\t';
}

function readArrayStyle(text, start, end) {
    let inner = text.slice(start + 1, end - 1);
    let numbers = inner.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi) || [];
    return {
        padded: !/[\r\n]/.test(inner) && /^\s/.test(inner) && /\s$/.test(inner),
        separator: /,[ \t]/.test(inner) ? ', ' : ',',
        decimals: numbers.length > 0 && numbers.every(number => number.includes('.'))
    };
}

const DEFAULT_ARRAY_STYLE = Object.freeze({ padded: false, separator: ', ', decimals: false });

function formatHoldJsonNumber(value, decimals) {
    let text = String(roundHoldNumber(value));
    return decimals && !/[.e]/i.test(text) ? `${text}.0` : text;
}

function serializeHoldJsonEntry(entry, style) {
    return typeof entry === 'number' ? formatHoldJsonNumber(entry, style.decimals) : JSON.stringify(entry);
}

function serializeHoldChannelValue(value, style) {
    if (!Array.isArray(value)) return serializeHoldJsonEntry(value, style);
    let inner = value.map(entry => serializeHoldJsonEntry(entry, style)).join(style.separator);
    return style.padded ? `[ ${inner} ]` : `[${inner}]`;
}

function findArrayStyleIn(text, objectStart) {
    let { members } = readJsonMembers(text, objectStart);
    let array = members.find(member => text[member.valueStart] === '[');
    return array ? readArrayStyle(text, array.valueStart, array.valueEnd) : null;
}

function serializeNestedMember(path, valueText, indent, unit, newline) {
    let [head, ...rest] = path;
    if (!rest.length) return `${JSON.stringify(head.key)}: ${valueText}`;
    let inner = serializeNestedMember(rest, valueText, indent + unit, unit, newline);
    let loop = head.loop ? `"loop": true,${newline}${indent}${unit}` : '';
    return `${JSON.stringify(head.key)}: {${newline}${indent}${unit}${loop}${inner}${newline}${indent}}`;
}

function insertJsonMember(text, objectStart, path, valueText) {
    let { members, close } = readJsonMembers(text, objectStart);
    let newline = detectNewline(text);
    let unit = detectIndentUnit(text);
    if (members.length) {
        let first = members[0];
        let last = members[members.length - 1];
        if (!/[\r\n]/.test(text.slice(objectStart, first.keyStart))) {
            return text.slice(0, last.valueEnd) + `, ${serializeNestedMember(path, valueText, '', '', ' ')}` + text.slice(last.valueEnd);
        }
        let indent = readLineIndent(text, first.keyStart);
        let member = serializeNestedMember(path, valueText, indent, unit, newline);
        return text.slice(0, last.valueEnd) + `,${newline}${indent}${member}` + text.slice(last.valueEnd);
    }
    let outer = readLineIndent(text, objectStart);
    let indent = outer + unit;
    let member = serializeNestedMember(path, valueText, indent, unit, newline);
    return text.slice(0, objectStart + 1) + `${newline}${indent}${member}${newline}${outer}` + text.slice(close);
}

// =========================
// The patch (pure)
// =========================
function findJsonMember(text, objectStart, key, ignoreCase) {
    let { members } = readJsonMembers(text, objectStart);
    let wanted = ignoreCase ? String(key).toLowerCase() : key;
    return members.find(member => (ignoreCase ? member.key.toLowerCase() : member.key) === wanted) || null;
}

function applyHoldChange(text, change, report) {
    let steps = [
        { key: 'animations', ignoreCase: false },
        { key: change.animation, ignoreCase: false, loop: true },
        { key: 'bones', ignoreCase: false },
        { key: change.bone, ignoreCase: true },
        { key: change.channel, ignoreCase: false }
    ];
    let objectStart = findJsonRoot(text);
    for (let index = 0; index < steps.length; index++) {
        let step = steps[index];
        let member = findJsonMember(text, objectStart, step.key, step.ignoreCase);
        let last = index === steps.length - 1;
        if (!member) {
            let style = (last && findArrayStyleIn(text, objectStart)) || change.style || DEFAULT_ARRAY_STYLE;
            let valueText = serializeHoldChannelValue(change.value, style);
            text = insertJsonMember(text, objectStart, steps.slice(index), valueText);
            report.inserted.push(`${change.animation}/${change.bone}/${change.channel}`);
            return text;
        }
        if (last) {
            let old = text.slice(member.valueStart, member.valueEnd);
            let style = text[member.valueStart] === '[' ? readArrayStyle(text, member.valueStart, member.valueEnd) : (change.style || DEFAULT_ARRAY_STYLE);
            let value = change.value;
            let oldSingle = text[member.valueStart] !== '[' && text[member.valueStart] !== '{';
            if (oldSingle && Array.isArray(value) && value.every(entry => entry === value[0]) && change.channel === 'scale') value = value[0];
            let valueText = serializeHoldChannelValue(value, style);
            if (valueText !== old) {
                text = text.slice(0, member.valueStart) + valueText + text.slice(member.valueEnd);
                report.replaced.push(`${change.animation}/${change.bone}/${change.channel}`);
            }
            return text;
        }
        if (text[member.valueStart] !== '{') throw new Error(`${step.key} is not an object`);
        objectStart = member.valueStart;
    }
    return text;
}

function raiseAnimationFormatVersion(text, version, report) {
    let root = findJsonRoot(text);
    let member = findJsonMember(text, root, 'format_version', false);
    if (!member) {
        let raised = insertJsonMember(text, root, [{ key: 'format_version' }], JSON.stringify(version));
        report.version = version;
        return raised;
    }
    let current = text[member.valueStart] === '"' ? JSON.parse(text.slice(member.valueStart, member.valueEnd)) : String(text.slice(member.valueStart, member.valueEnd));
    if (isGeometryVersionString(current) && VersionUtil.compare(current, '>=', version)) return text;
    report.version = version;
    return text.slice(0, member.valueStart) + JSON.stringify(version) + text.slice(member.valueEnd);
}

function patchHoldAnimationFile(text, changes, options = {}) {
    let report = { replaced: [], inserted: [], version: null };
    let result = String(text);
    for (let change of changes) result = applyHoldChange(result, change, report);
    if (options.raiseVersion) result = raiseAnimationFormatVersion(result, options.raiseVersion, report);
    return { text: result, report };
}

// =========================
// What to write
// =========================
const HOLD_OFF_HAND_FILE_VERSION = '1.10.0';
const HOLD_NEW_FILE_VERSION = '1.8.0';

function collectHoldAnimations(link) {
    let animations = [];
    for (let cell of HOLD_CELLS) {
        let info = link.cells[cell];
        if (!info.animation || HOLD_READ_ONLY_STATUSES.includes(info.status)) continue;
        let entry = animations.find(item => item.name === info.animation);
        if (!entry) {
            entry = { name: info.animation, plays: info.plays.slice(), cells: [], file: info.file || null, status: info.status };
            animations.push(entry);
        }
        entry.cells.push(cell);
        if (!entry.file && info.file) entry.file = info.file;
    }
    return animations;
}

function chooseHoldTarget(entry, animations) {
    let target = getProjectData().holds.target;
    if (target) return target;
    if (entry.file) return entry.file;
    let other = animations.find(item => item.file);
    return other ? other.file : null;
}

function readProjectChannelValue(read, plays) {
    return read.tables.map(table => composeHoldMolang(table, plays));
}

function holdValueHasTernary(value) {
    return [].concat(value).some(entry => typeof entry === 'string' && /item_slot/.test(entry));
}

function planHoldWrites(link, readFile = path => readHoldFile(path, true)) {
    let readOnce = new Map();
    let readPlanFile = path => {
        let key = getHoldFileKey(path);
        if (!readOnce.has(key)) readOnce.set(key, readFile(path));
        return readOnce.get(key);
    };
    let animations = collectHoldAnimations(link);
    let files = new Map();
    let skipped = [];
    let noFile = [];
    for (let entry of animations) {
        let animation = findHoldAnimation(entry.name);
        let animator = animation && link.bone ? findHoldAnimator(animation, link.bone) : null;
        let path = chooseHoldTarget(entry, animations);
        let file = path ? readPlanFile(path) : null;
        let fileBone = file ? readFileHoldBone(file, entry.name, link.bone ? link.bone.name : null) : { animation: false, bone: null };
        let changes = [];
        for (let channel of HOLD_CHANNELS) {
            let read = readHoldChannel(animator, channel);
            if (!read.editable) {
                if (read.keyframe) skipped.push(`${entry.name}/${channel}`);
                continue;
            }
            let fileTables = fileBone.animation ? readFileChannelTablesOfBone(fileBone.bone, channel) : null;
            let same = fileTables && read.tables.every((table, axis) => sameHoldTables(table, fileTables[axis], entry.plays));
            if (same) continue;
            if (!fileBone.animation && read.tables.every((table, axis) => sameHoldTables(table, fillHoldTable(() => getHoldIdentity(channel)[axis]), entry.plays))) continue;
            changes.push({ animation: entry.name, bone: link.bone.name, channel, value: readProjectChannelValue(read, entry.plays) });
        }
        if (!changes.length) continue;
        if (!path) {
            noFile.push(entry.name);
            continue;
        }
        let key = getHoldFileKey(path);
        if (!files.has(key)) files.set(key, { key, path, file, changes: [], animations: [] });
        let plan = files.get(key);
        plan.changes.push(...changes);
        if (!plan.animations.includes(entry.name)) plan.animations.push(entry.name);
    }
    let plans = Array.from(files.values());
    for (let plan of plans) {
        plan.raiseVersion = plan.changes.some(change => holdValueHasTernary(change.value)) ? HOLD_OFF_HAND_FILE_VERSION : null;
    }
    return { files: plans, skipped, noFile };
}

// =========================
// Files Display Sensei knows
// =========================
function getHoldFileRecord(path) {
    let holds = getProjectData().holds;
    return holds.files[getHoldFileKey(path)] || null;
}

function recordHoldFile(path, changes) {
    let holds = getProjectData().holds;
    let key = getHoldFileKey(path);
    let record = holds.files[key] || { path, hash: null, backup: null, written: null, confirmed: false };
    Object.assign(record, changes, { path });
    holds.files[key] = record;
    return record;
}

function noteHoldFilesSeen(link) {
    if (!link) return;
    for (let entry of collectHoldAnimations(link)) {
        let path = entry.file;
        if (!path || getHoldFileRecord(path)) continue;
        let file = readHoldFile(path);
        if (file) recordHoldFile(path, { hash: file.hash });
    }
}

function listHoldFilePaths(link) {
    let paths = [];
    let add = path => {
        if (path && !paths.some(entry => getHoldFileKey(entry) === getHoldFileKey(path))) paths.push(path);
    };
    let animations = collectHoldAnimations(link);
    for (let entry of animations) add(chooseHoldTarget(entry, animations));
    for (let entry of animations) add(entry.file);
    return paths;
}

function getHoldWriteState(force = false) {
    if (!Project || getRoute() !== 'attachable') return null;
    let link = analyseHolds();
    let read = path => readHoldFile(path, force);
    let plan = planHoldWrites(link, read);
    let files = listHoldFilePaths(link).map(path => {
        let file = read(path);
        let record = getHoldFileRecord(path);
        let pending = plan.files.find(entry => entry.key === getHoldFileKey(path));
        let changedAfterWrite = !!record && !!record.written && !!file && file.hash !== record.written && !!pending && pending.changes.length > 0;
        let changedSinceRead = !!record && !!record.hash && !!file && file.hash !== record.hash;
        return {
            path,
            name: PathModule.basename(path),
            exists: !!file,
            readable: !!file && !!file.json,
            pending: pending ? pending.changes.length : 0,
            changedAfterWrite,
            changedSinceRead,
            hasBackup: !!record && typeof record.backup === 'string',
            written: !!record && !!record.written && !!file && file.hash === record.written,
            confirmed: !!record && record.confirmed
        };
    });
    let missing = HOLD_CELLS.filter(cell => link.cells[cell].status === 'missing' || link.cells[cell].status === 'new');
    return {
        files,
        pending: plan.files.reduce((sum, entry) => sum + entry.changes.length, 0),
        noFile: plan.noFile,
        skipped: plan.skipped,
        missing,
        attachable: link.attachable,
        target: getProjectData().holds.target
    };
}

// =========================
// Dialogs
// =========================
function askHoldMessage(options) {
    return new Promise(resolve => {
        Blockbench.showMessageBox(options, (button, result) => resolve({ button, result }));
    });
}

function cleanDialogPath(path) {
    return String(path).replace(/`/g, '');
}

async function confirmHoldWrite(plans) {
    let unconfirmed = plans.filter(plan => {
        let record = getHoldFileRecord(plan.path);
        return !record || !record.confirmed;
    });
    if (!unconfirmed.length) return 'write';
    let paths = unconfirmed.map(plan => '`' + cleanDialogPath(plan.path) + '`').join('\n');
    let answer = await askHoldMessage({
        title: i18n('display_sensei.hold_write.confirm_title'),
        message: i18nFormat('display_sensei.hold_write.confirm_message', { paths }),
        icon: 'save',
        buttons: [i18n('display_sensei.hold_write.confirm_write'), i18n('display_sensei.hold_write.choose_file'), i18n('display_sensei.ui.cancel')],
        confirmIndex: 0,
        cancelIndex: 2
    });
    if (answer.button === 0) return 'write';
    if (answer.button === 1) return 'choose';
    return 'cancel';
}

async function askHoldConflict(plan) {
    let answer = await askHoldMessage({
        title: i18n('display_sensei.hold_write.conflict_title'),
        message: i18nFormat('display_sensei.hold_write.conflict_message', { path: '`' + cleanDialogPath(plan.path) + '`' }),
        icon: 'warning',
        buttons: [i18n('display_sensei.hold_write.conflict_overwrite'), i18n('display_sensei.hold_write.conflict_load'), i18n('display_sensei.ui.cancel')],
        confirmIndex: 0,
        cancelIndex: 2
    });
    if (answer.button === 0) return 'overwrite';
    if (answer.button === 1) return 'load';
    return 'cancel';
}

function pickHoldTargetFile(onPicked) {
    let link = analyseHolds();
    let start = listHoldFilePaths(link)[0] || (Project && Project.export_path) || '';
    Blockbench.import({
        resource_id: 'animation',
        extensions: ['json'],
        type: i18n('display_sensei.hold_write.file_type'),
        startpath: start ? PathModule.dirname(start) : undefined
    }, files => {
        let path = files && files[0] && files[0].path ? files[0].path : null;
        if (path) onPicked(path);
    });
}

function clearHoldTarget() {
    if (!Project || getRoute() !== 'attachable') return false;
    let holds = getProjectData().holds;
    if (!holds.target) return false;
    holds.target = null;
    return true;
}

// =========================
// Writing
// =========================
function writeTextFile(path, text) {
    Blockbench.writeFile(path, { content: text });
}

function markHoldAnimationsSaved(plan, text) {
    let json = parseHoldFileJson(text);
    let codec = typeof AnimationCodec !== 'undefined' && AnimationCodec.codecs ? AnimationCodec.codecs.bedrock : null;
    if (!json || !isPlainObject(json.animations) || !codec || typeof codec.compileAnimation !== 'function') return;
    for (let name of plan.animations) {
        let animation = findHoldAnimation(name);
        if (!animation || !isPlainObject(json.animations[name])) continue;
        let compiled = codec.compileAnimation(animation);
        if (sameAnimationJson(compiled, json.animations[name])) {
            animation.saved = true;
            if (!animation.path) animation.path = plan.path;
        }
    }
}

function normalizeAnimationJson(value) {
    if (Array.isArray(value)) return value.map(normalizeAnimationJson);
    if (isPlainObject(value)) {
        let keys = Object.keys(value).sort();
        let copy = {};
        for (let key of keys) copy[key.toLowerCase()] = normalizeAnimationJson(value[key]);
        return copy;
    }
    let number = readHoldNumberText(value);
    return typeof number === 'number' ? roundHoldNumber(number) : number;
}

function sameAnimationJson(a, b) {
    return JSON.stringify(normalizeAnimationJson(a)) === JSON.stringify(normalizeAnimationJson(b));
}

function applyHoldPlan(plan, baseText) {
    let patched = patchHoldAnimationFile(baseText, plan.changes, { raiseVersion: plan.raiseVersion });
    let record = getHoldFileRecord(plan.path);
    let backup = record && typeof record.backup === 'string' ? record.backup : baseText;
    writeTextFile(plan.path, patched.text);
    let hash = fnv1aHex(patched.text);
    recordHoldFile(plan.path, { hash, written: hash, backup, confirmed: true });
    holdFileCache.set(getHoldFileKey(plan.path), { path: plan.path, text: patched.text, hash, json: parseHoldFileJson(patched.text) });
    markHoldAnimationsSaved(plan, patched.text);
    return patched.report;
}

async function writeHoldDisplay(options = {}) {
    if (!Project || getRoute() !== 'attachable') return { status: 'unavailable' };
    if (!isDesktopApp()) return { status: 'desktop_only' };
    let project = Project;
    let plan = planHoldWrites(analyseHolds());
    if (!plan.files.length && !plan.noFile.length) return { status: 'nothing', skipped: plan.skipped };
    let choice = plan.files.length ? await confirmHoldWrite(plan.files) : 'choose';
    if (project !== Project) return { status: 'cancelled' };
    if (choice === 'cancel') return { status: 'cancelled' };
    if (choice === 'choose') {
        pickHoldTargetFile(path => {
            if (project !== Project) return;
            getProjectData().holds.target = path;
            recordHoldFile(path, { confirmed: true });
            writeHoldDisplay(options).then(result => {
                if (typeof options.onDone === 'function') options.onDone(result);
            }, error => console.warn(LOG_PREFIX, 'Write display failed:', error));
        });
        return { status: 'choosing' };
    }
    let written = [];
    for (let entry of plan.files) recordHoldFile(entry.path, { confirmed: true });
    for (let entry of plan.files) {
        let current = readHoldFile(entry.path, true);
        if (!current) return { status: 'missing_file', path: entry.path };
        if (!current.json) return { status: 'unreadable', path: entry.path };
        if (/�/.test(current.text)) return { status: 'unreadable', path: entry.path };
        let record = getHoldFileRecord(entry.path);
        if (record && record.hash && record.hash !== current.hash) {
            let answer = await askHoldConflict(entry);
            if (project !== Project || answer === 'cancel') return { status: 'cancelled', written };
            if (answer === 'load') {
                loadHoldFileValues();
                return { status: 'loaded', written };
            }
        }
        let fresh = planHoldWrites(analyseHolds(), path => readHoldFile(path, false)).files.find(item => item.key === entry.key);
        if (!fresh) continue;
        try {
            let report = applyHoldPlan(fresh, current.text);
            written.push({ path: entry.path, report });
        } catch (error) {
            console.warn(LOG_PREFIX, 'Could not write the hold animations:', error);
            return { status: 'failed', path: entry.path, written };
        }
    }
    refreshPanelSafely();
    return { status: 'written', written, skipped: plan.skipped, noFile: plan.noFile };
}

// =========================
// Restoring and loading
// =========================
async function restoreHoldFile(path) {
    let record = path ? getHoldFileRecord(path) : null;
    if (!record || typeof record.backup !== 'string') return { status: 'nothing' };
    let project = Project;
    let answer = await askHoldMessage({
        title: i18n('display_sensei.hold_write.restore_title'),
        message: i18nFormat('display_sensei.hold_write.restore_message', { path: '`' + cleanDialogPath(path) + '`' }),
        icon: 'restore',
        buttons: [i18n('display_sensei.hold_write.restore_confirm'), i18n('display_sensei.ui.cancel')],
        confirmIndex: 0,
        cancelIndex: 1
    });
    if (answer.button !== 0 || project !== Project) return { status: 'cancelled' };
    try {
        writeTextFile(path, record.backup);
    } catch (error) {
        console.warn(LOG_PREFIX, 'Could not restore the hold animations:', error);
        return { status: 'failed' };
    }
    let hash = fnv1aHex(record.backup);
    recordHoldFile(path, { hash, written: null });
    holdFileCache.set(getHoldFileKey(path), { path, text: record.backup, hash, json: parseHoldFileJson(record.backup) });
    refreshPanelSafely();
    return { status: 'restored' };
}

function loadHoldFileValues() {
    if (!canEditAttachable() || Undo.current_save) return false;
    let link = analyseHolds();
    let codec = typeof AnimationCodec !== 'undefined' && AnimationCodec.codecs ? AnimationCodec.codecs.bedrock : null;
    if (!codec || typeof codec.loadFile !== 'function') return false;
    let byPath = new Map();
    for (let entry of collectHoldAnimations(link)) {
        if (!entry.file) continue;
        let key = getHoldFileKey(entry.file);
        if (!byPath.has(key)) byPath.set(key, { path: entry.file, names: [] });
        byPath.get(key).names.push(entry.name);
    }
    if (!byPath.size) return false;
    let before = getHoldAnimationsForUndo();
    Undo.initEdit({ animations: before, [PROJECT_DATA_UNDO_ASPECT]: true });
    let loaded = [];
    try {
        for (let { path, names } of byPath.values()) {
            let file = readHoldFile(path, true);
            if (!file || !file.json) continue;
            let places = {};
            for (let existing of before.filter(item => names.includes(item.name))) {
                places[existing.name] = Animation.all.indexOf(existing);
                existing.remove(false, false);
            }
            let fresh = codec.loadFile({ path, content: file.text }, names) || [];
            for (let animation of fresh) {
                if (typeof places[animation.name] === 'number' && places[animation.name] >= 0) {
                    Animation.all.remove(animation);
                    Animation.all.splice(Math.min(places[animation.name], Animation.all.length), 0, animation);
                }
                loaded.push(animation);
            }
            recordHoldFile(path, { hash: file.hash, written: null });
        }
        getProjectData().holds.off_hand = {};
    } catch (error) {
        Undo.cancelEdit(true);
        throw error;
    }
    Undo.finishEdit(i18n('display_sensei.undo.hold_load_file'), { animations: getHoldAnimationsForUndo(), [PROJECT_DATA_UNDO_ASPECT]: true });
    refreshHoldPreview();
    refreshPanelSafely();
    return loaded.length > 0;
}

// =========================
// Copy and Export
// =========================
function buildHoldAnimationFile() {
    if (!Project || getRoute() !== 'attachable') return null;
    let link = analyseHolds();
    if (!link.bone) return null;
    let animations = {};
    let ternary = false;
    for (let entry of collectHoldAnimations(link)) {
        let animator = findHoldAnimator(findHoldAnimation(entry.name), link.bone);
        let bone = {};
        for (let channel of HOLD_CHANNELS) {
            let read = readHoldChannel(animator, channel);
            if (!read.editable) continue;
            let identity = read.tables.every((table, axis) => sameHoldTables(table, fillHoldTable(() => getHoldIdentity(channel)[axis]), entry.plays));
            if (identity) continue;
            let value = readProjectChannelValue(read, entry.plays);
            if (holdValueHasTernary(value)) ternary = true;
            bone[channel] = value;
        }
        animations[entry.name] = { loop: true, bones: { [link.bone.name]: bone } };
    }
    if (!Object.keys(animations).length) return null;
    return { format_version: ternary ? HOLD_OFF_HAND_FILE_VERSION : HOLD_NEW_FILE_VERSION, animations };
}

function buildHoldAnimationText() {
    let file = buildHoldAnimationFile();
    return file ? compileJSON(file) : '';
}

function buildAttachableHoldLines() {
    if (!Project || getRoute() !== 'attachable') return '';
    let link = analyseHolds();
    let missing = collectHoldAnimations(link).filter(entry => entry.status === 'missing' || entry.status === 'new');
    if (!missing.length) return '';
    let animations = {};
    let animate = [];
    for (let entry of missing) {
        let short = entry.name.split('.').pop();
        animations[short] = entry.name;
        let views = HOLD_VIEWS.filter(view => entry.plays.some(cell => cell.startsWith(view)));
        let condition = views.length === 2 ? null : (views[0] === 'first_person' ? 'c.is_first_person' : '!c.is_first_person');
        animate.push(condition ? { [short]: condition } : short);
    }
    return compileJSON({ animations, scripts: { animate } });
}

function exportHoldAnimationFile() {
    let text = buildHoldAnimationText();
    if (!text) return false;
    Blockbench.export({
        resource_id: 'animation',
        type: i18n('display_sensei.hold_write.file_type'),
        extensions: ['json'],
        name: `${getHoldStem()}.animation`,
        content: text
    });
    return true;
}
