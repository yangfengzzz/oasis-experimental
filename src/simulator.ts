import {
    BlinnPhongMaterial,
    Camera,
    MeshRenderer,
    PrimitiveMesh, Vector3,
    WebGLEngine,
} from "oasis-engine";
import {OrbitControl} from "@oasis-engine/controls";
import {BoxCollider} from "./BoxCollider";
import {Rigidbody} from "./Rigidbody";
import {SphereCollider} from "./SphereCollider";
import {PhysicCombineMode} from "./PhysicMaterial";

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
const meshes = []

// init cube
export const init = (entities, scene) => {
    entities.forEach(entity => {
        add(entity, scene);
    })
}

// add cube
export const add = (entity, scene) => {
    const mtl = new BlinnPhongMaterial(engine);
    const color = mtl.baseColor;
    color.r = Math.random();
    color.g = Math.random();
    color.b = Math.random();
    color.a = 1.0;
    const cubeEntity = rootEntity.createChild();
    const renderer = cubeEntity.addComponent(MeshRenderer);
    meshes[entity.id] = cubeEntity;
    if (entity.model.type === 'box') {
        renderer.mesh = PrimitiveMesh.createCuboid(engine, entity.body.size.x, entity.body.size.y, entity.body.size.z);
        renderer.setMaterial(mtl);
        cubeEntity.transform.position = entity.transform.position;
        cubeEntity.transform.rotationQuaternion = entity.transform.rotation;

        const box_collider = cubeEntity.addComponent(BoxCollider);
        box_collider.size = entity.body.size;
        box_collider.material.staticFriction = 0.1;
        box_collider.material.dynamicFriction = 0.2;
        box_collider.material.bounciness = 0.1;
        box_collider.init(entity.id);
        const rigid_body = cubeEntity.addComponent(Rigidbody);
        rigid_body.init(entity.body.dynamic, entity.transform.position, entity.transform.rotation);
        rigid_body.freezeRotation = false;
        rigid_body.attachShape(box_collider);

        scene.addActor(rigid_body);
        rigid_body.addForce(new Vector3(0, 300, 0));
    } else if (entity.model.type === 'sphere') {
        renderer.mesh = PrimitiveMesh.createSphere(engine, entity.body.size.x);
        renderer.setMaterial(mtl);
        cubeEntity.transform.position = entity.transform.position;
        cubeEntity.transform.rotation = entity.transform.rotation;

        const sphere_collider = cubeEntity.addComponent(SphereCollider);
        sphere_collider.radius = entity.body.size.x;
        sphere_collider.material.staticFriction = 0.1;
        sphere_collider.material.dynamicFriction = 0.2;
        sphere_collider.material.bounciness = 2;
        sphere_collider.material.bounceCombine = PhysicCombineMode.Minimum;
        sphere_collider.init(entity.id);
        const rigid_body = cubeEntity.addComponent(Rigidbody);
        rigid_body.init(entity.body.dynamic, entity.transform.position, entity.transform.rotation);
        rigid_body.freezeRotation = false;
        rigid_body.attachShape(sphere_collider);

        scene.addActor(rigid_body);
        rigid_body.addForce(new Vector3(0, 300, 0));
    }
}

export const update = (entities, scene) => {
    scene.simulateAndFetchResult();
    entities.forEach(entity => {
        const mesh = meshes[entity.id]
        const body = mesh.getComponent(Rigidbody);
        const transform = body.getGlobalPose();

        mesh.transform.position = transform.translation;
        mesh.transform.rotationQuaternion = transform.rotation;
    })
}