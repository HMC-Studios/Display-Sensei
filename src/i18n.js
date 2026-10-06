// =========================
// Translations
// =========================
const DS_TRANSLATIONS = /*@@DS_TRANSLATIONS@@*/{};

const PLUGIN_LANGUAGE_STORAGE_KEY = 'display_sensei_plugin_language';

function addPluginTranslations() {
    for (let [code, table] of Object.entries(DS_TRANSLATIONS)) {
        Language.addTranslations(code, table);
    }
    return {
        delete() {
            for (let table of Object.values(DS_TRANSLATIONS)) {
                for (let [key, text] of Object.entries(table)) {
                    if (Language.data[key] === text) delete Language.data[key];
                }
            }
        }
    };
}

function i18n(key) {
    return tl(key);
}

function i18nFormat(key, values) {
    let text = i18n(key);
    let entries = values && typeof values === 'object' ? Object.entries(values) : [];
    entries.forEach(([name, value]) => {
        text = text.split(`{${name}}`).join(String(value));
    });
    return text;
}
