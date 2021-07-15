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
import {PhysicManager} from "./PhysicManager";
import {PhysicScript} from "./PhysicScript";
import {Ray, Vector2} from "@oasis-engine/math";
import {RaycastHit} from "./RaycastHit";
import {CharacterController} from "./CharacterController";

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

    player = addPlayer(new Vector3(1, 5, 1), new Vector3(0, 2.5, 0), new Quaternion, physic_scene);

    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            addBox(new Vector3(1, 1, 1), new Vector3(
                -2.5 + i + 0.1 * i,
                Math.floor(Math.random() * 6) + 1,
                -2.5 + j + 0.1 * j,
            ), new Quaternion(0, 0, 0.3, 0.7), physic_scene);
        }
    }
}

window.addEventListener("keydown", (event) => {
    switch (event.key) {
        case 'Enter':
            addSphere(0.5, new Vector3(
                Math.floor(Math.random() * 6) - 2.5,
                5,
                Math.floor(Math.random() * 6) - 2.5,
            ), new Quaternion(0, 0, 0.3, 0.7), physic_scene);
            break;
    }
})

let click: boolean = true;
window.addEventListener("mousedown", (event) => {
    const ray = new Ray();
    cameraEntity.getComponent(Camera).screenPointToRay(
        new Vector2(event.pageX * window.devicePixelRatio, event.pageY * window.devicePixelRatio), ray)

    const hit = new RaycastHit;
    const result = physic_scene.raycast(ray.origin, ray.direction, 2147000, hit);

    if (result) {
        const mtl = new BlinnPhongMaterial(engine);
        const color = mtl.baseColor;
        color.r = Math.random();
        color.g = Math.random();
        color.b = Math.random();
        color.a = 1.0;
        hit.collider.entity.getComponent(MeshRenderer).setMaterial(mtl);
        //
        // if (click) {
        //     physic_scene.gravity = new Vector3(0, 1, 0);
        //     click = !click;
        // } else {
        //     physic_scene.gravity = new Vector3(0, -9.81, 0);
        //     click = !click;
        // }
    }
})

let isFirstFrame: boolean = true;

export function update() {
    if (isFirstFrame) {
        //Run the first frame's collision detection
        physic_scene.collide(1 / 60);
        isFirstFrame = false;
    }

    player.getComponent(CharacterController).update();
    physic_scene.fetchCollision(true);
    physic_scene.advance();
    physic_scene.fetchResults(true);

    //Run the deferred collision detection for the next frame. This will run in parallel with render.
    physic_scene.collide(1 / 60);

    for (let i = 1; i < entity_id; i++) {
        const transform = physic_scene.physicObjectsMap[i].entity.getComponent(Rigidbody).getGlobalPose();
        physic_scene.physicObjectsMap[i].entity.transform.position = transform.translation;
        physic_scene.physicObjectsMap[i].entity.transform.rotationQuaternion = transform.rotation;
    }

    engine.update();
}

//----------------------------------------------------------------------------------------------------------------------
function addPlane(size: Vector3, position: Vector3, rotation: Quaternion, scene: PhysicManager): Entity {
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
    scene.addStaticActor(box_collider);

    return cubeEntity;
}

function addPlayer(size: Vector3, position: Vector3, rotation: Quaternion, scene: PhysicManager): Entity {
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
    box_collider.material.staticFriction = 0.1;
    box_collider.material.dynamicFriction = 0.2;
    box_collider.material.bounciness = 0.1;
    box_collider.init(entity_id++);
    box_collider.setFlag(ColliderFlag.SIMULATION_SHAPE, true);
    const rigid_body = cubeEntity.addComponent(Rigidbody);
    rigid_body.init(position, rotation);
    rigid_body.freezeRotation = false;
    rigid_body.attachShape(box_collider);

    scene.addDynamicActor(rigid_body);
    rigid_body.addForce(new Vector3(0, 300, 0));
    rigid_body.isKinematic = true;
    cubeEntity.addComponent(CharacterController).init(rigid_body);

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

function addSphere(radius: number, position: Vector3, rotation: Quaternion, scene: PhysicManager): Entity {
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
    sphere_collider.material.bounceCombine = PhysicCombineMode.Minimum;
    sphere_collider.init(entity_id++);
    const rigid_body = cubeEntity.addComponent(Rigidbody);
    rigid_body.init(position, rotation);
    rigid_body.freezeRotation = false;
    rigid_body.attachShape(sphere_collider);

    scene.addDynamicActor(rigid_body);
    rigid_body.addForce(new Vector3(0, 300, 0));

    return cubeEntity;
}