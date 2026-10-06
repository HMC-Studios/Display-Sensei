// =========================
// Panel layout: Float / Dock / Tab
// =========================
const PREFERRED_TAB_HOST_ID = 'outliner';

function getPanelMode() {
    let panel = getPanel();
    if (panel && panel.attached_to) return 'tabbed';
    if (panel && panel.slot === 'float') return 'floating';
    return 'docked';
}

function dockPanel(panel) {
    panel.fixed_height = false;
    panel.moveTo('right_bar');
}

// =========================
// Filling the space it is in
// =========================
let grownHostId = null;

function setHostGrowing(host, growing) {
    if (host && host.container) host.container.style.flexGrow = growing ? '1' : '';
}

function fillPanelSpace() {
    let panel = getPanel();
    let host = panel ? panel.getHostPanel() : null;
    let wanted = host && host !== panel && !host.growable && host.isInSidebar() ? host : null;
    if (grownHostId && (!wanted || wanted.id !== grownHostId)) {
        setHostGrowing(Panels[grownHostId], false);
        grownHostId = null;
    }
    if (wanted) {
        setHostGrowing(wanted, true);
        grownHostId = wanted.id;
    }
}

function releaseFilledSpace() {
    if (grownHostId) setHostGrowing(Panels[grownHostId], false);
    grownHostId = null;
}

function setPanelFloating(shouldFloat) {
    let panel = getPanel();
    if (!panel) return false;
    if (shouldFloat) {
        panel.moveTo('float');
    } else {
        dockPanel(panel);
    }
    focusPanel();
    return true;
}

function findTabHostPanel() {
    let panel = getPanel();
    let candidates = [Panels[PREFERRED_TAB_HOST_ID]].concat(Interface.getRightPanels());
    let host = candidates.find(candidate => (
        candidate &&
        candidate !== panel &&
        !candidate.attached_to &&
        candidate.slot === 'right_bar' &&
        Condition(candidate.condition)
    ));
    return host || null;
}

function setPanelTabbed() {
    let panel = getPanel();
    if (!panel) return false;
    let host = findTabHostPanel();
    if (!host) {
        setPanelFloating(false);
        return false;
    }
    panel.fixed_height = false;
    host.attachPanel(panel);
    focusPanel();
    return true;
}

function focusPanel() {
    let panel = getPanel();
    if (!panel) return;

    if (Blockbench.isMobile) {
        Interface.PanelSelectorVue.select(panel);
        refreshPanel();
        return;
    }

    let host = panel.getHostPanel();
    let hostIsShown = host && host.slot !== 'hidden' && Condition(host.condition);
    if (panel.slot === 'hidden' || (panel.attached_to && !hostIsShown)) {
        dockPanel(panel);
        host = null;
    }

    let container = host || panel;
    if (container.folded) {
        container.fold(false);
    }
    if (host) {
        host.selectTab(panel);
    }
    if (container.slot === 'float') {
        container.moveToFront();
    }
    if (container.slot === 'right_bar' && !Prop.show_right_bar) {
        Interface.toggleSidebar('right', true);
    }
    if (container.slot === 'left_bar' && !Prop.show_left_bar) {
        Interface.toggleSidebar('left', true);
    }
    updateInterface();
    refreshPanel();
}

// =========================
// Before the panel is deleted
// =========================
function releaseAttachedPanels(panel) {
    let sidebar = panel.isInSidebar() ? panel.slot : 'right_bar';
    panel.getAttachedPanels().forEach(guest => guest.moveTo(sidebar));
    Object.values(Panels).forEach(other => {
        Object.values(other.mode_position_data).forEach(layout => {
            if (layout.attached_to === panel.id) {
                layout.attached_to = '';
                layout.attached_index = 0;
                layout.slot = sidebar;
            }
        });
    });
}

function removeFromFloatingOrder(panel) {
    let index = Panel.floating_panel_z_order.indexOf(panel.id);
    if (index !== -1) {
        Panel.floating_panel_z_order.splice(index, 1);
    }
}
