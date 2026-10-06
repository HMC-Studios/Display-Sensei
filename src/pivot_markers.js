// =========================
// Pivot markers (block route)
// =========================
const PIVOT_MARKER_COLORS = Object.freeze({
    rotation_pivot: '#e040fb',
    scale_pivot: '#ffab00'
});

const PIVOT_MARKER_OUTLINE = { color: '#101010', opacity: 0.9 };

const PIVOT_MARKER_ORDER = ['scale_pivot', 'rotation_pivot'];

const PIVOT_MARKER_SHAPES = {
    rotation_pivot: [
        { kind: 'ring', inner: 10.5, outer: 17, segments: 48, outline: true },
        { kind: 'ring', inner: 12, outer: 15.5, segments: 48 },
        { kind: 'disc', radius: 3.5, outline: true },
        { kind: 'disc', radius: 2.2 }
    ],
    scale_pivot: [
        { kind: 'ring', inner: 3.1, outer: 11.3, segments: 4, outline: true },
        { kind: 'ring', inner: 5.2, outer: 9.2, segments: 4 },
        { kind: 'disc', radius: 2.8, outline: true },
        { kind: 'disc', radius: 1.6 }
    ]
};

const PIVOT_MARKER_DISC_SEGMENTS = 24;
const PIVOT_MARKER_RENDER_ORDER = 990;
const PIVOT_MARKER_SYNC_EVENTS = 'select_mode unselect_mode select_project unselect_project select_format convert_format';
const PIVOT_BLOCK_PIXELS = 16;

let pivotMarkers = null;
let pivotMarkerRequest = { on: false, slotId: null };
let isPivotMarkerModuleInstalled = false;

// =========================
// Where the pivots are
// =========================
function toPivotPixels(pivot, side) {
    let values = Array.isArray(pivot) ? pivot : [0, 0, 0];
    return new THREE.Vector3(values[0] * side, values[1], values[2]).multiplyScalar(PIVOT_BLOCK_PIXELS);
}

function computePivotMarkerPoints(slot) {
    let values = getDrawnDisplaySlot(slot);
    let base = DisplayMode.display_base;
    if (!values || !base || !Array.isArray(values.scale)) return null;
    let side = LEFT_HAND_PIVOT_MIRROR && isLeftHandSlot(DisplayMode.display_slot) ? -1 : 1;
    let rotationPivot = toPivotPixels(values.rotation_pivot, side).applyEuler(base.rotation);
    let scalePivot = toPivotPixels(values.scale_pivot, side);
    let shrink = new THREE.Vector3(1 - values.scale[0], 1 - values.scale[1], 1 - values.scale[2]);
    let turnedScalePivot = scalePivot.clone().applyEuler(base.rotation).multiply(shrink);
    return {
        rotation_pivot: base.position.clone().add(rotationPivot).sub(turnedScalePivot),
        scale_pivot: base.position.clone().add(scalePivot.multiply(base.scale).applyEuler(base.rotation))
    };
}

// =========================
// Building the markers
// =========================
function createPivotMarkerNode(name) {
    let node = new THREE.Object3D();
    node.name = name;
    node.no_export = true;
    return node;
}

function createPivotMarkerMaterial(color, opacity) {
    let material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false
    });
    material.toneMapped = false;
    return material;
}

function createPivotMarkerGeometry(shape) {
    if (shape.kind === 'ring') return new THREE.RingGeometry(shape.inner, shape.outer, shape.segments);
    return new THREE.CircleGeometry(shape.radius, PIVOT_MARKER_DISC_SEGMENTS);
}

function buildPivotMarkers() {
    let built = {
        root: createPivotMarkerNode('display_sensei_pivot_markers'),
        markers: {},
        disposables: [],
        slotId: null,
        scratch: {
            position: new THREE.Vector3(),
            view: new THREE.Vector3(),
            quaternion: new THREE.Quaternion(),
            scale: new THREE.Vector3(),
            viewport: new THREE.Vector4()
        }
    };
    let outline = createPivotMarkerMaterial(PIVOT_MARKER_OUTLINE.color, PIVOT_MARKER_OUTLINE.opacity);
    built.disposables.push(outline);
    let faceCamera = function(renderer, scene, camera) {
        facePivotMarkerToCamera(this, renderer, camera, built.scratch);
    };
    PIVOT_MARKER_ORDER.forEach((id, index) => {
        let marker = createPivotMarkerNode(`display_sensei_pivot_marker_${id}`);
        let fill = createPivotMarkerMaterial(PIVOT_MARKER_COLORS[id], 1);
        built.disposables.push(fill);
        for (let shape of PIVOT_MARKER_SHAPES[id]) {
            let geometry = createPivotMarkerGeometry(shape);
            built.disposables.push(geometry);
            let mesh = new THREE.Mesh(geometry, shape.outline ? outline : fill);
            mesh.name = `display_sensei_pivot_marker_${id}_${shape.outline ? 'outline' : 'fill'}`;
            mesh.no_export = true;
            mesh.frustumCulled = false;
            mesh.renderOrder = PIVOT_MARKER_RENDER_ORDER + (shape.outline ? 0 : index + 1);
            mesh.onBeforeRender = faceCamera;
            marker.add(mesh);
        }
        built.root.add(marker);
        built.markers[id] = marker;
    });
    return built;
}

function getScreenPixelSize(renderer, camera, position, scratch) {
    let view = scratch.view.copy(position).applyMatrix4(camera.matrixWorldInverse);
    let projection = camera.projectionMatrix.elements;
    let depth = Math.max(projection[11] * view.z + projection[15], 1e-6);
    let viewport = renderer.getCurrentViewport(scratch.viewport);
    let ratio = renderer.getRenderTarget() ? 1 : renderer.getPixelRatio();
    return 2 * ratio * depth / (projection[5] * Math.max(viewport.w, 1));
}

function facePivotMarkerToCamera(mesh, renderer, camera, scratch) {
    let position = scratch.position.setFromMatrixPosition(mesh.matrixWorld);
    let size = getScreenPixelSize(renderer, camera, position, scratch);
    scratch.quaternion.setFromRotationMatrix(camera.matrixWorld);
    mesh.matrixWorld.compose(position, scratch.quaternion, scratch.scale.setScalar(size));
}

// =========================
// Showing and hiding
// =========================
function attachPivotMarkers(built) {
    let area = DisplayMode.display_area;
    let root = built.root;
    if (root.parent !== area) area.add(root);
    if (!Canvas.gizmos.includes(root)) Canvas.gizmos.push(root);
    if (!Object.prototype.hasOwnProperty.call(root, 'was_visible')) root.visible = true;
}

function detachPivotMarkers() {
    if (!pivotMarkers) return;
    let root = pivotMarkers.root;
    if (root.parent) root.parent.remove(root);
    let index = Canvas.gizmos.indexOf(root);
    if (index >= 0) Canvas.gizmos.splice(index, 1);
    pivotMarkers.slotId = null;
}

function disposePivotMarkers() {
    if (!pivotMarkers) return;
    detachPivotMarkers();
    for (let item of pivotMarkers.disposables) item.dispose();
    pivotMarkers = null;
}

function getPivotMarkerSlotId() {
    if (!isPivotMarkerModuleInstalled || !pivotMarkerRequest.on || !Modes.display || !isOwnPanelShown()) return null;
    let slotId = pivotMarkerRequest.slotId || DisplayMode.display_slot;
    return isShowingSlot(slotId) ? slotId : null;
}

function syncPivotMarkers(slot) {
    let slotId = getPivotMarkerSlotId();
    let points = slotId ? computePivotMarkerPoints(slot) : null;
    if (!points) {
        detachPivotMarkers();
        return;
    }
    if (!pivotMarkers) pivotMarkers = buildPivotMarkers();
    for (let id of PIVOT_MARKER_ORDER) pivotMarkers.markers[id].position.copy(points[id]);
    attachPivotMarkers(pivotMarkers);
    pivotMarkers.slotId = slotId;
}

function setPivotMarkersShown(on, slotId = null) {
    pivotMarkerRequest = { on: !!on, slotId: on && slotId ? slotId : null };
    syncPivotMarkers();
    return getPivotMarkerState().shown;
}

function isPivotMarkerShown() {
    let root = pivotMarkers && pivotMarkers.root;
    return !!root && root.parent === DisplayMode.display_area && !!DisplayMode.display_area.parent &&
        Canvas.gizmos.includes(root) && !!Modes.display && getRoute() === 'block';
}

function getPivotMarkerState() {
    let shown = isPivotMarkerShown();
    let point = id => pivotMarkers.markers[id].getWorldPosition(new THREE.Vector3()).toArray();
    return {
        shown,
        requested: pivotMarkerRequest.on,
        slotId: shown ? pivotMarkers.slotId : null,
        rotationPivot: shown ? point('rotation_pivot') : null,
        scalePivot: shown ? point('scale_pivot') : null,
        colors: Object.assign({}, PIVOT_MARKER_COLORS)
    };
}

// =========================
// Following the preview
// =========================
function updateDisplayBaseWithPivotMarkers(original, args) {
    let result = original.apply(this, args);
    if (isDrawingHandView()) return result;
    try {
        syncPivotMarkers(args[0]);
    } catch (error) {
        console.warn(LOG_PREFIX, 'The pivot markers could not follow the preview:', error);
        detachPivotMarkers();
    }
    return result;
}

function wrapThumbnailWithoutPivotMarkers() {
    if (typeof ModelProject === 'undefined' || !ModelProject.prototype || typeof ModelProject.prototype.updateThumbnail !== 'function') return { delete() {} };
    return wrapMethod(ModelProject.prototype, 'updateThumbnail', function(original, args) {
        let preview = typeof Preview !== 'undefined' ? Preview.selected : null;
        let root = pivotMarkers && pivotMarkers.root;
        if (this !== Project || !preview || !root || !root.parent || !root.visible) return original.apply(this, args);
        root.visible = false;
        try {
            preview.render();
            return original.apply(this, args);
        } finally {
            root.visible = true;
        }
    });
}

// =========================
// Install
// =========================
function installPivotMarkers() {
    pivotMarkerRequest = { on: false, slotId: null };
    let hooks = createDeletables([
        () => wrapMethod(DisplayMode, 'updateDisplayBase', updateDisplayBaseWithPivotMarkers),
        wrapThumbnailWithoutPivotMarkers,
        () => Blockbench.on(PIVOT_MARKER_SYNC_EVENTS, guardListener('pivot markers', () => syncPivotMarkers()))
    ]);
    isPivotMarkerModuleInstalled = true;
    return {
        delete() {
            isPivotMarkerModuleInstalled = false;
            hooks.delete();
            disposePivotMarkers();
            pivotMarkerRequest = { on: false, slotId: null };
        }
    };
}

registerModuleInstaller('pivot_markers', installPivotMarkers);
