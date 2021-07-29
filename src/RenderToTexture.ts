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
import {OrbitControl} from "@oasis-engine/controls";
import {Stats} from '@oasis-engine/stats';

//----------------------------------------------------------------------------------------------------------------------
fetch('./src/render-texture.fs.glsl')
    .then(response => response.text())
    .then((fs) => {
        fetch('./src/render-texture.vs.glsl')
            .then(response => response.text())
            .then((vs) => {
                class ShaderMaterial extends Material {
                    constructor(engine: Engine) {
                        super(engine, Shader.find("water"));
                    }
                }

                class WaterScript extends Script {
                    onUpdate(deltaTime) {
                        material.shaderData.setTexture("u_shadowMaps", renderColorTexture);
                    }
                }

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

                //-- create engine object
                const engine = new WebGLEngine("canvas");
                engine.canvas.resizeByClientSize();

                // @ts-ignore
                Engine.registerFeature(Stats);

                const scene = engine.sceneManager.activeScene;
                const rootEntity = scene.createRootEntity();

                //-- create light entity
                let lighthouse = rootEntity.createChild("lighthouse");
                let light1 = lighthouse.createChild("light1");
                light1.transform.position = new Vector3(0, 5, 0);
                light1.transform.lookAt(new Vector3(), new Vector3(1, 0, 0))

                let camera = light1.addComponent(Camera);
                const renderColorTexture = new RenderColorTexture(engine, engine.canvas.width, engine.canvas.height);
                camera.renderTarget = new RenderTarget(engine, engine.canvas.width, engine.canvas.height, renderColorTexture);
                camera.aspectRatio = 1.0;
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
                obj.addComponent(WaterScript);

                //-- create camera
                let cameraNode = rootEntity.createChild("camera_node");
                cameraNode.transform.position = new Vector3(0, 5, 17);
                cameraNode.transform.lookAt(new Vector3(), new Vector3(0, 1, 0));
                cameraNode.addComponent(Camera);
                cameraNode.addComponent(OrbitControl);

                engine.run();
            })
    })