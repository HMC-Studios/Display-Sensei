// =========================
// Pack link (read only)
// =========================

// =========================
// Wizards
// =========================
const WIZARDS = [
    { id: 'item', stampKey: 'blockbench_item_wizard', dialogId: 'minecraft_item_wizard', trackerGlobal: 'ItemWizardProject', modelKind: 'attachable' },
    { id: 'block', stampKey: 'blockbench_block_wizard', dialogId: 'minecraft_block_wizard', trackerGlobal: 'BlockWizardProject', modelKind: 'block' },
    { id: 'entity', stampKey: 'blockbench_entity_wizard', dialogId: 'minecraft_entity_wizard', trackerGlobal: 'EntityWizardProject', modelKind: 'entity' }
];

const WIZARD_FILES = {
    item: [
        { pack: 'bp', path: 'items/{f}.item.json' },
        { pack: 'bp', path: 'manifest.json' },
        { pack: 'bp', path: 'pack_icon.png' },
        { pack: 'rp', path: 'attachables/{f}.attachable.json' },
        { pack: 'rp', path: 'animations/attachables/{f}.animation.json' },
        { pack: 'rp', path: 'textures/item_texture.json' },
        { pack: 'rp', path: 'texts/en_US.lang' },
        { pack: 'rp', path: 'manifest.json' },
        { pack: 'rp', path: 'pack_icon.png' }
    ],
    block: [
        { pack: 'bp', path: 'blocks/{f}.block.json' },
        { pack: 'bp', path: 'loot_tables/blocks/{f}.json' },
        { pack: 'bp', path: 'manifest.json' },
        { pack: 'bp', path: 'pack_icon.png' },
        { pack: 'rp', path: 'models/blocks/{f}.geo.json' },
        { pack: 'rp', path: 'block_culling/leaves.block_culling_rules.json' },
        { pack: 'rp', path: 'textures/blocks/{f}.png' },
        { pack: 'rp', path: 'textures/terrain_texture.json' },
        { pack: 'rp', path: 'textures/flipbook_textures.json' },
        { pack: 'rp', path: 'blocks.json' },
        { pack: 'rp', path: 'texts/en_US.lang' },
        { pack: 'rp', path: 'manifest.json' },
        { pack: 'rp', path: 'pack_icon.png' }
    ],
    entity: [
        { pack: 'bp', path: 'entities/{f}.behavior.json' },
        { pack: 'bp', path: 'loot_tables/entities/{f}.json' },
        { pack: 'bp', path: 'manifest.json' },
        { pack: 'bp', path: 'pack_icon.png' },
        { pack: 'rp', path: 'models/entity/{f}.geo.json' },
        { pack: 'rp', path: 'textures/entity/{f}.png' },
        { pack: 'rp', path: 'textures/entity/{f}/' },
        { pack: 'rp', path: 'animations/{f}.animation.json' },
        { pack: 'rp', path: 'render_controllers/{f}.render_controllers.json' },
        { pack: 'rp', path: 'entity/{f}.entity.json' },
        { pack: 'rp', path: 'textures/item_texture.json' },
        { pack: 'rp', path: 'textures/items/{f}_spawn_egg.png' },
        { pack: 'rp', path: 'texts/en_US.lang' },
        { pack: 'rp', path: 'sounds.json' },
        { pack: 'rp', path: 'manifest.json' },
        { pack: 'rp', path: 'pack_icon.png' }
    ]
};

const ITEM_WIZARD_PRESET_MODELS = [
    { preset: 'iron_ingot', fingerprint: '9cdfe544' },
    { preset: 'apple', fingerprint: 'fcc7ccfd' },
    { preset: 'sword', fingerprint: '6d1c1630' },
    { preset: 'pickaxe', fingerprint: '68b601e6' },
    { preset: 'helmet', fingerprint: '8c3c9e37' },
    { preset: 'chestplate', fingerprint: '54072157' },
    { preset: 'leggings', fingerprint: 'e7f78b52' },
    { preset: 'boots', fingerprint: '511756e0' }
];

function findWizard(wizardId) {
    return WIZARDS.find(wizard => wizard.id === wizardId) || null;
}

function isProjectTrackedByWizard(wizardId, project = Project) {
    let wizard = findWizard(wizardId);
    let tracker = wizard ? window[wizard.trackerGlobal] : null;
    return !!project && isPlainObject(tracker) && !!tracker.project && tracker.project === project.uuid;
}

function isDialogOpen(dialogId) {
    if (typeof Dialog === 'undefined') return false;
    if (Dialog.open && Dialog.open.id === dialogId) return true;
    return Array.isArray(Dialog.stack) && Dialog.stack.some(dialog => !!dialog && dialog.id === dialogId);
}

function isWizardDialogOpen(wizardId) {
    let wizard = findWizard(wizardId);
    return !!wizard && isDialogOpen(wizard.dialogId);
}

// =========================
// Wizard compiles
// =========================
let overwriteDepth = 0;

function runInsideBedrockOverwrite(fn) {
    overwriteDepth++;
    try {
        return fn();
    } finally {
        overwriteDepth--;
    }
}

function isInsideBedrockOverwrite() {
    return overwriteDepth > 0;
}

function isPluginRawCompile(event) {
    return !!event && !!event.options && event.options.raw === true && !isInsideBedrockOverwrite();
}

function getWizardEntityCompileSource(event) {
    if (!Project) return null;
    if (Project.geometry_name === '{name}') return 'entity';
    if (!isPluginRawCompile(event)) return null;
    if (isWizardDialogOpen('item') || isProjectTrackedByWizard('item', Project)) return 'item';
    if (isWizardDialogOpen('entity') || isProjectTrackedByWizard('entity', Project)) return 'entity';
    return null;
}

function isBlockWizardCompile(event) {
    return isPluginRawCompile(event) && (isWizardDialogOpen('block') || isProjectTrackedByWizard('block', Project));
}

function stripItemDisplayTransforms(geometries) {
    for (let geometry of geometries) {
        if (isPlainObject(geometry)) delete geometry.item_display_transforms;
    }
}

let itemWizardNoticeProjects = new WeakSet();
let blockWizardNoticeProjects = new WeakSet();

function noteItemWizardCompile() {
    if (!Project || itemWizardNoticeProjects.has(Project)) return;
    itemWizardNoticeProjects.add(Project);
    showNotification('item_wizard_compile', i18n('display_sensei.message.item_wizard_compile'));
}

function getBlockWizardVersionLosses(transforms) {
    if (!isPlainObject(transforms)) return [];
    let losses = [];
    if (transforms.shelf) losses.push('shelf');
    if (isPlainObject(transforms.gui) && transforms.gui.fit_to_frame === false) losses.push('fit_to_frame_off');
    return losses;
}

function describeBlockWizardVersionLosses(losses) {
    let sentences = [];
    if (losses.includes('shelf')) sentences.push(i18n('display_sensei.wizard_feature.shelf'));
    if (losses.includes('fit_to_frame_off')) sentences.push(i18n('display_sensei.wizard_feature.fit_to_frame_off'));
    return sentences.join(' ');
}

function noteBlockWizardCompile(transforms) {
    let losses = getBlockWizardVersionLosses(transforms);
    if (!losses.length || blockWizardNoticeProjects.has(Project)) return;
    blockWizardNoticeProjects.add(Project);
    showNotification('block_wizard_version', i18nFormat('display_sensei.message.block_wizard_version', {
        features: describeBlockWizardVersionLosses(losses)
    }));
}

// =========================
// Ctrl+S into models/entity
// =========================
const ENTITY_MODELS_FOLDER = /[\\/]models[\\/]entity[\\/]/i;

const UNSAVED_WORK_DIALOG_ID = 'close';

let bypassSaveGuard = false;
let dismissedSaveWarnings = new WeakSet();

function needsEntitySaveWarning(project = Project) {
    return !!project && !!project.format && project.format.id === BLOCK_FORMAT_ID &&
        typeof project.export_path === 'string' && ENTITY_MODELS_FOLDER.test(project.export_path) &&
        !dismissedSaveWarnings.has(project);
}

function onExportOverUse() {
    if (bypassSaveGuard || isDialogOpen(UNSAVED_WORK_DIALOG_ID) || !needsEntitySaveWarning()) return undefined;
    showEntitySaveWarning(Project);
    return false;
}

function getWrittenGeometryId(project) {
    return 'geometry.' + (project.geometry_name || 'unknown');
}

function identifierMatchesFileName(project) {
    let name = String(project.geometry_name || '').toLowerCase();
    return !!name && getGeometryFileStem(String(project.export_path)).toLowerCase() === name;
}

function showEntitySaveWarning(project) {
    let path = String(project.export_path).replace(/`/g, '');
    let identifier = getWrittenGeometryId(project).replace(/`/g, '');
    let message = i18nFormat('display_sensei.save_guard.message', { path, identifier });
    if (identifierMatchesFileName(project)) {
        message += '\n\n' + i18nFormat('display_sensei.save_guard.renamed', { identifier });
    }
    Blockbench.showMessageBox({
        title: i18n('display_sensei.save_guard.title'),
        message,
        icon: 'warning',
        buttons: [
            i18n('display_sensei.save_guard.save_anyway'),
            i18n('display_sensei.save_guard.save_elsewhere'),
            i18n('display_sensei.ui.cancel')
        ],
        confirmIndex: 0,
        cancelIndex: 2,
        checkboxes: {
            dont_ask: { value: false, text: i18n('display_sensei.save_guard.dont_ask') }
        }
    }, (button, result) => {
        try {
            onEntitySaveWarningClosed(project, button, result);
        } catch (error) {
            console.warn(LOG_PREFIX, 'The save warning failed:', error);
        }
    });
}

function onEntitySaveWarningClosed(project, button, result) {
    if (project !== Project) return;
    if (button === 0) {
        if (result && result.dont_ask === true) dismissedSaveWarnings.add(project);
        bypassSaveGuard = true;
        try {
            BarItems.export_over.click();
        } finally {
            bypassSaveGuard = false;
        }
    } else if (button === 1) {
        saveSomewhereElse(project).catch(error => console.warn(LOG_PREFIX, 'Saving somewhere else failed:', error));
    }
}

async function saveSomewhereElse(project) {
    await saveTextures();
    if (project !== Project) return;
    if (project.save_path) {
        Codecs.project.write(Codecs.project.compile(), project.save_path);
    }
    await Codecs.bedrock.export();
}

function createSaveGuardListener() {
    let action = typeof BarItems !== 'undefined' ? BarItems.export_over : null;
    if (!action || typeof action.on !== 'function') return { delete() {} };
    return action.on('use', guardVetoListener('save guard', onExportOverUse));
}

// =========================
// Geometry fingerprints
// =========================
function canonicalJson(value) {
    if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
    if (isPlainObject(value)) {
        let keys = Object.keys(value).sort();
        return '{' + keys.map(key => JSON.stringify(key) + ':' + canonicalJson(value[key])).join(',') + '}';
    }
    if (typeof value === 'number') return JSON.stringify(Math.round(value * 10000) / 10000);
    return JSON.stringify(value);
}

function fnv1aHex(text) {
    let hash = 0x811c9dc5;
    for (let index = 0; index < text.length; index++) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
}

function getGeometryFingerprint(geometry) {
    if (!isPlainObject(geometry)) return null;
    let copy = Object.assign({}, geometry);
    if (isPlainObject(copy.description)) {
        copy.description = Object.assign({}, copy.description);
        delete copy.description.identifier;
    }
    return fnv1aHex(canonicalJson(copy));
}

function findItemWizardPreset(geometry) {
    let fingerprint = getGeometryFingerprint(geometry);
    let match = ITEM_WIZARD_PRESET_MODELS.find(entry => entry.fingerprint === fingerprint);
    return match ? match.preset : null;
}

// =========================
// Reading files
// =========================
function isDesktopApp() {
    return typeof isApp !== 'undefined' && !!isApp && typeof PathModule !== 'undefined';
}

function escapeRegExp(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function exactNameRegex(name) {
    return new RegExp('^' + escapeRegExp(name) + '$', 'i');
}

function containingRegex(text) {
    return text ? new RegExp(escapeRegExp(text), 'i') : undefined;
}

function findFiles(folders, options, check) {
    return Blockbench.findFileFromContent(folders, options, (path, content) => {
        try {
            return check(path, content);
        } catch (error) {
            return false;
        }
    });
}

function readJsonInFolder(folder, fileName) {
    let found = findFiles([folder], { filter_regex: exactNameRegex(fileName), recursive: false, json: true },
        (path, content) => (isPlainObject(content) ? { path, content } : false));
    return found || null;
}

function listFolder(folder) {
    let names = [];
    findFiles([folder], { recursive: false, read_file: false }, path => {
        names.push(PathModule.basename(path));
        return false;
    });
    return names;
}

function fileExists(scan, absolutePath) {
    let folder = PathModule.dirname(absolutePath);
    let key = folder.toLowerCase();
    if (!scan.listings.has(key)) {
        scan.listings.set(key, listFolder(folder).map(name => name.toLowerCase()));
    }
    return scan.listings.get(key).includes(PathModule.basename(absolutePath).toLowerCase());
}

function findJsonInFolderTree(folder, hint, test) {
    let found = findFiles([folder], { filter_regex: /\.json$/i, priority_regex: containingRegex(hint), json: true },
        (path, content) => (isPlainObject(content) && test(content) ? { path, content } : false));
    return found || null;
}

function findFilesDefining(folder, ids, hint, sectionKey) {
    let found = {};
    let remaining = ids.slice();
    if (!remaining.length) return found;
    findFiles([folder], { filter_regex: /\.json$/i, priority_regex: containingRegex(hint), json: true }, (path, content) => {
        let section = isPlainObject(content) ? content[sectionKey] : null;
        if (!isPlainObject(section)) return false;
        let stillMissing = [];
        for (let id of remaining) {
            if (Object.prototype.hasOwnProperty.call(section, id)) {
                found[id] = path;
            } else {
                stillMissing.push(id);
            }
        }
        remaining = stillMissing;
        return remaining.length === 0;
    });
    return found;
}

// =========================
// Searches remembered for the session
// =========================
let behaviorPackManifests = new Map();
let missingIds = new Map();

function forgetRememberedSearches() {
    behaviorPackManifests = new Map();
    missingIds = new Map();
}

function readBehaviorPackManifests(packsFolder) {
    let key = packsFolder.toLowerCase();
    if (!behaviorPackManifests.has(key)) {
        let manifests = [];
        findFiles([packsFolder], { filter_regex: /^manifest\.json$/i, json: true }, (path, content) => {
            if (isPlainObject(content)) manifests.push({ path: PathModule.dirname(path), manifest: content });
            return false;
        });
        behaviorPackManifests.set(key, manifests);
    }
    return behaviorPackManifests.get(key);
}

function findPackFilesDefining(scan, folderName, ids, sectionKey) {
    let rootKey = scan.roots.rp.toLowerCase();
    if (!missingIds.has(rootKey)) missingIds.set(rootKey, new Set());
    let missing = missingIds.get(rootKey);
    let wanted = [];
    for (let id of ids) {
        if (!missing.has(sectionKey + '|' + id)) wanted.push(id);
    }
    let found = findFilesDefining(PathModule.join(scan.roots.rp, folderName), wanted, scan.stem, sectionKey);
    for (let id of wanted) {
        if (!found[id]) missing.add(sectionKey + '|' + id);
    }
    return found;
}

function joinPackPath(root, relativePath) {
    return PathModule.join(root, ...relativePath.split('/'));
}

function relativePackPath(root, absolutePath) {
    return PathModule.relative(root, absolutePath).split(PathModule.sep).join('/');
}

function isInsideFolder(folder, path) {
    let relative = PathModule.relative(folder, path);
    return !!relative && !relative.startsWith('..') && !PathModule.isAbsolute(relative);
}

function getGeometryFileStem(path) {
    return getFileBaseName(path).replace(/\.json$/i, '').replace(/\.geo$/i, '');
}

// =========================
// Packs
// =========================
const MAX_PACK_ROOT_DEPTH = 8;

function hasModuleType(manifest, type) {
    return isPlainObject(manifest) && Array.isArray(manifest.modules) &&
        manifest.modules.some(module => isPlainObject(module) && module.type === type);
}

function getManifestUuid(manifest) {
    let header = isPlainObject(manifest) ? manifest.header : null;
    return isPlainObject(header) && typeof header.uuid === 'string' ? header.uuid.toLowerCase() : null;
}

function getDependencyUuids(manifest) {
    if (!isPlainObject(manifest) || !Array.isArray(manifest.dependencies)) return [];
    return manifest.dependencies
        .filter(dependency => isPlainObject(dependency) && typeof dependency.uuid === 'string')
        .map(dependency => dependency.uuid.toLowerCase());
}

function findResourcePackRoot(startPath) {
    let folder = PathModule.dirname(startPath);
    for (let depth = 0; depth < MAX_PACK_ROOT_DEPTH; depth++) {
        let manifest = readJsonInFolder(folder, 'manifest.json');
        if (manifest && hasModuleType(manifest.content, 'resources')) return { path: folder, manifest: manifest.content };
        if (manifest && hasModuleType(manifest.content, 'data')) return null;
        if (/(resource_packs|behavior_packs)$/i.test(PathModule.basename(folder))) return null;
        let parent = PathModule.dirname(folder);
        if (parent === folder) return null;
        folder = parent;
    }
    return null;
}

function readWizardStamps(manifest) {
    let metadata = isPlainObject(manifest) ? manifest.metadata : null;
    let generatedWith = isPlainObject(metadata) ? metadata.generated_with : null;
    if (!isPlainObject(generatedWith)) return [];
    return Object.keys(generatedWith).map(key => {
        let wizard = WIZARDS.find(entry => entry.stampKey === key);
        let raw = generatedWith[key];
        let versions = (Array.isArray(raw) ? raw : [raw]).filter(version => typeof version === 'string');
        return { wizard: wizard ? wizard.id : 'other', key, versions };
    });
}

function mergeStamps(first, second) {
    let stamps = cloneJson(first);
    for (let stamp of second) {
        let same = stamps.find(entry => entry.key === stamp.key);
        if (!same) {
            stamps.push(cloneJson(stamp));
            continue;
        }
        for (let version of stamp.versions) {
            if (!same.versions.includes(version)) same.versions.push(version);
        }
    }
    return stamps;
}

function getBehaviorPacksFolder(resourcePacksFolder) {
    let name = PathModule.basename(resourcePacksFolder);
    if (!/resource_packs$/i.test(name)) return resourcePacksFolder;
    let pairedName = name.slice(0, name.length - 'resource_packs'.length) + 'behavior_packs';
    return PathModule.join(PathModule.dirname(resourcePacksFolder), pairedName);
}

const BEHAVIOR_PACK_NAME_SWAPS = [
    ['RP', 'BP'], ['rp', 'bp'], ['Rp', 'Bp'],
    ['Resources', 'Behavior'], ['Resources', 'Behaviors'], ['Resource', 'Behavior'],
    ['resources', 'behavior'], ['resources', 'behaviors'], ['resource', 'behavior']
];

const BEHAVIOR_PACK_SUFFIX_SWAPS = [['RP', 'BP'], ['rp', 'bp'], ['Rp', 'Bp']];

function guessBehaviorPackNames(resourcePackName) {
    let names = [resourcePackName];
    for (let [from, to] of BEHAVIOR_PACK_NAME_SWAPS) {
        let word = new RegExp('(^|[^A-Za-z])' + from + '(?=[^A-Za-z]|$)', 'g');
        let swapped = resourcePackName.replace(word, '$1' + to);
        if (!names.includes(swapped)) names.push(swapped);
    }
    for (let [from, to] of BEHAVIOR_PACK_SUFFIX_SWAPS) {
        if (!resourcePackName.endsWith(from)) continue;
        let swapped = resourcePackName.slice(0, resourcePackName.length - from.length) + to;
        if (!names.includes(swapped)) names.push(swapped);
    }
    return names;
}

function pairsWithResourcePack(bpManifest, rpUuid, rpDependencyUuids) {
    if (!hasModuleType(bpManifest, 'data')) return false;
    let bpUuid = getManifestUuid(bpManifest);
    return (!!rpUuid && getDependencyUuids(bpManifest).includes(rpUuid)) ||
        (!!bpUuid && rpDependencyUuids.includes(bpUuid));
}

function pairsByNameAlone(bpManifest, rpDependencyUuids) {
    return hasModuleType(bpManifest, 'data') && rpDependencyUuids.length === 0 && getDependencyUuids(bpManifest).length === 0;
}

function foundBehaviorPack(path, manifest) {
    return { path, name: PathModule.basename(path), manifest, status: 'found', candidates: [] };
}

function noBehaviorPack(status, candidates) {
    return { path: null, name: null, manifest: null, status, candidates };
}

function findBehaviorPack(rpRoot, rpManifest) {
    let rpName = PathModule.basename(rpRoot);
    let packsFolder = getBehaviorPacksFolder(PathModule.dirname(rpRoot));
    let rpUuid = getManifestUuid(rpManifest);
    let rpDependencyUuids = getDependencyUuids(rpManifest);

    for (let name of guessBehaviorPackNames(rpName)) {
        let folder = PathModule.join(packsFolder, name);
        if (folder.toLowerCase() === rpRoot.toLowerCase()) continue;
        let manifest = readJsonInFolder(folder, 'manifest.json');
        if (!manifest) continue;
        if (pairsWithResourcePack(manifest.content, rpUuid, rpDependencyUuids) || pairsByNameAlone(manifest.content, rpDependencyUuids)) {
            return foundBehaviorPack(folder, manifest.content);
        }
    }
    if (!/behavior_packs$/i.test(PathModule.basename(packsFolder))) return noBehaviorPack('missing', []);
    let matches = [];
    for (let entry of readBehaviorPackManifests(packsFolder)) {
        if (pairsWithResourcePack(entry.manifest, rpUuid, rpDependencyUuids)) matches.push(entry);
    }
    if (matches.length === 1) return foundBehaviorPack(matches[0].path, matches[0].manifest);
    if (matches.length > 1) {
        let names = [];
        for (let match of matches) names.push(PathModule.basename(match.path));
        return noBehaviorPack('ambiguous', names);
    }
    return noBehaviorPack('missing', []);
}

// =========================
// The model in the pack
// =========================
function getStartPath(project) {
    let candidates = [project.export_path, project.save_path];
    for (let texture of project.textures || []) candidates.push(texture && texture.path);
    return candidates.find(path => typeof path === 'string' && path !== '' && PathModule.isAbsolute(path)) || null;
}

function getGeometries(content) {
    let list = isPlainObject(content) ? content['minecraft:geometry'] : null;
    return Array.isArray(list) ? list.filter(isPlainObject) : [];
}

function findGeometryById(content, identifier) {
    return getGeometries(content).find(geometry =>
        isPlainObject(geometry.description) && geometry.description.identifier === identifier) || null;
}

function findGeometryFile(scan) {
    let project = scan.project;
    let identifier = project.geometry_name ? 'geometry.' + project.geometry_name : null;
    let exportPath = project.export_path;
    if (exportPath && isInsideFolder(scan.roots.rp, exportPath)) {
        let file = readJsonInFolder(PathModule.dirname(exportPath), PathModule.basename(exportPath));
        if (!file) return null;
        let geometry = (identifier && findGeometryById(file.content, identifier)) || getGeometries(file.content)[0] || null;
        return { path: file.path, geometry };
    }
    if (!identifier) return null;
    let found = findJsonInFolderTree(PathModule.join(scan.roots.rp, 'models'), project.geometry_name,
        content => !!findGeometryById(content, identifier));
    return found ? { path: found.path, geometry: findGeometryById(found.content, identifier) } : null;
}

function kindFromFolder(relativeGeometryPath) {
    let path = relativeGeometryPath.toLowerCase();
    if (path.startsWith('models/entity/attachable/') || path.startsWith('models/entity/attachables/')) return 'attachable';
    return null;
}

const ENTITY_FILE_TYPES = [
    { kind: 'attachable', folder: 'attachables', key: 'minecraft:attachable' },
    { kind: 'entity', folder: 'entity', key: 'minecraft:client_entity' }
];

function getDefinitionDescription(content, key) {
    let main = isPlainObject(content) ? content[key] : null;
    return isPlainObject(main) && isPlainObject(main.description) ? main.description : null;
}

function getStringValues(object) {
    return isPlainObject(object) ? Object.values(object).filter(value => typeof value === 'string') : [];
}

function classifyEntityFile(rpRoot, geometryName, preferredKind = null) {
    if (!geometryName) return null;
    let wanted = 'geometry.' + geometryName;
    let types = preferredKind === 'entity' ? ENTITY_FILE_TYPES.slice().reverse() : ENTITY_FILE_TYPES;
    for (let type of types) {
        let found = findJsonInFolderTree(PathModule.join(rpRoot, type.folder), geometryName, content => {
            let description = getDefinitionDescription(content, type.key);
            return !!description && getStringValues(description.geometry).includes(wanted);
        });
        if (found) return { kind: type.kind, path: found.path, description: getDefinitionDescription(found.content, type.key) };
    }
    return null;
}

function getAttachableItemIds(attachableDescription) {
    let ids = [];
    if (!attachableDescription) return ids;
    if (isPlainObject(attachableDescription.item)) {
        for (let id of Object.keys(attachableDescription.item)) ids.push(id);
    }
    let identifier = attachableDescription.identifier;
    if (typeof identifier === 'string' && !ids.includes(identifier)) ids.push(identifier);
    return ids;
}

function findLinkedItem(bpRoot, attachableDescription, stem) {
    let ids = getAttachableItemIds(attachableDescription);
    if (!bpRoot || !ids.length) return null;
    return findJsonInFolderTree(PathModule.join(bpRoot, 'items'), stem, content => {
        let description = getDefinitionDescription(content, 'minecraft:item');
        return !!description && ids.includes(description.identifier);
    });
}

function findLinkedEntity(bpRoot, clientDescription, stem) {
    let identifier = clientDescription && clientDescription.identifier;
    if (!bpRoot || typeof identifier !== 'string') return null;
    return findJsonInFolderTree(PathModule.join(bpRoot, 'entities'), stem, content => {
        let description = getDefinitionDescription(content, 'minecraft:entity');
        return !!description && description.identifier === identifier;
    });
}

function getBlockComponentLists(content) {
    let block = isPlainObject(content) ? content['minecraft:block'] : null;
    if (!isPlainObject(block)) return [];
    let lists = [block.components];
    if (Array.isArray(block.permutations)) {
        for (let permutation of block.permutations) lists.push(isPlainObject(permutation) ? permutation.components : null);
    }
    return lists.filter(isPlainObject);
}

function blockUsesGeometry(content, geometryId) {
    return getBlockComponentLists(content).some(components => {
        let geometry = components['minecraft:geometry'];
        return geometry === geometryId || (isPlainObject(geometry) && geometry.identifier === geometryId);
    });
}

function findLinkedBlock(bpRoot, geometryId, stem) {
    if (!bpRoot) return null;
    return findJsonInFolderTree(PathModule.join(bpRoot, 'blocks'), stem, content => blockUsesGeometry(content, geometryId));
}

function getMaterialTextureNames(content) {
    let names = [];
    for (let components of getBlockComponentLists(content)) {
        let instances = components['minecraft:material_instances'];
        if (!isPlainObject(instances)) continue;
        for (let instance of Object.values(instances)) {
            if (isPlainObject(instance) && typeof instance.texture === 'string' && !names.includes(instance.texture)) {
                names.push(instance.texture);
            }
        }
    }
    return names;
}

function getItemComponents(content) {
    let item = isPlainObject(content) ? content['minecraft:item'] : null;
    return isPlainObject(item) && isPlainObject(item.components) ? item.components : null;
}

function readComponentValue(component) {
    return isPlainObject(component) && 'value' in component ? component.value : component;
}

function getItemIconName(components) {
    let icon = components['minecraft:icon'];
    if (typeof icon === 'string') return icon;
    if (!isPlainObject(icon)) return null;
    if (typeof icon.texture === 'string') return icon.texture;
    if (isPlainObject(icon.textures) && typeof icon.textures.default === 'string') return icon.textures.default;
    return null;
}

function readAtlasTexturePaths(entry) {
    let textures = isPlainObject(entry) ? entry.textures : null;
    let paths = [];
    for (let texture of Array.isArray(textures) ? textures : [textures]) {
        if (typeof texture === 'string') {
            paths.push(texture);
        } else if (isPlainObject(texture) && typeof texture.path === 'string') {
            paths.push(texture.path);
        } else if (isPlainObject(texture) && Array.isArray(texture.variations)) {
            for (let variation of texture.variations) {
                if (isPlainObject(variation) && typeof variation.path === 'string') paths.push(variation.path);
            }
        }
    }
    return paths;
}

function getRenderControllerIds(list) {
    if (!Array.isArray(list)) return [];
    let ids = [];
    for (let entry of list) {
        if (typeof entry === 'string') ids.push(entry);
        else if (isPlainObject(entry)) ids.push(...Object.keys(entry));
    }
    return ids;
}

// =========================
// File list
// =========================
const ROLE_KINDS = {
    geometry: 'look',
    attachable: 'look',
    client_entity: 'look',
    animation: 'look',
    render_controller: 'look',
    texture: 'look',
    item_texture: 'look',
    icon: 'look',
    spawn_egg: 'look',
    terrain_texture: 'look',
    flipbook: 'look',
    item: 'code',
    entity: 'code',
    block: 'code',
    lang: 'code',
    sounds: 'code',
    blocks_json: 'code',
    manifest: 'code',
    pack_icon: 'code'
};

function addFileRow(scan, pack, path, role, exists, id = null, maybeGame = false) {
    let key = [pack, path.toLowerCase(), exists === true ? '' : id].join('|');
    if (scan.rowKeys.has(key)) return;
    scan.rowKeys.add(key);
    scan.files.push({
        pack, path, role, kind: ROLE_KINDS[role] || 'code', rewritten: false, exists, maybe_game: maybeGame, id
    });
}

function isKnownGameReference(reference) {
    let text = reference.toLowerCase();
    return text.startsWith('minecraft:') || text.startsWith('textures/misc/') || text.startsWith('controller.render.');
}

function addReferenceNotInPack(scan, reference, role, id) {
    if (isKnownGameReference(reference)) {
        addFileRow(scan, 'game', reference, role, null, id);
    } else {
        addFileRow(scan, 'rp', reference, role, false, id, true);
    }
}

function addFoundFile(scan, pack, absolutePath, role, id = null) {
    addFileRow(scan, pack, relativePackPath(scan.roots[pack], absolutePath), role, true, id);
}

function addFileIfPresent(scan, pack, relativePath, role) {
    let root = scan.roots[pack];
    if (root && fileExists(scan, joinPackPath(root, relativePath))) addFileRow(scan, pack, relativePath, role, true);
}

function addLinkedFile(scan, pack, found, role, searchedFolder, id) {
    if (found) {
        addFoundFile(scan, pack, found.path, role, id);
    } else if (id && isKnownGameReference(id)) {
        addFileRow(scan, 'game', id, role, null, id);
    } else if (id) {
        addFileRow(scan, pack, searchedFolder, role, scan.roots[pack] ? false : null, id);
    }
}

function addTextureRow(scan, texturePath, role, id = texturePath) {
    let clean = texturePath.replace(/\\/g, '/').replace(/^\/+/, '');
    let candidates = /\.(png|tga)$/i.test(clean) ? [clean] : [clean + '.png', clean + '.tga'];
    let found = candidates.find(path => fileExists(scan, joinPackPath(scan.roots.rp, path)));
    if (found) {
        addFileRow(scan, 'rp', found, role, true, id);
    } else {
        addReferenceNotInPack(scan, clean, role, id);
    }
}

function addIconRows(scan, shortName, role) {
    if (!shortName) return;
    let atlas = readJsonInFolder(PathModule.join(scan.roots.rp, 'textures'), 'item_texture.json');
    if (atlas) addFoundFile(scan, 'rp', atlas.path, 'item_texture');
    let data = atlas && isPlainObject(atlas.content.texture_data) ? atlas.content.texture_data : {};
    let paths = readAtlasTexturePaths(data[shortName]);
    if (!paths.length) addReferenceNotInPack(scan, shortName, role, shortName);
    for (let path of paths) addTextureRow(scan, path, role, shortName);
}

function addAnimationRows(scan, ids) {
    let controllerIds = ids.filter(id => id.startsWith('controller.'));
    let animationIds = ids.filter(id => !id.startsWith('controller.'));
    let groups = [
        { folder: 'animations', section: 'animations', ids: animationIds },
        { folder: 'animation_controllers', section: 'animation_controllers', ids: controllerIds }
    ];
    for (let group of groups) {
        let found = findPackFilesDefining(scan, group.folder, group.ids, group.section);
        for (let id of group.ids) {
            if (found[id]) scan.animationFiles[id] = found[id];
            if (found[id]) addFoundFile(scan, 'rp', found[id], 'animation', id);
            else addReferenceNotInPack(scan, id, 'animation', id);
        }
    }
}

function addRenderControllerRows(scan, ids) {
    let found = findPackFilesDefining(scan, 'render_controllers', ids, 'render_controllers');
    for (let id of ids) {
        if (found[id]) addFoundFile(scan, 'rp', found[id], 'render_controller', id);
        else addReferenceNotInPack(scan, id, 'render_controller', id);
    }
}

function addGeometryRow(scan) {
    let id = scan.project.geometry_name ? 'geometry.' + scan.project.geometry_name : null;
    addLinkedFile(scan, 'rp', scan.geometryFile, 'geometry', 'models/', id);
}

function addEntityFileRow(scan, role, folder) {
    let id = scan.project.geometry_name ? 'geometry.' + scan.project.geometry_name : null;
    addLinkedFile(scan, 'rp', scan.entityFile, role, folder, id);
}

function listAttachableFiles(scan) {
    addGeometryRow(scan);
    addEntityFileRow(scan, 'attachable', 'attachables/');
    let description = scan.entityFile ? scan.entityFile.description : null;
    if (!description) return;
    addAnimationRows(scan, getStringValues(description.animations));
    for (let texture of getStringValues(description.textures)) addTextureRow(scan, texture, 'texture');
    scan.item = findLinkedItem(scan.roots.bp, description, scan.stem);
    let components = scan.item ? getItemComponents(scan.item.content) : null;
    if (components) addIconRows(scan, getItemIconName(components), 'icon');
    let itemDescription = scan.item ? getDefinitionDescription(scan.item.content, 'minecraft:item') : null;
    let itemId = itemDescription ? itemDescription.identifier : (getAttachableItemIds(description)[0] || null);
    addLinkedFile(scan, 'bp', scan.item, 'item', 'items/', itemId);
}

function listEntityFiles(scan) {
    addGeometryRow(scan);
    addEntityFileRow(scan, 'client_entity', 'entity/');
    let description = scan.entityFile ? scan.entityFile.description : null;
    if (description) {
        addAnimationRows(scan, getStringValues(description.animations));
        addRenderControllerRows(scan, getRenderControllerIds(description.render_controllers));
        for (let texture of getStringValues(description.textures)) addTextureRow(scan, texture, 'texture');
        let spawnEgg = description.spawn_egg;
        if (isPlainObject(spawnEgg) && typeof spawnEgg.texture === 'string') addIconRows(scan, spawnEgg.texture, 'spawn_egg');
        let entity = findLinkedEntity(scan.roots.bp, description, scan.stem);
        addLinkedFile(scan, 'bp', entity, 'entity', 'entities/', typeof description.identifier === 'string' ? description.identifier : null);
    }
    addFileIfPresent(scan, 'rp', 'sounds.json', 'sounds');
}

function listBlockFiles(scan) {
    addGeometryRow(scan);
    let geometryId = scan.project.geometry_name ? 'geometry.' + scan.project.geometry_name : null;
    let block = geometryId ? findLinkedBlock(scan.roots.bp, geometryId, scan.stem) : null;
    let atlas = readJsonInFolder(PathModule.join(scan.roots.rp, 'textures'), 'terrain_texture.json');
    if (atlas) addFoundFile(scan, 'rp', atlas.path, 'terrain_texture');
    let data = atlas && isPlainObject(atlas.content.texture_data) ? atlas.content.texture_data : {};
    for (let name of block ? getMaterialTextureNames(block.content) : []) {
        let paths = readAtlasTexturePaths(data[name]);
        if (!paths.length) addReferenceNotInPack(scan, name, 'texture', name);
        for (let path of paths) addTextureRow(scan, path, 'texture', name);
    }
    addFileIfPresent(scan, 'rp', 'textures/flipbook_textures.json', 'flipbook');
    addLinkedFile(scan, 'bp', block, 'block', 'blocks/', geometryId);
    addFileIfPresent(scan, 'rp', 'blocks.json', 'blocks_json');
}

function addPackFiles(scan) {
    addFileIfPresent(scan, 'rp', 'texts/en_US.lang', 'lang');
    addFileIfPresent(scan, 'bp', 'texts/en_US.lang', 'lang');
    addFileRow(scan, 'rp', 'manifest.json', 'manifest', true);
    addFileIfPresent(scan, 'rp', 'pack_icon.png', 'pack_icon');
    if (scan.roots.bp) {
        addFileRow(scan, 'bp', 'manifest.json', 'manifest', true);
        addFileIfPresent(scan, 'bp', 'pack_icon.png', 'pack_icon');
    }
}

function markRewrittenFiles(files, wizardId, stem) {
    let rewritten = WIZARD_FILES[wizardId] || [];
    for (let row of files) {
        if (row.exists !== true) continue;
        let path = row.path.toLowerCase();
        row.rewritten = rewritten.some(entry => {
            if (entry.pack !== row.pack) return false;
            let wanted = entry.path.split('{f}').join(stem).toLowerCase();
            return wanted.endsWith('/') ? path.startsWith(wanted) : path === wanted;
        });
    }
}

// =========================
// Notes
// =========================
const ARMOR_WEARABLE_SLOTS = ['slot.armor.head', 'slot.armor.chest', 'slot.armor.legs', 'slot.armor.feet', 'slot.armor.body'];
const OFFHAND_WEARABLE_SLOT = 'slot.weapon.offhand';
const MOUNT_SLOTS = ['slot.saddle', 'slot.armor', 'slot.chest'];

function buildNotes(scan) {
    let notes = [];
    let project = scan.project;
    if (scan.kind === 'unknown' && project.format && project.format.id === ENTITY_FORMAT_ID) {
        notes.push({ id: 'no_entity_file', values: { identifier: getWrittenGeometryId(project) } });
    }
    let components = scan.item ? getItemComponents(scan.item.content) : null;
    if (components) {
        let wearable = components['minecraft:wearable'];
        let slot = isPlainObject(wearable) && typeof wearable.slot === 'string' ? wearable.slot : null;
        if (ARMOR_WEARABLE_SLOTS.includes(slot)) notes.push({ id: 'wearable_armor', values: { slot } });
        else if (slot === OFFHAND_WEARABLE_SLOT) notes.push({ id: 'wearable_offhand', values: {} });
        else if (MOUNT_SLOTS.includes(slot)) notes.push({ id: 'mount_slot', values: { slot } });
        if (readComponentValue(components['minecraft:hand_equipped']) === true) notes.push({ id: 'hand_equipped', values: {} });
    }
    let description = scan.kind === 'attachable' && scan.entityFile ? scan.entityFile.description : null;
    let materials = description && isPlainObject(description.materials) ? description.materials : null;
    let glintMaterial = !!materials && typeof materials.default === 'string' && materials.default.includes('glint');
    if (glintMaterial || (components && readComponentValue(components['minecraft:glint']) === true)) {
        notes.push({ id: 'glint', values: {} });
    }
    let useAnimation = components ? readComponentValue(components['minecraft:use_animation']) : null;
    if (useAnimation === 'eat' || useAnimation === 'drink') notes.push({ id: 'use_animation', values: { animation: useAnimation } });
    let preset = scan.geometryFile ? findItemWizardPreset(scan.geometryFile.geometry) : null;
    if (preset) notes.push({ id: 'own_model', values: { preset } });
    let exportPath = scan.project.export_path;
    if (exportPath && isInsideFolder(scan.roots.rp, exportPath)) {
        notes.push({ id: 'saves_into', values: { path: relativePackPath(scan.roots.rp, exportPath) } });
    }
    if (scan.wizard) notes.push({ id: 'reexport', values: { wizard: scan.wizard } });
    return notes;
}

// =========================
// Scanning
// =========================
let linkCache = new WeakMap();
let pendingScans = new Map();

function getLinkKey(project) {
    return [project.format ? project.format.id : '', project.export_path, project.save_path, project.geometry_name].join('|');
}

function createEmptyView(status) {
    return { status, rp: null, bp: null, stamps: [], kind: null, wizard: null, files: [], notes: [] };
}

function findModelKind(scan) {
    let project = scan.project;
    if (project.format && project.format.id === BLOCK_FORMAT_ID) return 'block';
    if (!project.format || project.format.id !== ENTITY_FORMAT_ID) return 'unknown';
    if (scan.entityFile) return scan.entityFile.kind;
    let folderKind = scan.geometryFile ? kindFromFolder(relativePackPath(scan.roots.rp, scan.geometryFile.path)) : null;
    return readBlockbenchEntityKind(project) || folderKind || 'unknown';
}

function readWearInfo(scan) {
    let description = scan.kind === 'attachable' && scan.entityFile ? scan.entityFile.description : null;
    let components = scan.item ? getItemComponents(scan.item.content) : null;
    if (!description && !components) return null;
    let wearable = components ? components['minecraft:wearable'] : null;
    let slot = isPlainObject(wearable) && typeof wearable.slot === 'string' ? wearable.slot : null;
    let scripts = description && isPlainObject(description.scripts) ? description.scripts : null;
    let parentSetup = scripts ? scripts.parent_setup : null;
    if (Array.isArray(parentSetup)) parentSetup = parentSetup.filter(line => typeof line === 'string').join('\n');
    if (typeof parentSetup !== 'string') parentSetup = null;
    let renderControllers = description ? getRenderControllerIds(description.render_controllers) : [];
    return { slot, parentSetup, renderControllers };
}

function buildLinkEntry(project) {
    let unlinked = status => ({ view: createEmptyView(status), entityKind: null, wear: null, attachable: null, animationFiles: {} });
    if (!isDesktopApp()) return unlinked('desktop_only');
    let startPath = getStartPath(project);
    if (!startPath) return unlinked('no_path');
    let rp = findResourcePackRoot(startPath);
    if (!rp) return unlinked('not_in_pack');
    let bp = findBehaviorPack(rp.path, rp.manifest);

    let scan = {
        project,
        roots: { rp: rp.path, bp: bp.path },
        listings: new Map(),
        files: [],
        rowKeys: new Set(),
        geometryFile: null,
        entityFile: null,
        item: null,
        kind: 'unknown',
        stem: '',
        wizard: null,
        animationFiles: {}
    };
    scan.geometryFile = findGeometryFile(scan);
    scan.stem = scan.geometryFile ? getGeometryFileStem(scan.geometryFile.path) : (project.geometry_name || '');
    if (project.format && project.format.id === ENTITY_FORMAT_ID) {
        scan.entityFile = classifyEntityFile(rp.path, project.geometry_name, readBlockbenchEntityKind(project));
    }
    scan.kind = findModelKind(scan);

    let stamps = mergeStamps(readWizardStamps(rp.manifest), readWizardStamps(bp.manifest));
    let wizard = WIZARDS.find(entry => entry.modelKind === scan.kind && stamps.some(stamp => stamp.wizard === entry.id));
    scan.wizard = wizard ? wizard.id : null;

    if (scan.kind === 'attachable') listAttachableFiles(scan);
    else if (scan.kind === 'entity') listEntityFiles(scan);
    else if (scan.kind === 'block') listBlockFiles(scan);
    else addGeometryRow(scan);
    addPackFiles(scan);
    if (scan.wizard) markRewrittenFiles(scan.files, scan.wizard, scan.stem);

    let view = {
        status: 'linked',
        rp: { name: PathModule.basename(rp.path), path: rp.path },
        bp: { name: bp.name, path: bp.path, status: bp.status, candidates: bp.candidates },
        stamps,
        kind: scan.kind,
        wizard: scan.wizard,
        files: scan.files,
        notes: buildNotes(scan)
    };
    return {
        view,
        entityKind: scan.entityFile ? scan.entityFile.kind : null,
        wear: readWearInfo(scan),
        attachable: scan.kind === 'attachable' && scan.entityFile ? { path: scan.entityFile.path, description: scan.entityFile.description } : null,
        animationFiles: scan.animationFiles
    };
}

function scanPackLink(project = Project) {
    if (!project) return null;
    let entry;
    try {
        entry = buildLinkEntry(project);
    } catch (error) {
        console.warn(LOG_PREFIX, 'Could not read the pack of this project:', error);
        entry = { view: createEmptyView('error'), entityKind: null, wear: null, attachable: null, animationFiles: {} };
    }
    entry.key = getLinkKey(project);
    linkCache.set(project, entry);
    for (let listener of packScanListeners.slice()) listener(project);
    return cloneJson(entry.view);
}

let packScanListeners = [];

function onPackLinkScanned(listener) {
    packScanListeners.push(listener);
    return {
        delete() {
            packScanListeners = packScanListeners.filter(entry => entry !== listener);
        }
    };
}

function requestPackLinkScan(project = Project, force = false) {
    if (!project || pendingScans.has(project)) return;
    let entry = linkCache.get(project);
    if (!force && entry && entry.key === getLinkKey(project)) return;
    let timer = setTimeout(() => {
        pendingScans.delete(project);
        if (!ModelProject.all.includes(project)) return;
        scanPackLink(project);
        refreshPanelSafely();
    }, 0);
    pendingScans.set(project, timer);
}

function refreshPackLink(project = Project) {
    forgetRememberedSearches();
    requestPackLinkScan(project, true);
}

function isPackScanNeededForRoute(project = Project) {
    return !!project && !!project.format && project.format.id === ENTITY_FORMAT_ID && !readBlockbenchEntityKind(project);
}

function getPackLinkView(project = Project) {
    let entry = project ? linkCache.get(project) : null;
    if (!entry || !entry.view) return null;
    let view = cloneJson(entry.view);
    if (project === Project && view.status === 'linked' && view.wizard === 'block') {
        let losses = getBlockWizardVersionLosses(buildItemDisplayTransforms());
        if (losses.length) view.notes.push({ id: 'block_wizard_version', values: { losses } });
    }
    return view;
}

function getLinkedEntityKind(project) {
    let entry = project ? linkCache.get(project) : null;
    return entry ? entry.entityKind : null;
}

function getLinkedWearInfo(project = Project) {
    let entry = project ? linkCache.get(project) : null;
    return entry && entry.wear ? cloneJson(entry.wear) : null;
}

function getLinkedAttachable(project = Project) {
    let entry = project ? linkCache.get(project) : null;
    return entry && entry.attachable ? cloneJson(entry.attachable) : null;
}

function getLinkedAnimationFiles(project = Project) {
    let entry = project ? linkCache.get(project) : null;
    return entry && entry.animationFiles ? Object.assign({}, entry.animationFiles) : {};
}

// =========================
// Reading a file as text
// =========================
function readPackTextFile(path) {
    if (!isDesktopApp() || typeof path !== 'string' || !PathModule.isAbsolute(path)) return null;
    let found = findFiles([PathModule.dirname(path)], { filter_regex: exactNameRegex(PathModule.basename(path)), recursive: false },
        (filePath, content) => (typeof content === 'string' ? { content } : false));
    return found ? found.content : null;
}

// =========================
// Opening a pack folder
// =========================
function openPackFolder(which = 'rp', project = Project) {
    let entry = project ? linkCache.get(project) : null;
    let pack = entry && entry.view ? entry.view[which === 'bp' ? 'bp' : 'rp'] : null;
    if (!pack || !pack.path || typeof Filesystem === 'undefined' || typeof Filesystem.showFileInFolder !== 'function') return false;
    Filesystem.showFileInFolder(joinPackPath(pack.path, 'manifest.json'));
    return true;
}

// =========================
// Install
// =========================
function installPackLink() {
    let hooks = createDeletables([createSaveGuardListener]);
    return {
        delete() {
            hooks.delete();
            for (let timer of pendingScans.values()) clearTimeout(timer);
            pendingScans = new Map();
            packScanListeners = [];
            linkCache = new WeakMap();
            forgetRememberedSearches();
            bypassSaveGuard = false;
            overwriteDepth = 0;
            dismissedSaveWarnings = new WeakSet();
            itemWizardNoticeProjects = new WeakSet();
            blockWizardNoticeProjects = new WeakSet();
        }
    };
}

registerModuleInstaller('pack_link', installPackLink);
