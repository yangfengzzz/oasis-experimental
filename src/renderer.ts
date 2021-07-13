import {
    BlinnPhongMaterial,
    Camera,
    MeshRenderer,
    PrimitiveMesh,
    WebGLEngine,
} from "oasis-engine";
import {OrbitControl} from "@oasis-engine/controls";

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
        renderer.mesh = PrimitiveMesh.createCuboid(engine, entity.body.size.x, entity.body.size.y, entity.body.size.z);
        renderer.setMaterial(mtl);
        cubeEntity.transform.position = entity.transform.position;
        cubeEntity.transform.rotationQuaternion = entity.transform.rotation;
    } else if (entity.model.type === 'sphere') {
        renderer.mesh = PrimitiveMesh.createSphere(engine, entity.body.size.x);
        renderer.setMaterial(mtl);
        cubeEntity.transform.position = entity.transform.position;
        cubeEntity.transform.rotation = entity.transform.rotation;
    }
}

export const update = entities => {
    entities.forEach(entity => {
        const mesh = meshes[entity.id]
        mesh.transform.position = entity.transform.position;
        mesh.transform.rotationQuaternion = entity.transform.rotation;
    })
}