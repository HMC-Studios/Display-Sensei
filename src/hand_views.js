// =========================
// Other hand views (block route)
// =========================
const HAND_VIEW_SUBTABS = ['first_person', 'third_back', 'third_front'];

const MAX_HAND_VIEW_SIZE = 1024;

const HAND_VIEW_SAMPLES = 4;

function getHandViewChoices() {
    let active = getActiveContext();
    if (!active || !active.handId || !HAND_VIEW_SUBTABS.includes(active.subtabId) || !getDisplayPreview()) return null;
    return HAND_VIEW_SUBTABS
        .filter(subtabId => subtabId !== active.subtabId)
        .map(subtabId => {
            let view = findContextView(subtabId, active.handId);
            return { subtabId, handId: active.handId, slotId: view.slotId };
        });
}

// =========================
// Switching the scene for one snapshot
// =========================
function saveTransform(object) {
    return { position: object.position.clone(), rotation: object.rotation.clone(), scale: object.scale.clone() };
}

function restoreTransform(object, saved) {
    object.position.copy(saved.position);
    object.rotation.copy(saved.rotation);
    object.scale.copy(saved.scale);
}

let isHandViewSceneShown = false;

function isDrawingHandView() {
    return isHandViewSceneShown;
}

function withHandViewScene(view, reference, render) {
    isHandViewSceneShown = true;
    try {
        return switchToHandViewScene(view, reference, render);
    } finally {
        isHandViewSceneShown = false;
    }
}

function switchToHandViewScene(view, reference, render) {
    let scene = Canvas.scene;
    let area = DisplayMode.display_area;
    let base = DisplayMode.display_base;
    let shownSlotId = DisplayMode.display_slot;
    let active = displayReferenceObjects.active;
    let swapped = reference !== active;
    let savedArea = saveTransform(area);
    let savedBase = saveTransform(base);
    let others = area.children.filter(child => child !== base && child.visible);
    let gizmoVisible = Transformer.visible;
    try {
        DisplayMode.display_slot = view.slotId;
        displayReferenceObjects.active = reference;
        let slot = ensureSlot(view.slotId);
        if (swapped) {
            if (active) scene.remove(active.model);
            scene.add(reference.model);
        }
        placeReferenceForSlot(reference);
        DisplayMode.updateDisplayBase(slot);
        others.forEach(child => {
            child.visible = false;
        });
        Transformer.visible = false;
        area.updateMatrixWorld(true);
        return render();
    } finally {
        DisplayMode.display_slot = shownSlotId;
        displayReferenceObjects.active = active;
        if (swapped) {
            scene.remove(reference.model);
            if (active) scene.add(active.model);
        } else if (view.slotId !== shownSlotId) {
            placeReferenceForSlot(active);
        }
        others.forEach(child => {
            child.visible = true;
        });
        restoreTransform(area, savedArea);
        restoreTransform(base, savedBase);
        area.updateMatrixWorld(true);
        Transformer.visible = gizmoVisible;
        Transformer.center();
    }
}

// =========================
// Rendering
// =========================
let handViewCamera = null;
let handViewTarget = null;

function getHandViewTarget(renderer, width, height) {
    if (handViewTarget && (handViewTarget.width !== width || handViewTarget.height !== height)) {
        handViewTarget.dispose();
        handViewTarget = null;
    }
    if (!handViewTarget) {
        handViewTarget = new THREE.WebGLRenderTarget(width, height);
        let webgl2 = !renderer.capabilities || renderer.capabilities.isWebGL2 !== false;
        if (webgl2 && 'samples' in handViewTarget) handViewTarget.samples = HAND_VIEW_SAMPLES;
        if ('outputColorSpace' in renderer && 'colorSpace' in handViewTarget.texture) handViewTarget.texture.colorSpace = renderer.outputColorSpace;
        else if ('outputEncoding' in renderer && 'encoding' in handViewTarget.texture) handViewTarget.texture.encoding = renderer.outputEncoding;
    }
    return handViewTarget;
}

function aimHandViewCamera(preview, view, reference, aspect) {
    if (!handViewCamera) handViewCamera = preview.camPers.clone(false);
    let camera = handViewCamera;
    camera.copy(preview.camPers, false);
    camera.zoom = 1;
    camera.aspect = aspect;
    let placement = getHandViewCamera(view, aspect, reference);
    let target = new THREE.Vector3().fromArray(placement.target);
    let position = new THREE.Vector3().fromArray(placement.position);
    if (placement.focalLength) {
        camera.setFocalLength(placement.focalLength);
    } else {
        camera.fov = placement.fov;
    }
    camera.position.copy(position);
    camera.up.set(0, 1, 0);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    return camera;
}

let handViewPixels = null;

function readHandViewPixels(renderer, target, width, height) {
    if (!handViewPixels || handViewPixels.length !== width * height * 4) handViewPixels = new Uint8Array(width * height * 4);
    let pixels = handViewPixels;
    renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
    let image = new ImageData(width, height);
    let rowLength = width * 4;
    for (let row = 0; row < height; row++) {
        let from = (height - 1 - row) * rowLength;
        let to = row * rowLength;
        for (let index = 0; index < rowLength; index += 4) {
            let alpha = pixels[from + index + 3];
            let scale = alpha > 0 && alpha < 255 ? 255 / alpha : 1;
            image.data[to + index] = Math.min(255, pixels[from + index] * scale);
            image.data[to + index + 1] = Math.min(255, pixels[from + index + 1] * scale);
            image.data[to + index + 2] = Math.min(255, pixels[from + index + 2] * scale);
            image.data[to + index + 3] = alpha;
        }
    }
    return image;
}

function drawHandView(preview, view, reference, width, height) {
    let renderer = preview.renderer;
    let camera = aimHandViewCamera(preview, view, reference, width / height);
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

let handViewStats = { renders: 0, lastMs: 0, totalMs: 0, maxMs: 0 };

function getHandViewStats() {
    let stats = handViewStats;
    return { renders: stats.renders, lastMs: stats.lastMs, averageMs: stats.renders ? stats.totalMs / stats.renders : 0, maxMs: stats.maxMs };
}

function renderHandView(subtabId, handId, width, height) {
    let view = findContextView(subtabId, handId);
    let preview = getDisplayPreview();
    let size = [Math.round(width), Math.round(height)];
    if (getRoute() !== 'block' || !Project || !Modes.display || !view || !view.handId || !preview || !preview.renderer) return null;
    if (!size.every(value => Number.isFinite(value) && value >= 1 && value <= MAX_HAND_VIEW_SIZE)) return null;
    if (Transformer.dragging) return null;
    let started = performance.now();
    let image;
    try {
        let reference = getSlotReference(view.slotId);
        if (!reference) return null;
        image = withHandViewScene(view, reference, () => drawHandView(preview, view, reference, size[0], size[1]));
    } catch (error) {
        console.warn(LOG_PREFIX, 'Could not draw the hand view:', error);
        return null;
    }
    let took = performance.now() - started;
    handViewStats.renders++;
    handViewStats.lastMs = took;
    handViewStats.totalMs += took;
    handViewStats.maxMs = Math.max(handViewStats.maxMs, took);
    return image;
}

// =========================
// Install
// =========================
function installHandViews() {
    handViewStats = { renders: 0, lastMs: 0, totalMs: 0, maxMs: 0 };
    return {
        delete() {
            if (handViewTarget) handViewTarget.dispose();
            handViewTarget = null;
            handViewCamera = null;
            handViewPixels = null;
        }
    };
}

registerModuleInstaller('hand_views', installHandViews);
