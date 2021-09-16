import {
    BlinnPhongMaterial,
    Camera,
    Entity,
    MeshRenderer,
    PointLight, PrimitiveMesh,
    Quaternion,
    Vector3,
    WebGLEngine
} from "oasis-engine";
import {OrbitControl} from "@oasis-engine/controls";
import {Vec2} from "./box2d/Vec2";
import {World} from "./box2d/World";
import {Joint} from "./box2d/Joint";
import {Body} from "./box2d/Body";

export const engine = new WebGLEngine("canvas");
engine.canvas.resizeByClientSize();
const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

// init camera
const cameraEntity = rootEntity.createChild("camera");
cameraEntity.addComponent(Camera);
const pos = cameraEntity.transform.position;
pos.setValue(0, 10, 0);
cameraEntity.transform.position = pos;
cameraEntity.addComponent(OrbitControl);

// init light
scene.ambientLight.diffuseSolidColor.setValue(1, 1, 1, 1);
scene.ambientLight.diffuseIntensity = 1.2;

let light = rootEntity.createChild("light");
light.transform.position = new Vector3(0, 5, 0);
const p = light.addComponent(PointLight);
p.intensity = 0.3;

addPlane(new Vector3(30, 0.1, 30), new Vector3, new Quaternion);

//----------------------------------------------------------------------------------------------------------------------
const timeStep = 1.0 / 60.0;
const iterations = 10;
const gravity = new Vec2(0.0, -10.0);

const bodies: Body[] = [];
bodies.length = 200;
bodies.fill(new Body())
const joints: Joint[] = []
joints.length = 100;
joints.fill(new Joint())

let bomb: Body = null;

let numBodies = 0;
let numJoints = 0;

let demoIndex = 0;

const width = 1280;
const height = 720;
const zoom = 10.0;
const pan_y = 8.0;

const world = new World(gravity, iterations);

InitDemo(0);

const update = () => {
    world.Step(timeStep);
    engine.update();
    requestAnimationFrame(update)
}

update()

//----------------------------------------------------------------------------------------------------------------------
function InitDemo(index: number) {
    world.Clear();
    numBodies = 0;
    numJoints = 0;
    bomb = null;

    demoIndex = index;
    Demo1(bodies, joints);
}

// Single box
function Demo1(bodies: Body[], joints: Joint[]) {
    let b = bodies[numBodies];
    b.Set(new Vec2(100.0, 20.0), Number.MAX_VALUE);
    b.position.Set(0.0, -0.5 * b.width.y);
    world.AddBody(b);
    ++numBodies;

    b = bodies[numBodies];
    b.Set(new Vec2(1.0, 1.0), 200.0);
    b.position.Set(0.0, 4.0);
    world.AddBody(b);
    ++numBodies;
}

//----------------------------------------------------------------------------------------------------------------------
function addPlane(size: Vector3, position: Vector3, rotation: Quaternion): Entity {
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

    return cubeEntity;
}