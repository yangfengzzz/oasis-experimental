import {OrbitControl} from "@oasis-engine/controls";
import {
    BlinnPhongMaterial, Buffer, BufferBindFlag, BufferMesh, BufferUsage,
    Camera, Engine, IndexFormat, Material, Mesh,
    MeshRenderer,
    PrimitiveMesh, RenderColorTexture, RenderTarget,
    Script, Shader,
    SpotLight,
    Vector3, VertexElement, VertexElementFormat,
    WebGLEngine
} from "oasis-engine";
import {Stats} from "@oasis-engine/stats";

const target = new Vector3(0, -3, 0);
const up = new Vector3(0, 1, 0);

class Move extends Script {
    time = 0;
    y = 3;
    range = 5;

    constructor(node) {
        super(node);
    }

    onUpdate(deltaTime) {
        this.time += deltaTime / 1000;
        let x = Math.cos(this.time) * this.range;
        let y = Math.sin(this.time) * this.range * 0.2 + this.y;
        let z = Math.cos(this.time) * this.range;
        this.entity.transform.position = new Vector3(x, y, z);
    }
}

// 控制 light entity 始终看向固定点
class LookAtFocus extends Script {
    onUpdate(deltaTime) {
        light1.transform.lookAt(target, up);
    }
}

//----------------------------------------------------------------------------------------------------------------------
//-- create engine object
const engine = new WebGLEngine("canvas");
engine.canvas.resizeByClientSize();

const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

// Logger.enable();
function createCuboidGeometry(name, position, rotation, w, h, d) {
    let obj = rootEntity.createChild(name);
    obj.position = new Vector3(...position);
    obj.transform.rotation = new Vector3(rotation[0], rotation[0], rotation[0]);
    let cubeRenderer = obj.addComponent(MeshRenderer);
    cubeRenderer.mesh = PrimitiveMesh.createCuboid(rootEntity.engine, w, h, d);

    let mtl = new BlinnPhongMaterial(engine);
    const color = mtl.baseColor;
    color.r = Math.random();
    color.g = Math.random();
    color.b = Math.random();
    color.a = 1.0;
    cubeRenderer.setMaterial(mtl);
}

//-- create light entity
let lighthouse = rootEntity.createChild("lighthouse");
let light1 = lighthouse.createChild("light1");
light1.addComponent(Move);
light1.addComponent(LookAtFocus);

let spotLight = light1.addComponent(SpotLight);
spotLight.angle = Math.PI / 12;

let sphereRenderer3 = light1.addComponent(MeshRenderer);
sphereRenderer3.mesh = PrimitiveMesh.createSphere(engine, 0.1);
let mtl = new BlinnPhongMaterial(engine);
const color = mtl.baseColor;
color.r = Math.random();
color.g = Math.random();
color.b = Math.random();
color.a = 1.0;
sphereRenderer3.setMaterial(mtl);

//-- create geometry
createCuboidGeometry("cubiod1", [0, -3, 0], [0, 0, 0], 10, 0.1, 10);
createCuboidGeometry("cubiod2", [5, -2, 0], [0, 0, 0], 0.1, 2, 10);
createCuboidGeometry("cubiod3", [-5, -2, 0], [0, 0, 0], 0.1, 2, 10);
createCuboidGeometry("cubiod4", [0, -2, -5], [0, 0, 0], 10, 2, 0.1);
createCuboidGeometry("cubiod-cast-shadow", [0, -1, 0], [0, 0, 0], 1, 1, 1);

//-- create camera
let cameraNode = rootEntity.createChild("camera_node");
cameraNode.transform.position = new Vector3(0, 5, 17);
cameraNode.transform.lookAt(new Vector3(), new Vector3(0, 1, 0));
let camera = cameraNode.addComponent(Camera);

const renderColorTexture = new RenderColorTexture(engine, 1024, 1024);
const renderTarget = new RenderTarget(engine, 1024, 1024, renderColorTexture);
camera.renderTarget = renderTarget;

engine.update();
//----------------------------------------------------------------------------------------------------------------------
scene.removeRootEntity(rootEntity);
fetch('./src/ray-marching.fs.glsl')
    .then(response => response.text())
    .then((fs) => {
        fetch('./src/ray-marching.vs.glsl')
            .then(response => response.text())
            .then((vs) => {
                engine.canvas.resizeByClientSize();

                // @ts-ignore
                Engine.registerFeature(Stats);

                const scene = engine.sceneManager.activeScene;
                const rootEntity = scene.createRootEntity();

                //-- create camera
                const cameraEntity = rootEntity.createChild("camera_entity");
                cameraEntity.transform.position = new Vector3(0, 0, -15);
                cameraEntity.transform.lookAt(new Vector3());
                const camera = cameraEntity.addComponent(Camera);
                camera.fieldOfView = 60.0;
                camera.orthographicSize = 20.0;
                camera.isOrthographic = true;

                const sphereEntity = rootEntity.createChild("sphere");
                const renderer = sphereEntity.addComponent(MeshRenderer);
                renderer.mesh = renderScreenSpaceQuad(engine, -10.0, -15.0, 35, 30);

                // 初始化 shader
                Shader.create("water", vs, fs);
                const material = new ShaderMaterial(engine);
                renderer.setMaterial(material);

                // u_time 更新脚本=======================================================================================
                class WaterScript extends Script {
                    m_time: number = 0;

                    onUpdate(deltaTime) {
                        this.m_time += deltaTime / 10000;
                        material.shaderData.setFloat("time", this.m_time);
                        material.shaderData.setFloat("width", 1000.0);
                    }
                }

                sphereEntity.addComponent(WaterScript);

                engine.run();
            })
    })

/**
 * Create cube geometry with custom BufferGeometry.
 */
function renderScreenSpaceQuad(engine: Engine, _x: number, _y: number, _width: number, _height: number): Mesh {
    const geometry = new BufferMesh(engine, "CustomCubeGeometry");

    const zz: number = 0.0;

    const minx: number = _x;
    const maxx: number = _x + _width;
    const miny: number = _y;
    const maxy: number = _y + _height;

    const minu: number = -1.0;
    const minv: number = -1.0;
    const maxu: number = 1.0;
    const maxv: number = 1.0;

    // prettier-ignore
    // Create vertices data.
    const vertices: Float32Array = new Float32Array([
        // Up
        minx, miny, zz, minu, minv,
        // Down
        maxx, miny, zz, maxu, minv,
        // Left
        maxx, maxy, zz, maxu, maxv,
        // Right
        minx, maxy, zz, minu, maxv]);

    // prettier-ignore
    // Create indices data.
    const indices: Uint16Array = new Uint16Array([0, 2, 1, 0, 3, 2]);

    // Create gpu vertex buffer and index buffer.
    const vertexBuffer = new Buffer(engine, BufferBindFlag.VertexBuffer, vertices, BufferUsage.Static);
    const indexBuffer = new Buffer(engine, BufferBindFlag.IndexBuffer, indices, BufferUsage.Static);

    // Bind buffer
    geometry.setVertexBufferBinding(vertexBuffer, 20);
    geometry.setIndexBufferBinding(indexBuffer, IndexFormat.UInt16);

    // Add vertexElement
    geometry.setVertexElements([
        new VertexElement("POSITION", 0, VertexElementFormat.Vector3, 0),
        new VertexElement("TEXCOORD_0", 12, VertexElementFormat.Vector2, 0)
    ]);

    // Add one sub geometry.
    geometry.addSubMesh(0, indices.length);
    return geometry;
}

class ShaderMaterial extends Material {
    constructor(engine: Engine) {
        super(engine, Shader.find("water"));
        this.shaderData.setFloat("time", 0.0);
        this.shaderData.setFloat("width", 1000.0);
    }
}