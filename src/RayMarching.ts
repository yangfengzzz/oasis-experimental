//-- create engine object
import {
    Camera, Engine,
    Material,
    MeshRenderer,
    PrimitiveMesh,
    Shader,
    Vector3,
    WebGLEngine
} from "oasis-engine";

const engine = new WebGLEngine("canvas");
engine.canvas.resizeByClientSize();

const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

//-- create camera
const cameraEntity = rootEntity.createChild("camera_entity");
cameraEntity.transform.position = new Vector3(0, 0, 15);
cameraEntity.addComponent(Camera);

const sphereEntity = rootEntity.createChild("sphere");
const renderer = sphereEntity.addComponent(MeshRenderer);
renderer.mesh = PrimitiveMesh.createCuboid(engine, 10, 10);

// 自定义材质
const vertexSource = `
uniform mat4 u_MVPMat;
attribute vec3 POSITION;
attribute vec2 TEXCOORD_0;
attribute vec3 NORMAL;

varying vec2 v_uv;
varying vec3 v_position;
varying vec3 v_normal;

void main() {

  gl_Position = u_MVPMat  *  vec4( POSITION, 1.0 );
  v_uv = TEXCOORD_0;
  v_normal = NORMAL;
  v_position = POSITION;
}
 `;

const fragSource = `
void main (void) {
    gl_FragColor = vec4(0.5, 0.9, 0.5, 1.0);
}
`;


// 初始化 shader
Shader.create("water", vertexSource, fragSource);

class ShaderMaterial extends Material {
    constructor(engine: Engine) {
        super(engine, Shader.find("water"));
    }
}

const material = new ShaderMaterial(engine);
renderer.setMaterial(material);

engine.run();