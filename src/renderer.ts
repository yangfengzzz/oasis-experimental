import {
    BlinnPhongMaterial,
    Camera,
    MeshRenderer,
    PrimitiveMesh, Quaternion, Transform,
    Vector3,
    WebGLEngine,
} from "oasis-engine";
import {FreeControl, OrbitControl} from "@oasis-engine/controls";

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

const meshes = []

// init cube
export const init = entities => {
    entities.forEach(entity => {
        add(entity);
    })
}

// add cube
export const add = entity => {
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
        renderer.mesh = PrimitiveMesh.createCuboid(engine, entity.body.size[0], entity.body.size[1], entity.body.size[2]);
        renderer.setMaterial(mtl);
        const pos = cubeEntity.transform.position;
        pos.setValue(entity.transform.position[0], entity.transform.position[1], entity.transform.position[2]);
        cubeEntity.transform.position = pos;
        const rotation = cubeEntity.transform.rotationQuaternion;
        rotation.setValue(entity.transform.rotation[0], entity.transform.rotation[1], entity.transform.rotation[2], entity.transform.rotation[3]);
        cubeEntity.transform.rotationQuaternion = rotation;
    } else if (entity.model.type === 'sphere') {
        renderer.mesh = PrimitiveMesh.createSphere(engine, entity.body.size[0]);
        renderer.setMaterial(mtl);
        const pos = cubeEntity.transform.position;
        pos.setValue(entity.transform.position[0], entity.transform.position[1], entity.transform.position[2]);
        cubeEntity.transform.position = pos;
        const rotation = cubeEntity.transform.rotation;
        rotation.transformByQuat(new Quaternion(entity.transform.rotation[0], entity.transform.rotation[1], entity.transform.rotation[2], entity.transform.rotation[3]))
        cubeEntity.transform.rotation = rotation;
    }
}

export const update = entities => {
    entities.forEach(entity => {
        const mesh = meshes[entity.id]
        const pos = mesh.transform.position;
        pos.setValue(entity.transform.position[0], entity.transform.position[1], entity.transform.position[2]);
        mesh.transform.position = pos;
        const rotation = mesh.transform.rotationQuaternion;
        rotation.setValue(entity.transform.rotation[0], entity.transform.rotation[1], entity.transform.rotation[2], entity.transform.rotation[3]);
        mesh.transform.rotationQuaternion = rotation;
    })
}