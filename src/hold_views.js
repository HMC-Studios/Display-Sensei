// =========================
// Held 3D items: views and pictures (back end)
// =========================
const HOLD_VIEW_CAMERAS = Object.freeze({ first_person: 'first', third_back: 'back', third_front: 'front' });

function findHoldView(subtabId, handId) {
    let slot = findSlotForContext(subtabId, handId);
    let hold = slot ? findHoldSlot(slot.id) : null;
    let camera = HOLD_VIEW_CAMERAS[subtabId];
    return hold && camera ? { subtabId, handId: slot.hand, slotId: slot.id, camera } : null;
}

function showHoldView(subtabId, handId, aim = true) {
    let view = findHoldView(subtabId, handId);
    if (!view || !Project || getRoute() !== 'attachable') {
        hideHoldView();
        return null;
    }
    let before = getHeldPreviewState();
    let shown = setHeldPreview({ slotId: view.slotId, camera: view.camera });
    let moved = before.slotId !== view.slotId || before.camera !== view.camera;
    if (shown && (aim || moved || !before.cameraShown)) applyHeldCamera();
    return shown ? view.slotId : null;
}

function hideHoldView() {
    let state = getHeldPreviewState();
    if (!state.slotId) return false;
    setHeldPreview(null);
    if (state.cameraShown) restoreArmorCamera();
    return true;
}

function resetHoldView(subtabId, handId) {
    return showHoldView(subtabId, handId, true);
}

function getHoldViewChoices(subtabId, handId) {
    if (!isHeldPreviewShown() || !HAND_VIEW_SUBTABS.includes(subtabId)) return null;
    return HAND_VIEW_SUBTABS
        .filter(id => id !== subtabId)
        .map(id => findHoldView(id, handId))
        .filter(Boolean)
        .map(view => ({ subtabId: view.subtabId, handId: view.handId, slotId: view.slotId }));
}

// =========================
// Pictures of the other views
// =========================
let holdViewCamera = null;
let holdViewStats = { renders: 0, lastMs: 0, totalMs: 0, maxMs: 0 };

function frameHoldViewCamera(camera, placement, slot) {
    let box = new THREE.Box3().expandByPoint(new THREE.Vector3().fromArray(getHeldHandPosition(slot)));
    Project.model_3d.updateMatrixWorld(true);
    let itemBox = new THREE.Box3().setFromObject(Project.model_3d);
    if (!itemBox.isEmpty()) box.union(itemBox);
    let sphere = box.getBoundingSphere(new THREE.Sphere());
    let radius = Math.max(sphere.radius, HAND_VIEW_MIN_RADIUS) * HAND_VIEW_MARGIN;
    let direction = new THREE.Vector3().fromArray(placement.position).sub(new THREE.Vector3().fromArray(placement.target)).normalize();
    let distance = radius / Math.sin(placement.fov * Math.PI / 360);
    camera.position.copy(sphere.center).addScaledVector(direction, distance);
    camera.lookAt(sphere.center);
}

function aimHoldViewCamera(preview, slot, view, aspect) {
    if (!holdViewCamera) holdViewCamera = preview.camPers.clone(false);
    let camera = holdViewCamera;
    camera.copy(preview.camPers, false);
    camera.zoom = 1;
    camera.aspect = aspect;
    camera.up.set(0, 1, 0);
    let placement = getHeldCameraPlacement(slot, view);
    camera.fov = placement.fov;
    if (view === 'first') {
        camera.position.fromArray(placement.position);
        camera.lookAt(new THREE.Vector3().fromArray(placement.target));
    } else {
        frameHoldViewCamera(camera, placement, slot);
    }
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    return camera;
}

function drawHoldView(preview, camera, width, height) {
    let renderer = preview.renderer;
    let target = getHandViewTarget(renderer, width, height);
    let previousTarget = renderer.getRenderTarget();
    try {
        renderer.setRenderTarget(target);
        renderer.clear();
        renderer.render(Canvas.scene, camera);
    } finally {
        renderer.setRenderTarget(previousTarget);
    }
    return readHandViewPixels(renderer, target, width, height);
}

function renderHoldView(subtabId, handId, width, height) {
    let view = findHoldView(subtabId, handId);
    let preview = getArmorCameraPreview();
    let size = [Math.round(width), Math.round(height)];
    if (!view || !preview || !preview.renderer || !isHeldPreviewShown()) return null;
    if (!size.every(value => Number.isFinite(value) && value >= 1 && value <= MAX_HAND_VIEW_SIZE)) return null;
    if (Transformer.dragging || isArmorModelEditOpen()) return null;
    let started = performance.now();
    let image;
    try {
        image = withHeldPreview({ slotId: view.slotId, camera: view.camera }, () => {
            let slot = findHoldSlot(view.slotId);
            let gizmo = Transformer.visible;
            Transformer.visible = false;
            try {
                return drawHoldView(preview, aimHoldViewCamera(preview, slot, view.camera, size[0] / size[1]), size[0], size[1]);
            } finally {
                Transformer.visible = gizmo;
            }
        });
    } catch (error) {
        console.warn(LOG_PREFIX, 'Could not draw the held item view:', error);
        return null;
    }
    let took = performance.now() - started;
    holdViewStats.renders++;
    holdViewStats.lastMs = took;
    holdViewStats.totalMs += took;
    holdViewStats.maxMs = Math.max(holdViewStats.maxMs, took);
    return image;
}

function getHoldViewStats() {
    let stats = holdViewStats;
    return { renders: stats.renders, lastMs: stats.lastMs, averageMs: stats.renders ? stats.totalMs / stats.renders : 0, maxMs: stats.maxMs };
}

// =========================
// Install
// =========================
function installHoldViews() {
    holdViewStats = { renders: 0, lastMs: 0, totalMs: 0, maxMs: 0 };
    return {
        delete() {
            holdViewCamera = null;
        }
    };
}

registerModuleInstaller('hold_views', installHoldViews);
