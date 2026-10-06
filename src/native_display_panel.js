// =========================
// Blockbench's Display panel (block route)
// =========================
const NATIVE_DISPLAY_PANEL_ID = 'display';

// =========================
// Hiding the panel
// =========================
let isHidingInstalled = false;

function isSidebarOpen(slot) {
    if (Blockbench.isMobile) return true;
    if (slot === 'left_bar') return !!Prop.show_left_bar;
    if (slot === 'right_bar') return !!Prop.show_right_bar;
    return true;
}

function isOwnPanelShown() {
    let panel = getPanel();
    if (!panel || panel.slot === 'hidden') return false;
    let container = panel;
    if (panel.attached_to) {
        if (panel.attached_to === NATIVE_DISPLAY_PANEL_ID) return false;
        container = panel.getHostPanel();
        if (!container || container.slot === 'hidden' || !Condition(container.condition)) return false;
    }
    return isSidebarOpen(container.slot);
}

function isNativeDisplayPanelHidden() {
    return isHidingInstalled && !!Modes.display && getRoute() === 'block' && isOwnPanelShown();
}

function syncNativeDisplayPanel() {
    if (Modes.display) updateInterface();
}

function hideNativeDisplayPanel() {
    let panel = Panels[NATIVE_DISPLAY_PANEL_ID];
    if (!panel) return { delete() {} };
    let original = panel.condition;
    let condition = Object.assign({}, isPlainObject(original) ? original : {}, {
        method: context => Condition(original, context) && !isNativeDisplayPanelHidden()
    });
    panel.condition = condition;
    isHidingInstalled = true;
    return {
        delete() {
            isHidingInstalled = false;
            if (panel.condition === condition) {
                panel.condition = original;
            }
            syncNativeDisplayPanel();
        }
    };
}

// =========================
// First-person framing
// =========================
const FIRST_PERSON_SLOTS = ['firstperson_righthand', 'firstperson_lefthand'];

let hiddenAtLastResize = null;

function readHiddenForResize() {
    return Modes.display ? isNativeDisplayPanelHidden() : null;
}

function reframeFirstPersonAfterResize() {
    let hidden = readHiddenForResize();
    let changed = hidden !== null && hiddenAtLastResize !== null && hidden !== hiddenAtLastResize;
    hiddenAtLastResize = hidden;
    let slotId = DisplayMode.display_slot;
    if (changed && FIRST_PERSON_SLOTS.includes(slotId) && isShowingSlot(slotId)) {
        DisplayMode.load(slotId);
    }
}

function followResizes() {
    hiddenAtLastResize = readHiddenForResize();
    return Blockbench.on('resize_window', guardListener('resize_window', reframeFirstPersonAfterResize));
}

// =========================
// Reference models
// =========================
let referenceIdsBySlot = {};

function wrapReferenceBar() {
    return wrapMethod(displayReferenceObjects, 'bar', function(original, args) {
        if (Array.isArray(args[0])) {
            referenceIdsBySlot[DisplayMode.display_slot] = args[0].slice();
        }
        return original.apply(this, args);
    });
}

function rememberDrawnReferenceBar() {
    let bar = document.getElementById('display_ref_bar');
    let active = displayReferenceObjects.active;
    if (!Modes.display || !bar || !active) return;
    let ids = Array.from(bar.querySelectorAll('input[name="refmodel"]'), input => input.id);
    if (ids.includes(active.id)) {
        referenceIdsBySlot[DisplayMode.display_slot] = ids;
    }
}

function getOfferedReferenceIds(slotId) {
    let ids = referenceIdsBySlot[slotId];
    if (!isShowingSlot(slotId) || !ids) return null;
    let refmodels = displayReferenceObjects.refmodels;
    return ids.filter(id => refmodels[id] && Condition(refmodels[id]));
}

function getReferenceChoices(slotId) {
    let ids = getOfferedReferenceIds(slotId);
    if (!ids) return null;
    return ids.map(id => {
        let reference = displayReferenceObjects.refmodels[id];
        let { note, approximate } = describeReference(reference, slotId);
        return {
            id,
            name: reference.name,
            icon: reference.icon,
            active: displayReferenceObjects.active === reference,
            note,
            approximate
        };
    });
}

function setReferenceModel(slotId, referenceId) {
    let ids = getOfferedReferenceIds(slotId);
    let index = ids ? ids.indexOf(referenceId) : -1;
    if (index === -1) return false;
    displayReferenceObjects.refmodels[referenceId].load(index);
    markBlockbenchReferenceButton(referenceId);
    aimThirdPersonCamera();
    return true;
}

function markBlockbenchReferenceButton(referenceId) {
    document.querySelectorAll('#display_ref_bar input[name="refmodel"]').forEach(input => {
        input.checked = input.id === referenceId;
    });
}

// =========================
// Pose angle (preview only)
// =========================
function getPoseReference(slotId) {
    if (!isShowingSlot(slotId)) return null;
    let reference = displayReferenceObjects.active;
    if (!reference || typeof reference.updateBasePosition !== 'function' || !getPoseSpec(reference, slotId)) return null;
    return reference;
}

function getPoseAngle(slotId) {
    let reference = getPoseReference(slotId);
    if (!reference) return null;
    let spec = getPoseSpec(reference, slotId);
    let stored = reference.pose_angles[slotId];
    let value = clampToRange(Number.isFinite(stored) ? stored : spec.start, [spec.min, spec.max]);
    return { value, min: spec.min, max: spec.max };
}

function setPoseAngle(slotId, degrees) {
    let reference = getPoseReference(slotId);
    let angle = Number(degrees);
    if (!reference || !Number.isFinite(angle)) return false;
    let spec = getPoseSpec(reference, slotId);
    angle = clampToRange(angle, [spec.min, spec.max]);
    reference.pose_angles[slotId] = angle;
    reference.updateBasePosition();
    if (DisplayMode.vue) DisplayMode.vue.pose_angle = angle;
    return true;
}

function resetPoseAngle(slotId) {
    if (getRoute() !== 'block') return false;
    let reset = false;
    for (let reference of getPosableReferences()) {
        let start = reference.ds_definition.posable[slotId];
        if (!start) continue;
        reference.pose_angles[slotId] = start.start;
        reset = true;
    }
    return reset;
}

// =========================
// Ground preview animation
// =========================
function getPreviewAnimation(slotId) {
    if (slotId !== 'ground' || !isShowingSlot(slotId)) return null;
    return DisplayMode.animate_preview !== false;
}

function setPreviewAnimation(slotId, on) {
    if (getPreviewAnimation(slotId) === null) return false;
    DisplayMode.animate_preview = !!on;
    if (DisplayMode.vue) DisplayMode.vue.animate_preview = !!on;
    return true;
}

// =========================
// Copy, paste and New Preset
// =========================
function hasCopiedSlot() {
    return isPlainObject(Clipbench.display_slot);
}

function copyShownSlot(slotId) {
    if (!isShowingSlot(slotId)) return false;
    DisplayMode.copy();
    return true;
}

function pasteIntoShownSlot(slotId) {
    if (!isShowingSlot(slotId) || !hasCopiedSlot()) return false;
    DisplayMode.paste();
    return true;
}

function openSavePresetDialog() {
    let action = BarItems.add_display_preset;
    if (getRoute() !== 'block' || !Modes.display || !action) return false;
    for (let slot of BEDROCK_SLOTS) {
        if (Project.display_settings[slot.id]) ensureSlot(slot.id);
    }
    return action.trigger() !== false;
}

// =========================
// Reset buttons (Blockbench's Display panel)
// =========================
function followResetButtons() {
    let vue = DisplayMode.vue;
    if (!vue || typeof vue.resetChannel !== 'function') return { delete() {} };
    return wrapMethod(vue, 'resetChannel', function(original, args) {
        let slotId = DisplayMode.display_slot;
        if (getRoute() !== 'block' || !isShowingSlot(slotId)) return original.apply(this, args);
        resetSlotChannel(slotId, args[0]);
    });
}

// =========================
// Install
// =========================
function installNativeDisplayPanel() {
    let hooks = createDeletables([
        wrapReferenceBar,
        hideNativeDisplayPanel,
        followResizes,
        followResetButtons
    ]);
    rememberDrawnReferenceBar();
    return {
        delete() {
            hooks.delete();
            referenceIdsBySlot = {};
            hiddenAtLastResize = null;
        }
    };
}

registerModuleInstaller('native_display_panel', installNativeDisplayPanel);
