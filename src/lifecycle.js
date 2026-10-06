// =========================
// Tools menu action
// =========================
const OPEN_ACTION_ID = 'open_display_sensei';
const TOOLS_MENU_ID = 'tools';

function createOpenAction() {
    return new Action(OPEN_ACTION_ID, {
        name: i18n('display_sensei.action.open_name'),
        description: i18n('display_sensei.action.open_description'),
        icon: PANEL_ICON,
        condition: { formats: BEDROCK_FORMAT_IDS },
        click() {
            try {
                createPanel();
                focusPanel();
            } catch (error) {
                console.error(LOG_PREFIX, 'Could not open the panel:', error);
                showMessage('display_sensei.message.open_failed');
            }
        }
    });
}

// =========================
// Blockbench events
// =========================
const SYNC_EVENTS = 'select_project unselect_project select_mode select_format update_selection';

// =========================
// Reopening the panel
// =========================
const REOPEN_PANEL_STORAGE_KEY = 'display_sensei_reopen_panel_v1';

function rememberOpenPanel() {
    try {
        if (getPanel()) localStorage.setItem(REOPEN_PANEL_STORAGE_KEY, '1');
    } catch (error) {
        console.warn(LOG_PREFIX, 'Could not remember the open panel:', error);
    }
}

function takeReopenPanelNote() {
    try {
        let reopen = localStorage.getItem(REOPEN_PANEL_STORAGE_KEY) === '1';
        localStorage.removeItem(REOPEN_PANEL_STORAGE_KEY);
        return reopen;
    } catch (error) {
        return false;
    }
}

// =========================
// Plugin lifecycle
// =========================
function onload() {
    try {
        track(addPluginTranslations());
        track(injectPanelCss());

        let openAction = track(createOpenAction());
        MenuBar.addAction(openAction, TOOLS_MENU_ID);

        track(Blockbench.on(SYNC_EVENTS, refreshPanelSafely));

        installModules();
    } catch (error) {
        console.error(LOG_PREFIX, 'Failed to load:', error);
        disposeTracked();
        return;
    }
    if (takeReopenPanelNote()) {
        try {
            createPanel();
        } catch (error) {
            console.error(LOG_PREFIX, 'Could not open the panel again:', error);
        }
    }
}

function onunload() {
    try {
        rememberOpenPanel();
        destroyPanel();
    } catch (error) {
        console.warn(LOG_PREFIX, 'Could not remove the panel:', error);
    }
    disposeTracked();
}

function onuninstall() {
    try {
        localStorage.removeItem(PLUGIN_LANGUAGE_STORAGE_KEY);
        localStorage.removeItem(UI_STATE_STORAGE_KEY);
        localStorage.removeItem(REOPEN_PANEL_STORAGE_KEY);
        localStorage.removeItem(CALIBRATED_HOLDS_STORAGE_KEY);
    } catch (error) {
        console.warn(LOG_PREFIX, 'Could not remove the saved settings:', error);
    }
}

BBPlugin.register(PLUGIN_ID, Object.assign({}, PLUGIN_META, { onload, onunload, onuninstall }));
