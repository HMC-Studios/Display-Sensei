// =========================
// Cleanup registry
// =========================
const LOG_PREFIX = '[Display Sensei]';

const trackedDeletables = [];

function track(deletable) {
    if (deletable && typeof deletable.delete === 'function') {
        trackedDeletables.push(deletable);
    }
    return deletable;
}

const MODULE_INSTALLERS = [];

function registerModuleInstaller(name, install) {
    MODULE_INSTALLERS.push({ name, install });
}

function installModules() {
    for (let module of MODULE_INSTALLERS) {
        track(module.install());
    }
}

function disposeTracked() {
    while (trackedDeletables.length) {
        let deletable = trackedDeletables.pop();
        try {
            deletable.delete();
        } catch (error) {
            console.warn(LOG_PREFIX, 'A cleanup step failed:', error);
        }
    }
}

function deleteAll(deletables) {
    while (deletables.length) {
        deletables.pop().delete();
    }
}

function createDeletables(creators) {
    let created = [];
    try {
        for (let create of creators) {
            created.push(create());
        }
    } catch (error) {
        deleteAll(created);
        throw error;
    }
    return {
        delete() {
            deleteAll(created);
        }
    };
}

function guardListener(name, listener) {
    return function(event) {
        try {
            listener(event);
        } catch (error) {
            console.warn(LOG_PREFIX, `The ${name} hook failed:`, error);
        }
    };
}

function guardVetoListener(name, listener) {
    return function(event) {
        try {
            return listener(event);
        } catch (error) {
            console.warn(LOG_PREFIX, `The ${name} hook failed:`, error);
            return undefined;
        }
    };
}

// =========================
// Wrapping Blockbench functions
// =========================
function wrapMethod(object, name, replacement) {
    let original = object[name];
    let active = true;
    let wrapper = function(...args) {
        if (!active) return original.apply(this, args);
        return replacement.call(this, original, args);
    };
    object[name] = wrapper;
    return {
        delete() {
            active = false;
            if (object[name] === wrapper) {
                object[name] = original;
            }
        }
    };
}

function withTemporaryValue(object, key, value, fn) {
    let hadKey = Object.prototype.hasOwnProperty.call(object, key);
    let previous = object[key];
    object[key] = value;
    try {
        return fn();
    } finally {
        if (hadKey) {
            object[key] = previous;
        } else {
            delete object[key];
        }
    }
}

// =========================
// Values
// =========================
function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function roundToFour(value) {
    return Math.round(value * 10000) / 10000 + 0;
}

function getFileBaseName(path) {
    return String(path || '').split(/[\\/]/).pop();
}

// =========================
// Messages
// =========================
const QUICK_MESSAGE_MS = 3000;

function showMessage(key) {
    Blockbench.showQuickMessage(i18n(key), QUICK_MESSAGE_MS);
}

const NOTIFICATION_MS = 10000;

function showNotification(id, text) {
    Blockbench.showToastNotification({ id: `display_sensei_${id}`, text, icon: 'info', expire: NOTIFICATION_MS });
}

// =========================
// Route detection
// =========================
const BLOCK_FORMAT_ID = 'bedrock_block';
const ENTITY_FORMAT_ID = 'bedrock';
const ATTACHABLE_FORMAT_ID = ENTITY_FORMAT_ID;
const BEDROCK_FORMAT_IDS = [BLOCK_FORMAT_ID, ENTITY_FORMAT_ID];

function getFormatId() {
    return Format ? Format.id : '';
}

function isEntityFormat() {
    return getFormatId() === ENTITY_FORMAT_ID;
}

function readBlockbenchEntityKind(project) {
    let manager = project && project.BedrockEntityManager;
    let type = manager && manager.client_entity && manager.client_entity.type;
    if (type === 'attachable') return 'attachable';
    if (type === 'client_entity') return 'entity';
    return null;
}

function getBedrockEntityKind(project = Project) {
    if (!project || !project.format || project.format.id !== ENTITY_FORMAT_ID) return 'unknown';
    let blockbenchKind = readBlockbenchEntityKind(project);
    if (blockbenchKind) return blockbenchKind;
    let linked = getLinkedEntityKind(project);
    if (linked) return linked;
    if (isProjectTrackedByWizard('entity', project)) return 'entity';
    if (isProjectTrackedByWizard('item', project)) return 'attachable';
    return 'unknown';
}

function getRoute() {
    let formatId = getFormatId();
    if (formatId === BLOCK_FORMAT_ID) return 'block';
    if (formatId === ENTITY_FORMAT_ID) return getBedrockEntityKind() === 'entity' ? 'entity' : 'attachable';
    return 'none';
}

function canEditAttachable() {
    return !!Project && getRoute() === 'attachable' && !Modes.animate;
}
