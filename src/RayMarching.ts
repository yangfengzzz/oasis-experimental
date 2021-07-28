//-- create engine object
import {
    Buffer, BufferBindFlag,
    BufferMesh, BufferUsage,
    Camera, Engine, IndexFormat,
    Material, Mesh,
    MeshRenderer, Script,
    Shader,
    Vector3, VertexElement, VertexElementFormat,
    WebGLEngine
} from "oasis-engine";

const engine = new WebGLEngine("canvas");
engine.canvas.resizeByClientSize();

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
const cubeGeometry = renderScreenSpaceQuad(engine, -10.0, -15.0, 30, 30);
renderer.mesh = cubeGeometry;

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

// 自定义材质============================================================================================================
const vertexSource = `
uniform mat4 u_MVPMat;
attribute vec3 POSITION;
attribute vec2 TEXCOORD_0;

varying vec2 v_uv;

void main() {
  gl_Position = u_MVPMat  *  vec4( POSITION, 1.0 );
  v_uv = TEXCOORD_0;
}
 `;

const fragSource = `
attribute vec3 POSITION;
attribute vec2 TEXCOORD_0;

varying vec2 v_uv;

uniform float time;

struct Sphere {
  vec3 center;
  float radius;
};

struct Ray {
  vec3 origin;
  vec3 direction;
};

float distanceToSphere(Ray r, Sphere s) {
  return length(r.origin - s.center) - s.radius;
}

float distanceToScene(Ray r, Sphere s, float range) {
  Ray repeatRay = r;
  repeatRay.origin = mod(r.origin, range);
  return distanceToSphere(repeatRay, s);
}

void main (void) {
    vec3 color = vec3(0.0, 0.0, 0.0);
    Sphere s;
    s.center = vec3(1.0, 0.0, 0.0);
    s.radius = 0.5;
    vec3 cameraPosition = vec3(1000.0 + sin(time) + 1.0, 1000.0 + cos(time) + 1.0, time);
    Ray ray;
    ray.origin = cameraPosition;
    ray.direction = normalize(vec3(v_uv, 1.0));
    
    for (float i = 0.0; i < 100.0; i++) {
      float distance = distanceToScene(ray, s, 2.0);
      if (distance < 0.001) {
        color = vec3(1.0);
        break;
      }
      ray.origin += ray.direction * distance;
    }
    vec3 positionToCamera = ray.origin - cameraPosition;
    
    gl_FragColor = vec4(color * abs(positionToCamera / 10.0), 1.0);
}
`;

// 初始化 shader
Shader.create("water", vertexSource, fragSource);

class ShaderMaterial extends Material {
    constructor(engine: Engine) {
        super(engine, Shader.find("water"));
        this.shaderData.setFloat("time", 0.0);
    }
}

const material = new ShaderMaterial(engine);
renderer.setMaterial(material);

// u_time 更新脚本=======================================================================================================
class WaterScript extends Script {
    m_time: number = 0;

    onUpdate(deltaTime) {
        this.m_time += deltaTime / 10000;
        material.shaderData.setFloat("time", this.m_time);
    }
}

sphereEntity.addComponent(WaterScript);

engine.run();