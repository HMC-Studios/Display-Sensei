// =========================
// Attachable rig (read only)
// =========================

// =========================
// Reading the outliner
// =========================
function isRigBoneNode(node) {
    return !!node && node.type === 'group';
}

function isRigCubeNode(node) {
    return !!node && node.type === 'cube';
}

function isRigWearerNode(node, project) {
    return !!project.multi_file_ruleset && node.scope === 1;
}

function isRigNodeExported(node) {
    return node.export !== false;
}

const RIG_UNDRAWN_TYPES = ['group', 'locator', 'null_object', 'bounding_box'];

function rigDrawsOwnParts(group) {
    return (group.children || []).some(child => !!child && isRigNodeExported(child) && !RIG_UNDRAWN_TYPES.includes(child.type));
}

function isRigBoneExported(group) {
    let children = Array.isArray(group.children) ? group.children : [];
    let hasExportedChild = children.some(isRigNodeExported);
    if (!isRigNodeExported(group) && !rigHasExportedChild(group)) return false;
    if (!hasExportedChild && typeof settings !== 'undefined' && settings.export_empty_groups && settings.export_empty_groups.value === false) return false;
    if (children.length && children.every(child => child.type === 'bounding_box')) return false;
    return true;
}

function rigHasExportedChild(group) {
    for (let child of group.children || []) {
        if (isRigNodeExported(child)) return true;
        if (isRigBoneNode(child) && rigHasExportedChild(child)) return true;
    }
    return false;
}

// =========================
// Bedrock file values
// =========================
function rigNegate(value) {
    return 0 - value;
}

function rigFilePivot(origin) {
    return [rigNegate(origin[0]), origin[1], origin[2]];
}

function rigFileRotation(rotation) {
    return [rigNegate(rotation[0]), rigNegate(rotation[1]), rotation[2]];
}

function isRigTurned(rotation) {
    return Array.isArray(rotation) && rotation.some(angle => angle !== 0);
}

function readRigCube(cube) {
    let from = [rigNegate(cube.to[0]), cube.from[1], cube.from[2]];
    let to = [rigNegate(cube.from[0]), cube.to[1], cube.to[2]];
    let low = from.map((value, axis) => Math.min(value, to[axis]));
    let high = from.map((value, axis) => Math.max(value, to[axis]));
    let turned = isRigTurned(cube.rotation);
    return {
        uuid: cube.uuid,
        name: cube.name,
        from: low,
        to: high,
        inflate: cube.inflate || 0,
        pivot: turned ? rigFilePivot(cube.origin) : null,
        rotation: turned ? rigFileRotation(cube.rotation) : null
    };
}

function readRigBone(group, parentName) {
    let rotation = Array.isArray(group.rotation) ? group.rotation : [0, 0, 0];
    let cubes = (group.children || []).filter(child => isRigCubeNode(child) && isRigNodeExported(child)).map(readRigCube);
    return {
        uuid: group.uuid,
        name: group.name,
        parent: parentName,
        pivot: rigFilePivot(group.origin || [0, 0, 0]),
        rotation: isRigTurned(rotation) ? rigFileRotation(rotation) : [0, 0, 0],
        binding: group.bedrock_binding || null,
        isRoot: parentName === null,
        cubes,
        draws: rigDrawsOwnParts(group)
    };
}

// =========================
// The analyser
// =========================
function analyseAttachableRig(project = Project) {
    let result = { bones: [], roots: [], bound: [] };
    if (!project || !Array.isArray(project.outliner)) return result;

    let looseCubes = [];
    let addBone = (group, parentName) => {
        if (isRigWearerNode(group, project) || !isRigBoneExported(group)) return;
        let bone = readRigBone(group, parentName);
        result.bones.push(bone);
        for (let child of group.children || []) {
            if (isRigBoneNode(child)) addBone(child, bone.name);
        }
    };
    for (let node of project.outliner) {
        if (isRigBoneNode(node)) {
            addBone(node, null);
        } else if (isRigCubeNode(node) && isRigNodeExported(node) && !isRigWearerNode(node, project)) {
            looseCubes.push(readRigCube(node));
        }
    }
    if (looseCubes.length) {
        let groups = Array.isArray(project.groups) ? project.groups : result.bones;
        let taken = new Set(groups.map(group => String(group.name).toLowerCase()));
        let name = 'bb_main';
        for (let number = 2; taken.has(name); number++) name = 'bb_main' + number;
        result.bones.unshift({
            uuid: null, name, parent: null, pivot: [0, 0, 0], rotation: [0, 0, 0],
            binding: null, isRoot: true, cubes: looseCubes, draws: true, loose: true
        });
    }
    result.roots = result.bones.filter(bone => bone.isRoot).map(bone => bone.name);
    result.bound = result.bones.filter(bone => bone.binding).map(bone => bone.name);
    return result;
}
