import {
    BlinnPhongMaterial,
    Camera,
    Engine,
    Material,
    MeshRenderer,
    PrimitiveMesh,
    RenderColorTexture,
    RenderTarget,
    Script,
    Shader,
    SpotLight,
    Vector3,
    WebGLEngine
} from "oasis-engine";

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

//----------------------------------------------------------------------------------------------------------------------
fetch('./src/ray-marching.fs.glsl')
    .then(response => response.text())
    .then((fs) => {
        fetch('./src/ray-marching.vs.glsl')
            .then(response => response.text())
            .then((vs) => {
                // 控制 light entity 始终看向固定点
                class LookAtFocus extends Script {
                    onUpdate(deltaTime) {
                        light1.transform.lookAt(target, up);
                    }
                }

                class ShaderMaterial extends Material {
                    constructor(engine: Engine) {
                        super(engine, Shader.find("water"));
                        this.shaderData.setFloat("time", 0.0);
                        this.shaderData.setFloat("width", 1000.0);
                        this.shaderData.setTexture("u_shadowMaps", renderColorTexture);
                    }
                }

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
                createCuboidGeometry("cubiod2", [5, -2, 0], [0, 0, 0], 0.1, 2, 10);
                createCuboidGeometry("cubiod3", [-5, -2, 0], [0, 0, 0], 0.1, 2, 10);
                createCuboidGeometry("cubiod4", [0, -2, -5], [0, 0, 0], 10, 2, 0.1);
                createCuboidGeometry("cubiod-cast-shadow", [0, -1, 0], [0, 0, 0], 1, 1, 1);

                //-- floor
                let obj = rootEntity.createChild("floor");
                obj.position = new Vector3(...[0, -3, 0]);
                obj.transform.rotation = new Vector3();
                let cubeRenderer = obj.addComponent(MeshRenderer);
                cubeRenderer.mesh = PrimitiveMesh.createCuboid(rootEntity.engine, 10, 0.1, 10);
                Shader.create("water", vs, fs);
                const material = new ShaderMaterial(engine);
                cubeRenderer.setMaterial(material);

                //-- create camera
                let cameraNode = rootEntity.createChild("camera_node");
                cameraNode.transform.position = new Vector3(0, 5, 17);
                cameraNode.transform.lookAt(new Vector3(), new Vector3(0, 1, 0));
                cameraNode.addComponent(Camera);

                let camera = cameraNode.addComponent(Camera);
                const renderColorTexture = new RenderColorTexture(engine, 1024, 1024);
                camera.renderTarget = new RenderTarget(engine, 1024, 1024, renderColorTexture);

                engine.run();
            })
    })