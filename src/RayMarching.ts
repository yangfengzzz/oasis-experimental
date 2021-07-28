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
import { Stats } from '@oasis-engine/stats';

const engine = new WebGLEngine("canvas");
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
const cubeGeometry = renderScreenSpaceQuad(engine, -10.0, -15.0, 35, 30);
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
uniform float width;

float PlaneObj = 0.0;
float SphereObj = 1.0;

struct Ray {
  vec3 origin;
  vec3 dir;
};

struct Light {
  vec3 pos;
};

struct Camera {
  vec3 pos;
  Ray ray;
  float rayDivergence;
};

struct Sphere {
  vec3 center;
  float radius;
};

struct Plane {
  float yCoord;
};

float unionOp(float d0, float d1) {
  return min(d0, d1);
}

float distToSphere(Ray r, Sphere s) {
  return length(r.origin - s.center) - s.radius;
}

float distToPlane(Ray r, Plane p) {
  return r.origin.y - p.yCoord;
}

vec2 distToScene(Ray r) {
  Plane p = Plane(0.0);
  float dtp = distToPlane(r, p);
  Sphere s = Sphere(vec3(0.0, 6.0, 0.0), 6.0);
  float dts = distToSphere(r, s);
  float object = (dtp > dts) ? SphereObj : PlaneObj;
  if (object == SphereObj) {
    vec3 pos = r.origin;
    pos += vec3(sin(pos.y * 5.0),
                  sin(pos.z * 5.0),
                  sin(pos.x * 5.0)) * 0.05;
    Ray ray = Ray(pos, r.dir);
    dts = distToSphere(ray, s);
  }
  float dist = unionOp(dts, dtp);
  return vec2(dist, object);
}

vec3 getNormal(Ray ray) {
  vec2 eps = vec2(0.001, 0.0);
  vec3 n = vec3(distToScene(Ray(ray.origin + eps.xyy, ray.dir)).x -
                    distToScene(Ray(ray.origin - eps.xyy, ray.dir)).x,
                    distToScene(Ray(ray.origin + eps.yxy, ray.dir)).x -
                    distToScene(Ray(ray.origin - eps.yxy, ray.dir)).x,
                    distToScene(Ray(ray.origin + eps.yyx, ray.dir)).x -
                    distToScene(Ray(ray.origin - eps.yyx, ray.dir)).x);
  return normalize(n);
}

Camera setupCam(vec3 pos, vec3 target, float fov, vec2 uv, float width) {
  uv *= fov;
  vec3 cw = normalize (target - pos);
  vec3 cp = vec3 (0.0, 1.0, 0.0);
  vec3 cu = normalize(cross(cw, cp));
  vec3 cv = normalize(cross(cu, cw));
  vec3 dir = normalize (uv.x * cu + uv.y * cv + 0.5 * cw);
  Ray ray = Ray(pos, dir);
  Camera cam = Camera(pos, ray, fov / width);
  return cam;
}

Camera reflectRay(Camera cam, vec3 n, float eps) {
  cam.ray.origin += n * eps;
  cam.ray.dir = reflect(cam.ray.dir, n);
  return cam;
}

Camera refractRay(Camera cam, vec3 n, float eps, float ior) {
  cam.ray.origin -= n * eps * 2.0;
  cam.ray.dir = refract(cam.ray.dir, n, ior);
  return cam;
}

void main (void) {  
  vec3 camPos = vec3(sin(time) * 15.0,
                         sin(time) * 5.0 + 7.0,
                         cos(time) * 15.0);
  Camera cam = setupCam(camPos, vec3(0.0), 1.25, v_uv, width);
  vec3 col = vec3(0.9);
  float eps = 0.01;
  bool inside = false;
  for (int i = 0; i < 300; i++) {
    vec2 dist = distToScene(cam.ray);
    dist.x *= inside ? -1.0 : 1.0;
    float closestObject = dist.y;
    if (dist.x < eps) {
      vec3 normal = getNormal(cam.ray) * (inside ? -1.0 : 1.0);
      if (closestObject == PlaneObj) {
        vec2 pos = cam.ray.origin.xz;
        pos *= 0.1;
        pos = floor(mod(pos, 2.0));
        float check = mod(pos.x + pos.y, 2.0);
        col *= check * 0.5 + 0.5;
        cam = reflectRay(cam, normal, eps);
      } else if (closestObject == SphereObj) {
        inside = !inside;
        float ior = inside ? 1.0 / 1.33 : 1.33;
        cam = refractRay(cam, normal, eps, ior);
      }
    }
    cam.ray.origin += cam.ray.dir * dist.x * 0.5;
    eps += cam.rayDivergence * dist.x;
  }
  col *= mix(vec3(0.8, 0.8, 0.4), vec3(0.4, 0.4, 1.0), cam.ray.dir.y);

  gl_FragColor = vec4(col, 1.0);
}
`;

// 初始化 shader
Shader.create("water", vertexSource, fragSource);

class ShaderMaterial extends Material {
    constructor(engine: Engine) {
        super(engine, Shader.find("water"));
        this.shaderData.setFloat("time", 0.0);
        this.shaderData.setFloat("width", 1000.0);
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
        material.shaderData.setFloat("width", 1000.0);
    }
}

sphereEntity.addComponent(WaterScript);

engine.run();