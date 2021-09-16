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
cameraEntity.transform.setPosition(0, 5, 40);

// init light
scene.ambientLight.diffuseSolidColor.setValue(1, 1, 1, 1);
scene.ambientLight.diffuseIntensity = 1.2;

let light = rootEntity.createChild("light");
light.transform.position = new Vector3(0, 5, 0);
const p = light.addComponent(PointLight);
p.intensity = 0.3;

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

const bodyPairs = InitDemo(0);

const update = () => {
    world.Step(timeStep);
    // bodyPairs.forEach((value) => {
    //     value[1].transform.setPosition(value[0].position.x, value[0].position.y, 0);
    // })

    engine.update();
    requestAnimationFrame(update)
}

update()

//----------------------------------------------------------------------------------------------------------------------
function InitDemo(index: number): [Body, Entity][] {
    world.Clear();
    numBodies = 0;
    numJoints = 0;
    bomb = null;

    demoIndex = index;
    return Demo1(bodies, joints);
}

// Single box
function Demo1(bodies: Body[], joints: Joint[]): [Body, Entity][] {
    const b1 = bodies[numBodies];
    b1.Set(new Vec2(100.0, 20.0), Number.MAX_VALUE);
    b1.position.Set(0.0, -0.5 * b1.width.y);
    world.AddBody(b1);
    const entity1 = addPlane(new Vector3(100.0, 20, 0.0), new Vector3(b1.position.x, b1.position.y, 0), new Quaternion());

    ++numBodies;

    const b2 = bodies[numBodies];
    b2.Set(new Vec2(1.0, 1.0), 200.0, false);
    b2.position.Set(0.0, 4.0);
    world.AddBody(b2);
    const entity2 = addPlane(new Vector3(1.0, 1.0, 0.0), new Vector3(b2.position.x, b2.position.y, 0), new Quaternion());

    ++numBodies;

    return [[b1, entity1], [b2, entity2]];
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