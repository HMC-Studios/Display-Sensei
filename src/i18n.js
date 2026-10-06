// =========================
// Translations
// =========================
const DS_TRANSLATIONS = /*@@DS_TRANSLATIONS@@*/{};

const PLUGIN_LANGUAGE_STORAGE_KEY = 'display_sensei_plugin_language';

function getActiveLanguageCode() {
    return Language.code || 'en';
}

function i18n(key) {
    let activeTable = DS_TRANSLATIONS[getActiveLanguageCode()];
    if (activeTable && typeof activeTable[key] === 'string') {
        return activeTable[key];
    }
    let englishTable = DS_TRANSLATIONS.en;
    if (englishTable && typeof englishTable[key] === 'string') {
        return englishTable[key];
    }
    return key;
}

function i18nFormat(key, values) {
    let text = i18n(key);
    let entries = values && typeof values === 'object' ? Object.entries(values) : [];
    entries.forEach(([name, value]) => {
        text = text.split(`{${name}}`).join(String(value));
    });
    return text;
}
