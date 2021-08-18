import {
    BlinnPhongMaterial,
    Camera, Entity,
    MeshRenderer,
    PrimitiveMesh, Quaternion, Vector3,
    WebGLEngine,
} from "oasis-engine";
import {OrbitControl} from "@oasis-engine/controls";
import {ColliderFlag} from "./Collider";
import {BoxCollider} from "./BoxCollider";
import {SphereCollider} from "./SphereCollider";
import {PhysicCombineMode} from "./PhysicMaterial";
import {Rigidbody} from "./Rigidbody";
import {PhysicManager, QueryFlag} from "./PhysicManager";
import {PhysicScript} from "./PhysicScript";
import {Ray, Vector2} from "@oasis-engine/math";
import {RaycastHit} from "./RaycastHit";
import {CharacterController} from "./CharacterController";

import {
    PhysX as PhysX,
    physics as PhysicsSystem,
} from "../main";

export const engine = new WebGLEngine("canvas");
engine.canvas.resizeByClientSize();
const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

// init camera
const cameraEntity = rootEntity.createChild("camera");
cameraEntity.addComponent(Camera);
const pos = cameraEntity.transform.position;
pos.setValue(10, 10, 10);
cameraEntity.transform.position = pos;
cameraEntity.addComponent(OrbitControl);

// init light
scene.ambientLight.diffuseSolidColor.setValue(1, 1, 1, 1);
scene.ambientLight.diffuseIntensity = 1.2;

//----------------------------------------------------------------------------------------------------------------------
let entity_id: number = 0;
const physic_scene = new PhysicManager();
let player: Entity;

//init scene
export function init() {
    physic_scene.init();

    addPlane(new Vector3(30, 0.1, 30), new Vector3, new Quaternion, physic_scene);

    player = addPlayer(1, 5, new Vector3(0, 2.5, 0), new Quaternion, physic_scene);

    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            addBox(new Vector3(1, 1, 1), new Vector3(
                -2.5 + i + 0.1 * i,
                Math.floor(Math.random() * 6) + 1,
                -2.5 + j + 0.1 * j,
            ), new Quaternion(0, 0, 0.3, 0.7), physic_scene);
        }
    }

    createChain(new Vector3(0.0, 20.0, -10.0), new Quaternion(), 5, 4.0);
}

function createChain(position, rotation, length, separation) {
    const offset = new Vector3(separation / 2, 0, 0);
    let prev = null;
    for (let i = 0; i < length; i++) {
        let localTm_pos = new Vector3(separation / 2 * (2 * i + 1), 0, 0);
        let localTm_quat = new Quaternion();
        transform(position, rotation, localTm_pos, localTm_quat);

        let current = addBox(new Vector3(2.0, 0.5, 0.5), localTm_pos, localTm_quat, physic_scene).getComponent(Rigidbody).get();
        createBreakableFixed(prev, prev ? offset : position, prev ? new Quaternion() : rotation,
            current, new Vector3(-separation / 2, 0, 0), new Quaternion());
        prev = current;
    }
}

function createBreakableFixed(actor0, position0, rotation0, actor1, position1, rotation1) {
    const transform0 = {
        translation: {
            x: position0.x,
            y: position0.y,
            z: position0.z,
        },
        rotation: {
            w: rotation0.w, // PHYSX uses WXYZ quaternions,
            x: rotation0.x,
            y: rotation0.y,
            z: rotation0.z,
        },
    }

    const transform1 = {
        translation: {
            x: position1.x,
            y: position1.y,
            z: position1.z,
        },
        rotation: {
            w: rotation1.w, x: rotation1.x, y: rotation1.y, z: rotation1.z,
        },
    }

    let joint = PhysX.PxFixedJointCreate(PhysicsSystem, actor0, transform0, actor1, transform1);
    joint.setBreakForce(1000, 100000);
    joint.setConstraintFlag(PhysX.PxConstraintFlag.eDRIVE_LIMITS_ARE_FORCES, true);
    joint.setConstraintFlag(PhysX.PxConstraintFlag.eDISABLE_PREPROCESSING, true);
}

function transform(position, rotation, outPosition, outRotation) {
    Quaternion.multiply(rotation, outRotation, outRotation)
    Vector3.transformByQuat(outPosition, rotation, outPosition);
    Vector3.add(outPosition, position, outPosition);
}


window.addEventListener("keydown", (event) => {
    const dir = new Vector3();
    cameraEntity.transform.getWorldForward(dir);
    Vector3.scale(dir, 50, dir);
    switch (event.key) {
        case 'Enter':
            addSphere(0.5, cameraEntity.transform.position,
                cameraEntity.transform.rotationQuaternion, dir, physic_scene);
            break;
    }
})

window.addEventListener("mousedown", (event) => {
    const ray = new Ray();
    cameraEntity.getComponent(Camera).screenPointToRay(
        new Vector2(event.pageX * window.devicePixelRatio, event.pageY * window.devicePixelRatio), ray)

    const hit = new RaycastHit;
    const result = physic_scene.raycast(ray.origin, ray.direction, 2147000, hit, QueryFlag.DYNAMIC);

    if (result) {
        const mtl = new BlinnPhongMaterial(engine);
        const color = mtl.baseColor;
        color.r = Math.random();
        color.g = Math.random();
        color.b = Math.random();
        color.a = 1.0;

        const meshes: MeshRenderer[] = [];
        hit.entity.getComponentsIncludeChildren(MeshRenderer, meshes);
        meshes.forEach((mesh) => {
            mesh.setMaterial(mtl);
        })

        fixJointCreate(hit.entity);
    }
})

function fixJointCreate(entity) {
    const quat = entity.transform.rotationQuaternion.normalize()
    const transform = {
        translation: {
            x: entity.transform.position.x + 2,
            y: entity.transform.position.y,
            z: entity.transform.position.z,
        },
        rotation: {
            w: quat.w, // PHYSX uses WXYZ quaternions,
            x: quat.x,
            y: quat.y,
            z: quat.z,
        },
    }

    const transform2 = {
        translation: {
            x: 2,
            y: 0,
            z: 0,
        },
        rotation: {
            w: 1, x: 0, y: 0, z: 0,
        },
    }

    const actor = entity.getComponent(Rigidbody);
    actor.wakeUp()
    PhysX.PxFixedJointCreate(PhysicsSystem, null, transform, actor.get(), transform2);
}

export function update() {
    physic_scene.simulate()
    physic_scene.fetchResults();

    player.getComponent(CharacterController).update();
    for (let i = 2; i < entity_id; i++) {
        const transform = physic_scene.physicObjectsMap[i].getComponent(Rigidbody).getGlobalPose();
        physic_scene.physicObjectsMap[i].transform.position = transform.translation;
        physic_scene.physicObjectsMap[i].transform.rotationQuaternion = transform.rotation;
    }
    engine.update();
}

//----------------------------------------------------------------------------------------------------------------------
function addPlane(size: Vector3, position: Vector3, rotation: Quaternion, scene: PhysicManager): Entity {
    const mtl = new BlinnPhongMaterial(engine);
    const color = mtl.baseColor;
    color.r = 0.03179807202597362;
    color.g = 0.3939682161541871;
    color.b = 0.41177952549087604;
    color.a = 1.0;
    const cubeEntity = rootEntity.createChild();
    const renderer = cubeEntity.addComponent(MeshRenderer);

    renderer.mesh = PrimitiveMesh.createCuboid(engine, size.x, size.y, size.z);
    renderer.setMaterial(mtl);
    cubeEntity.transform.position = position;
    cubeEntity.transform.rotationQuaternion = rotation;

    const box_collider = cubeEntity.addComponent(BoxCollider);
    box_collider.size = size;
    box_collider.material.staticFriction = 1;
    box_collider.material.dynamicFriction = 2;
    box_collider.material.bounciness = 0.1;
    box_collider.init(entity_id++);
    box_collider.setFlag(ColliderFlag.SIMULATION_SHAPE, true);
    scene.addStaticActor(box_collider);

    return cubeEntity;
}

function addPlayer(radius: number, height: number, position: Vector3, rotation: Quaternion, scene: PhysicManager): Entity {
    const mtl = new BlinnPhongMaterial(engine);
    const color = mtl.baseColor;
    color.r = Math.random();
    color.g = Math.random();
    color.b = Math.random();
    color.a = 1.0;
    const cubeEntity = rootEntity.createChild();
    cubeEntity.transform.position = position;
    cubeEntity.transform.rotationQuaternion = rotation;

    height -= radius * 2;
    //body
    {
        const renderer = cubeEntity.addComponent(MeshRenderer);
        renderer.mesh = PrimitiveMesh.createCylinder(engine, radius, radius, height);
        renderer.setMaterial(mtl);
    }

    //foot
    {
        const foot = cubeEntity.createChild("foot");
        const renderer = foot.addComponent(MeshRenderer);
        renderer.mesh = PrimitiveMesh.createSphere(engine, radius);
        renderer.setMaterial(mtl);
        foot.transform.position = new Vector3(0, -height / 2, 0);
    }

    //head
    {
        const head = cubeEntity.createChild("foot");
        const renderer = head.addComponent(MeshRenderer);
        renderer.mesh = PrimitiveMesh.createSphere(engine, radius);
        renderer.setMaterial(mtl);
        head.transform.position = new Vector3(0, height / 2, 0);
    }

    const controller = cubeEntity.addComponent(CharacterController);
    controller.init(scene, cameraEntity, entity_id++, radius, height);
    scene.addController(controller);

    return cubeEntity;
}

function addBox(size: Vector3, position: Vector3, rotation: Quaternion, scene: PhysicManager): Entity {
    const mtl = new BlinnPhongMaterial(engine);
    const color = mtl.baseColor;
    color.r = Math.random();
    color.g = Math.random();
    color.b = Math.random();
    color.a = 1.0;
    const cubeEntity = rootEntity.createChild();
    const renderer = cubeEntity.addComponent(MeshRenderer);

    renderer.mesh = PrimitiveMesh.createCuboid(engine, size.x, size.y, size.z);
    renderer.setMaterial(mtl);
    cubeEntity.transform.position = position;
    cubeEntity.transform.rotationQuaternion = rotation;

    const box_collider = cubeEntity.addComponent(BoxCollider);
    box_collider.size = size;
    box_collider.material.staticFriction = 1;
    box_collider.material.dynamicFriction = 2;
    box_collider.material.bounciness = 0.1;
    box_collider.init(entity_id++);
    box_collider.setFlag(ColliderFlag.SIMULATION_SHAPE, true);
    const rigid_body = cubeEntity.addComponent(Rigidbody);
    rigid_body.init(position, rotation);
    rigid_body.freezeRotation = false;
    rigid_body.attachShape(box_collider);

    scene.addDynamicActor(rigid_body);
    rigid_body.addForce(new Vector3(0, 300, 0));

    return cubeEntity;
}

function addSphere(radius: number, position: Vector3, rotation: Quaternion, velocity: Vector3, scene: PhysicManager): Entity {
    const mtl = new BlinnPhongMaterial(engine);
    const color = mtl.baseColor;
    color.r = Math.random();
    color.g = Math.random();
    color.b = Math.random();
    color.a = 1.0;
    const cubeEntity = rootEntity.createChild();
    const renderer = cubeEntity.addComponent(MeshRenderer);

    cubeEntity.addComponent(PhysicScript);

    renderer.mesh = PrimitiveMesh.createSphere(engine, radius);
    renderer.setMaterial(mtl);
    cubeEntity.transform.position = position;
    cubeEntity.transform.rotationQuaternion = rotation;

    const sphere_collider = cubeEntity.addComponent(SphereCollider);
    sphere_collider.radius = radius;
    sphere_collider.material.staticFriction = 0.1;
    sphere_collider.material.dynamicFriction = 0.2;
    sphere_collider.material.bounciness = 2;
    sphere_collider.material.bounceCombine = PhysicCombineMode.Average;
    sphere_collider.init(entity_id++);
    const rigid_body = cubeEntity.addComponent(Rigidbody);
    rigid_body.init(position, rotation);
    rigid_body.freezeRotation = false;
    rigid_body.attachShape(sphere_collider);
    rigid_body.velocity = velocity;
    rigid_body.angularDrag = 0.5;
    scene.addDynamicActor(rigid_body);
    rigid_body.addForce(new Vector3(0, 300, 0));

    return cubeEntity;
}