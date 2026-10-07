'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = __dirname;
const SRC_DIR = path.join(ROOT, 'src');
const LANG_DIR = path.join(ROOT, 'lang');
const META_FILE = path.join(SRC_DIR, 'meta.js');
const ENTRY_FILE = path.join(ROOT, 'plugins.json.entry.json');
const TRANSLATIONS_MARKER = '/*@@DS_TRANSLATIONS@@*/{}';
const PANEL_ICON_DECLARATION = /const PANEL_ICON = '([^']+)';/g;
const SOURCE_ORDER = [
    'meta.js',
    'i18n.js',
    'util.js',
    'bedrock_spec.js',
    'project_data.js',
    'pack_link.js',
    'block_route.js',
    'views.js',
    'native_display_panel.js',
    'bedrock_references.js',
    'hand_views.js',
    'armor_spec.js',
    'attachable_rig.js',
    'armor_route.js',
    'hold_link.js',
    'attachable_hold.js',
    'hold_writer.js',
    'armor_preview.js',
    'hold_views.js',
    'pivot_markers.js',
    'panel_css.js',
    'panel_layout.js',
    'panel_ui.js',
    'lifecycle.js'
];
const REQUIRED_META_FIELDS = ['title', 'author', 'icon', 'description', 'version'];
const I18N_KEY_PATTERN = /['"`](display_sensei\.[a-z_]+\.[a-z0-9_]*[a-z0-9])['"`]/g;
const FORBIDDEN_UI_TEXT = /java/i;

function fail(message) {
    console.error('build.js: ' + message);
    process.exit(1);
}

function relative(file) {
    return path.relative(ROOT, file);
}

function readText(file) {
    let text;
    try {
        text = fs.readFileSync(file, 'utf8');
    } catch (error) {
        fail(`could not read ${relative(file)}: ${error.message}`);
    }
    return text.replace(/^﻿/, '').replace(/\r\n/g, '\n');
}

function listFiles(dir, extension) {
    try {
        return fs.readdirSync(dir).filter(name => name.endsWith(extension)).sort();
    } catch (error) {
        fail(`could not read the folder ${relative(dir)}: ${error.message}`);
    }
}

function readMeta() {
    let result;
    try {
        let code = readText(META_FILE) + '\n;({ PLUGIN_ID, PLUGIN_META });';
        result = vm.runInContext(code, vm.createContext({}), { filename: META_FILE });
    } catch (error) {
        fail(`could not evaluate src/meta.js: ${error.message}`);
    }
    let id = result.PLUGIN_ID;
    let meta = result.PLUGIN_META;
    if (typeof id !== 'string' || !/^[a-z][a-z0-9_]+$/.test(id)) {
        fail(`PLUGIN_ID must be snake case, got ${JSON.stringify(id)}`);
    }
    if (!meta || typeof meta !== 'object') {
        fail('PLUGIN_META must be an object literal');
    }
    for (let [key, value] of Object.entries(meta)) {
        let isPlain = typeof value === 'string' || typeof value === 'boolean' ||
            (Array.isArray(value) && value.every(item => typeof item === 'string'));
        if (!isPlain) {
            fail(`PLUGIN_META.${key} must be a string, a boolean or a list of strings`);
        }
    }
    let missing = REQUIRED_META_FIELDS.filter(key => !meta[key]);
    if (missing.length) {
        fail(`PLUGIN_META is missing ${missing.join(', ')}`);
    }
    return { id, meta: JSON.parse(JSON.stringify(meta)) };
}

function readTranslations() {
    let translations = {};
    for (let name of listFiles(LANG_DIR, '.json')) {
        let table;
        try {
            table = JSON.parse(readText(path.join(LANG_DIR, name)));
        } catch (error) {
            fail(`lang/${name} is not valid JSON: ${error.message}`);
        }
        if (!table || typeof table !== 'object' || Array.isArray(table)) {
            fail(`lang/${name} must be a flat object of "key": "text" pairs`);
        }
        for (let [key, value] of Object.entries(table)) {
            if (typeof value !== 'string') {
                fail(`lang/${name}: the value of "${key}" must be a string`);
            }
            if (FORBIDDEN_UI_TEXT.test(value)) {
                fail(`lang/${name}: the text of "${key}" mentions Java; say what Bedrock does (or that it is not measured in game yet) instead`);
            }
        }
        translations[path.basename(name, '.json')] = table;
    }
    if (!translations.en) {
        fail('lang/en.json is missing. English is the fallback for every other language.');
    }
    for (let [code, table] of Object.entries(translations)) {
        let missingKeys = Object.keys(translations.en).filter(key => !(key in table));
        if (missingKeys.length) {
            console.warn(`build.js: lang/${code}.json lacks ${missingKeys.length} key(s); English is used for them.`);
        }
    }
    return translations;
}

function checkI18nKeys(sources, englishTable) {
    let used = new Set();
    let missing = new Set();
    for (let source of sources) {
        for (let match of source.code.matchAll(I18N_KEY_PATTERN)) {
            used.add(match[1]);
            if (!(match[1] in englishTable)) {
                missing.add(`${match[1]}  (src/${source.name})`);
            }
        }
    }
    if (missing.size) {
        fail('keys used in src/ but missing from lang/en.json:\n  ' + [...missing].join('\n  '));
    }
    let unused = Object.keys(englishTable).filter(key => !used.has(key));
    if (unused.length) {
        console.warn('build.js: keys in lang/en.json that src/ never uses:\n  ' + unused.join('\n  '));
    }
}

function embedPanelIcon(body) {
    let matches = [...body.matchAll(PANEL_ICON_DECLARATION)];
    if (matches.length !== 1) {
        fail(`expected one "const PANEL_ICON = '...';" in src/, found ${matches.length}`);
    }
    let [declaration, value] = matches[0];
    if (!value.endsWith('.png')) return body;
    let file = path.join(ROOT, value);
    let data;
    try {
        data = fs.readFileSync(file);
    } catch (error) {
        fail(`could not read the panel icon ${relative(file)}: ${error.message}`);
    }
    return body.replace(declaration, `const PANEL_ICON = 'data:image/png;base64,${data.toString('base64')}';`);
}

function writeOutputs(outputs) {
    let replaced = [];
    try {
        for (let output of outputs) {
            fs.writeFileSync(output.file + '.tmp', output.text);
        }
        for (let output of outputs) {
            fs.renameSync(output.file + '.tmp', output.file);
            replaced.push(relative(output.file));
        }
    } catch (error) {
        for (let output of outputs) {
            fs.rmSync(output.file + '.tmp', { force: true });
        }
        let note = replaced.length ? ` (${replaced.join(', ')} was already replaced; fix the problem and build again)` : '';
        fail(`could not write the build output: ${error.message}${note}`);
    }
}

function build() {
    let { id, meta } = readMeta();
    let translations = readTranslations();

    let present = listFiles(SRC_DIR, '.js');
    let unlisted = present.filter(name => !SOURCE_ORDER.includes(name));
    let missingFiles = SOURCE_ORDER.filter(name => !present.includes(name));
    if (unlisted.length || missingFiles.length) {
        fail(`src/ and SOURCE_ORDER differ: not listed ${JSON.stringify(unlisted)}, missing ${JSON.stringify(missingFiles)}`);
    }
    let sources = SOURCE_ORDER
        .map(name => ({ name, code: readText(path.join(SRC_DIR, name)) }));
    checkI18nKeys(sources, translations.en);

    let body = sources
        .map(source => `// ---- src/${source.name} ----\n\n${source.code.trimEnd()}\n`)
        .join('\n');
    let markerCount = body.split(TRANSLATIONS_MARKER).length - 1;
    if (markerCount !== 1) {
        fail(`expected the marker ${TRANSLATIONS_MARKER} exactly once in src/, found it ${markerCount} time(s)`);
    }
    body = body.split(TRANSLATIONS_MARKER).join(JSON.stringify(translations, null, 4));
    body = embedPanelIcon(body);

    let banner = [
        '/*',
        ` * ${meta.title} v${meta.version}`,
        ' * Built by build.js from src/, lang/ and icon.png. Edit those, not this file.',
        ' *',
        ' * Copyright (c) 2026 HMC Studios',
        ' * MIT License, see the LICENSE file.',
        ' */',
        ''
    ].join('\n');
    let output = banner + "(function() {\n'use strict';\n\n" + body + '\n})();\n';

    let outFile = path.join(ROOT, id + '.js');
    try {
        new vm.Script(output, { filename: path.basename(outFile) });
    } catch (error) {
        fail(`the generated plugin has a syntax error, nothing was written:\n${error.stack}`);
    }
    let entry = JSON.stringify({ [id]: meta }, null, '\t') + '\n';
    writeOutputs([
        { file: outFile, text: output },
        { file: ENTRY_FILE, text: entry }
    ]);

    let sizeKb = (Buffer.byteLength(output) / 1024).toFixed(1);
    console.log(`Built ${path.basename(outFile)} (${sizeKb} KB, ${sources.length} source files, ` +
        `languages: ${Object.keys(translations).join(', ')}) and ${path.basename(ENTRY_FILE)}.`);
}

build();
