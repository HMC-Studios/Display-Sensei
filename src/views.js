// =========================
// Views: Display Mode per context (block route)
// =========================

// =========================
// Contexts
// =========================
const SLOT_LOADERS = {
    firstperson_righthand: 'loadFirstRight',
    firstperson_lefthand: 'loadFirstLeft',
    thirdperson_righthand: 'loadThirdRight',
    thirdperson_lefthand: 'loadThirdLeft',
    fixed: 'loadFixed',
    ground: 'loadGround',
    on_shelf: 'loadShelf',
    embedded: 'loadEmbedded',
    gui: 'loadGUI',
    head: 'loadHead'
};

const SUBTAB_CAMERAS = {
    third_back: 'back',
    third_front: 'front'
};

function findContextView(subtabId, handId) {
    let slot = findSlotForContext(subtabId, handId);
    if (!slot) return null;
    return {
        subtabId,
        handId: slot.hand || null,
        slotId: slot.id,
        loader: SLOT_LOADERS[slot.id],
        camera: SUBTAB_CAMERAS[subtabId] || null
    };
}

function hasThirdPersonViews(slotId) {
    let slot = findBedrockSlot(slotId);
    return !!slot && slot.subtabs.some(subtabId => SUBTAB_CAMERAS[subtabId]);
}

function getSlotHand(slotId) {
    let slot = findBedrockSlot(slotId);
    return slot && slot.hand ? slot.hand : null;
}

// =========================
// Third-person cameras
// =========================
const THIRD_PERSON_CAMERAS = {
    back: { position: [33, 45, 46], target: [4, 16, -3], fov: 45 },
    back_straight: { position: [0, 38, 56], target: [0, 17, 0], fov: 45 },
    front: { position: [16, 33, -55], target: [3, 17, -2], fov: 45 }
};

const TUNED_ITEM_POSITION = [6, 13.5266, -5.6746];

function getTunedItemPosition(reference = displayReferenceObjects.active) {
    return (reference && getTunedHoldPosition(reference)) ||
        getTunedHoldPosition(getBedrockReference('bedrock_player')) ||
        TUNED_ITEM_POSITION;
}

const BACK_CAMERA_STYLES = ['shoulder', 'straight'];
let backCameraStyle = 'shoulder';

function setBackCameraStyle(style) {
    if (BACK_CAMERA_STYLES.includes(style)) {
        backCameraStyle = style;
    }
}

const DISPLAY_PREVIEW_ID = 'display';

function getDisplayPreview() {
    return Preview.all.find(preview => preview.id === DISPLAY_PREVIEW_ID) || null;
}

function getHeldItemPosition(handId) {
    let area = DisplayMode.display_area;
    if (area && typeof area.getWorldPosition === 'function') {
        return area.getWorldPosition(new THREE.Vector3()).toArray();
    }
    let side = handId === 'left' ? -1 : 1;
    return [TUNED_ITEM_POSITION[0] * side, TUNED_ITEM_POSITION[1], TUNED_ITEM_POSITION[2]];
}

function offsetFromItem(point, side, tuned) {
    return [(point[0] - tuned[0]) * side, point[1] - tuned[1], point[2] - tuned[2]];
}

function computeThirdPersonCamera(view, handId, itemPosition, reference) {
    let cameraId = (view === 'back' && backCameraStyle === 'straight') ? 'back_straight' : view;
    let camera = THIRD_PERSON_CAMERAS[cameraId];
    if (!camera) return null;
    let side = handId === 'left' ? -1 : 1;
    let tuned = getTunedItemPosition(reference);
    let place = point => offsetFromItem(point, side, tuned).map((offset, axis) => itemPosition[axis] + offset);
    return { position: place(camera.position), target: place(camera.target), fov: camera.fov };
}

function applyThirdPersonCamera(view, handId) {
    let preview = getDisplayPreview();
    let camera = computeThirdPersonCamera(view, handId, getHeldItemPosition(handId));
    if (!preview || !camera) return;
    preview.loadAnglePreset({
        projection: 'perspective',
        position: camera.position,
        target: camera.target,
        fov: camera.fov
    });
}

// =========================
// Cameras of the other hand views (14_hand_views.js)
// =========================
const FIRST_PERSON_CAMERA = { position: [0, 24, 32.4], target: [0, 24, 0] };

const HAND_VIEW_MIN_RADIUS = 6;
const HAND_VIEW_MARGIN = 1.25;

function getFirstPersonFocalLength(aspect) {
    if (aspect > 1.7) return 18 / aspect;
    if (aspect > 1.0) return 16.57 - 3.57 * aspect;
    return 13 * aspect;
}

function getHeldItemSphere(handId) {
    let box = new THREE.Box3().expandByPoint(new THREE.Vector3().fromArray(getHeldItemPosition(handId)));
    if (Project && Project.model_3d) {
        Project.model_3d.updateMatrixWorld(true);
        let itemBox = new THREE.Box3().setFromObject(Project.model_3d);
        if (!itemBox.isEmpty()) box.union(itemBox);
    }
    return box.getBoundingSphere(new THREE.Sphere());
}

function frameHeldItem(camera, handId) {
    let sphere = getHeldItemSphere(handId);
    let radius = Math.max(sphere.radius, HAND_VIEW_MIN_RADIUS) * HAND_VIEW_MARGIN;
    let direction = new THREE.Vector3().fromArray(camera.position).sub(new THREE.Vector3().fromArray(camera.target)).normalize();
    let distance = radius / Math.sin(camera.fov * Math.PI / 360);
    return {
        position: sphere.center.clone().addScaledVector(direction, distance).toArray(),
        target: sphere.center.toArray(),
        fov: camera.fov
    };
}

function getHandViewCamera(view, aspect, reference) {
    if (!view.camera) {
        return { position: FIRST_PERSON_CAMERA.position.slice(), target: FIRST_PERSON_CAMERA.target.slice(), focalLength: getFirstPersonFocalLength(aspect) };
    }
    let camera = computeThirdPersonCamera(view.camera, view.handId, getHeldItemPosition(view.handId), reference);
    return camera ? frameHeldItem(camera, view.handId) : null;
}

let thirdPersonView = null;

function aimThirdPersonCamera() {
    let slotId = DisplayMode.display_slot;
    if (getRoute() !== 'block' || !Modes.display || !thirdPersonView || !hasThirdPersonViews(slotId)) return;
    applyThirdPersonCamera(thirdPersonView, getSlotHand(slotId));
}

function getThirdPersonView() {
    if (thirdPersonView) return thirdPersonView;
    let preview = getDisplayPreview();
    if (preview && preview.camera.position.z > preview.controls.target.z) {
        return 'back';
    }
    return 'front';
}

// =========================
// Showing a context
// =========================
let isShowingContext = false;

function showContext(subtabId, handId) {
    if (getRoute() !== 'block') return null;
    let view = findContextView(subtabId, handId);
    if (!view) return null;

    isShowingContext = true;
    try {
        let modeChanged = enterDisplayMode();
        DisplayMode[view.loader]();
        markBlockbenchSlotButton(view.slotId);
        if (view.camera) {
            thirdPersonView = view.camera;
            applyThirdPersonCamera(view.camera, view.handId);
        }
        if (modeChanged) {
            keepPanelVisibleInDisplayMode();
        }
    } catch (error) {
        console.error(LOG_PREFIX, 'Could not show the view:', error);
        showMessage('display_sensei.message.view_failed');
        return null;
    } finally {
        isShowingContext = false;
    }
    onActiveContextChanged();
    return view.slotId;
}

const GUI_CAMERA_ZOOM = 0.5;

function resetContextView(subtabId, handId) {
    let view = findContextView(subtabId, handId);
    if (getRoute() !== 'block' || !view) return null;
    resetPoseAngle(view.slotId);
    let slotId = showContext(subtabId, handId);
    let preview = getDisplayPreview();
    if (slotId && preview && preview.isOrtho && preview.camera.zoom !== GUI_CAMERA_ZOOM) {
        preview.camera.zoom = GUI_CAMERA_ZOOM;
        preview.camera.updateProjectionMatrix();
    }
    return slotId;
}

function ensureContextShown(subtabId, handId) {
    let view = findContextView(subtabId, handId);
    if (view && isShowingSlot(view.slotId)) return view.slotId;
    return showContext(subtabId, handId);
}

function enterDisplayMode() {
    if (Modes.display) return false;
    Modes.options.display.select();
    return true;
}

function markBlockbenchSlotButton(slotId) {
    document.querySelectorAll('#display_bar input[name="display"]').forEach(input => {
        input.checked = input.id === slotId;
    });
}

function keepPanelVisibleInDisplayMode() {
    if (getPanel()) {
        focusPanel();
    }
}

// =========================
// Following Display Mode
// =========================
function getActiveContext() {
    if (getRoute() !== 'block' || !Modes.display) return null;
    let slot = findBedrockSlot(DisplayMode.display_slot);
    if (!slot) return null;
    let camera = hasThirdPersonViews(slot.id) ? getThirdPersonView() : null;
    let subtabId = slot.subtabs.find(id => (SUBTAB_CAMERAS[id] || null) === camera);
    let tab = MAIN_TABS.find(entry => entry.subtabs.some(subtab => subtab.id === subtabId));
    if (!subtabId || !tab) return null;
    return {
        tabId: tab.id,
        subtabId,
        handId: slot.hand || null,
        slotId: slot.id
    };
}

function isShowingSlot(slotId) {
    return getRoute() === 'block' && !!Project && !!Modes.display && DisplayMode.display_slot === slotId &&
        !!Project.display_settings[slotId] && DisplayMode.slot === Project.display_settings[slotId];
}

function onActiveContextChanged() {
    refreshPanelSafely();
}

let isReloadingSlot = false;

function afterSlotLoader() {
    if (isShowingContext || isReloadingSlot || getRoute() !== 'block') return;
    if (hasThirdPersonViews(DisplayMode.display_slot)) {
        thirdPersonView = null;
    }
    onActiveContextChanged();
}

function afterDisplayModeLoad() {
    if (isShowingContext || getRoute() !== 'block') return;
    let slotId = DisplayMode.display_slot;
    if (thirdPersonView && hasThirdPersonViews(slotId)) {
        applyThirdPersonCamera(thirdPersonView, getSlotHand(slotId));
    }
    onActiveContextChanged();
}

// =========================
// The shelf preview
// =========================
function getShelfStandIn(slot) {
    if (slot || DisplayMode.display_slot !== 'on_shelf' || !shelfCopiesItemFrame()) return null;
    return ensureSlot('fixed');
}

function getDrawnDisplaySlot(slot) {
    if (slot) return slot;
    if (getRoute() !== 'block' || !Project) return null;
    return getShelfStandIn(slot) || Project.display_settings[DisplayMode.display_slot] || null;
}

function updateShelfDisplayBase(original, args) {
    let project = Project;
    if (getRoute() !== 'block' || DisplayMode.display_slot !== 'on_shelf') {
        return original.apply(DisplayMode, args);
    }
    let drawArgs = args;
    let standIn = getShelfStandIn(args[0]);
    if (standIn) {
        drawArgs = [standIn];
    }
    if (project.shelf_align_bottom) {
        return original.apply(DisplayMode, drawArgs);
    }
    return withTemporaryValue(project, 'shelf_align_bottom', true, () => original.apply(DisplayMode, drawArgs));
}

// =========================
// Wrapping DisplayMode functions
// =========================
function wrapSlotLoader(slotId) {
    return wrapMethod(DisplayMode, SLOT_LOADERS[slotId], (original, args) => {
        ensureSlot(slotId);
        let result = original.apply(DisplayMode, args);
        afterSlotLoader();
        return result;
    });
}

function wrapDisplayModeLoad() {
    return wrapMethod(DisplayMode, 'load', (original, args) => {
        isReloadingSlot = true;
        let result;
        try {
            result = original.apply(DisplayMode, args);
        } finally {
            isReloadingSlot = false;
        }
        afterDisplayModeLoad();
        return result;
    });
}

function refreshShownSlot() {
    if (!Modes.display || getRoute() !== 'block') return;
    if (ensureSlot(DisplayMode.display_slot)) DisplayMode.updateDisplayBase();
}

// =========================
// Install
// =========================
function installViews() {
    let wrappers = createDeletables(
        Object.keys(SLOT_LOADERS).map(slotId => () => wrapSlotLoader(slotId)).concat([
            wrapDisplayModeLoad,
            () => wrapMethod(DisplayMode, 'updateDisplayBase', updateShelfDisplayBase)
        ])
    );
    refreshShownSlot();

    return {
        delete() {
            wrappers.delete();
            thirdPersonView = null;
            if (Modes.display && getRoute() === 'block' && DisplayMode.display_slot === 'on_shelf') {
                DisplayMode.updateDisplayBase();
            }
        }
    };
}

registerModuleInstaller('views', installViews);
