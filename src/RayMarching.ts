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
import {Matrix, Vector4} from "@oasis-engine/math";

const engine = new WebGLEngine("canvas");
engine.canvas.resizeByClientSize();

const scene = engine.sceneManager.activeScene;
const rootEntity = scene.createRootEntity();

//-- create camera
const cameraEntity = rootEntity.createChild("camera_entity");
cameraEntity.transform.position = new Vector3(0, 0, 15);
const camera = cameraEntity.addComponent(Camera);
camera.fieldOfView = 60.0;

const sphereEntity = rootEntity.createChild("sphere");
const renderer = sphereEntity.addComponent(MeshRenderer);
const cubeGeometry = renderScreenSpaceQuad(engine, 0.0, 0.0, 1280, 720);
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
    const indices: Uint16Array = new Uint16Array([ 0, 2, 1, 0, 3, 2]);

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

uniform mat4 u_mtx;
uniform vec4 u_lightDirTime;

#define u_lightDir u_lightDirTime.xyz
// #define u_time     u_lightDirTime.w

float sdSphere(vec3 _pos, float _radius) {
    return length(_pos) - _radius;
}

float udBox(vec3 _pos, vec3 _extents) {
    return length(max(abs(_pos) - _extents, 0.0) );
}

float udRoundBox(vec3 _pos, vec3 _extents, float r) {
    return length(max(abs(_pos) - _extents, 0.0) ) - r;
}

float sdBox(vec3 _pos, vec3 _extents) {
    vec3 d = abs(_pos) - _extents;
    return min(max(d.x, max(d.y, d.z) ), 0.0) + length(max(d, 0.0) );
}

float sdTorus(vec3 _pos, vec2 t) {
    vec2 q = vec2(length(_pos.xz) - t.x, _pos.y);
    return length(q) - t.y;
}

float sdCylinder(vec3 _pos, vec3 c) {
    return length(_pos.xz - c.xy) - c.z;
}

float sdCone(vec3 _pos, vec2 c) {
    // c must be normalized
    float q = length(_pos.xy);
    return dot(c, vec2(q, _pos.z) );
}

float sdPlane(vec3 _pos, vec4 n) {
    // n must be normalized
    return dot(_pos, n.xyz) + n.w;
}

float sdHexPrism(vec3 _pos, vec2 h) {
    vec3 q = abs(_pos);
    return max(q.z - h.y, max(q.x + q.y * 0.57735, q.y * 1.1547) - h.x);
}

float sdTriPrism(vec3 _pos, vec2 h) {
    vec3 q = abs(_pos);
    return max(q.z - h.y, max(q.x * 0.866025 + _pos.y * 0.5, -_pos.y) - h.x * 0.5);
}

// domain operations
float opUnion(float d1, float d2) {
    return min(d1, d2);
}

float opSubtract(float d1, float d2) {
    return max(-d1, d2);
}

float opIntersect(float d1, float d2) {
    return max(d1, d2);
}

//----------------------------------------------------------------------------------------------------------------------
float sceneDist(vec3 _pos) {
    float d1 = udRoundBox(_pos, vec3(2.5, 2.5, 2.5), 0.5);
    float d2 = sdSphere(_pos + vec3( 4.0, 0.0, 0.0), 1.0);
    float d3 = sdSphere(_pos + vec3(-4.0, 0.0, 0.0), 1.0);
    float d4 = sdSphere(_pos + vec3( 0.0, 4.0, 0.0), 1.0);
    float d5 = sdSphere(_pos + vec3( 0.0,-4.0, 0.0), 1.0);
    float d6 = sdSphere(_pos + vec3( 0.0, 0.0, 4.0), 1.0);
    float d7 = sdSphere(_pos + vec3( 0.0, 0.0,-4.0), 1.0);
    float dist = min(min(min(min(min(min(d1, d2), d3), d4), d5), d6), d7);
    return dist;
}

vec3 calcNormal(vec3 _pos) {
    const vec2 delta = vec2(0.002, 0.0);
    float nx = sceneDist(_pos + delta.xyy) - sceneDist(_pos - delta.xyy);
    float ny = sceneDist(_pos + delta.yxy) - sceneDist(_pos - delta.yxy);
    float nz = sceneDist(_pos + delta.yyx) - sceneDist(_pos - delta.yyx);
    return normalize(vec3(nx, ny, nz) );
}

float calcAmbOcc(vec3 _pos, vec3 _normal) {
    float occ = 0.0;
    float aostep = 0.2;
    for (int ii = 1; ii < 4; ii++) {
        float fi = float(ii);
        float dist = sceneDist(_pos + _normal * fi * aostep);
        occ += (fi * aostep - dist) / pow(2.0, fi);
    }
    
    return 1.0 - occ;
}

float trace(vec3 _ray, vec3 _dir, float _maxd) {
    float tt = 0.0;
    float epsilon = 0.001;
    
    for (int ii = 0; ii < 64; ii++) {
        float dist = sceneDist(_ray + _dir*tt);
        if (dist > epsilon) {
            tt += dist;
        }
    }
    
    return tt < _maxd ? tt : 0.0;
}

vec2 blinn(vec3 _lightDir, vec3 _normal, vec3 _viewDir) {
    float ndotl = dot(_normal, _lightDir);
    vec3 reflected = _lightDir - 2.0*ndotl*_normal; // reflect(_lightDir, _normal);
    float rdotv = dot(reflected, _viewDir);
    return vec2(ndotl, rdotv);
}

float fresnel(float _ndotl, float _bias, float _pow) {
    float facing = (1.0 - _ndotl);
    return max(_bias + (1.0 - _bias) * pow(facing, _pow), 0.0);
}

vec4 lit(float _ndotl, float _rdotv, float _m) {
    float diff = max(0.0, _ndotl);
    float spec = step(0.0, _ndotl) * max(0.0, _rdotv * _m);
    return vec4(1.0, diff, spec, 1.0);
}

//----------------------------------------------------------------------------------------------------------------------
void main (void) {
    vec4 tmp;
    tmp = u_mtx * vec4(v_uv.xy, 0.0, 1.0);
    vec3 eye = tmp.xyz/tmp.w;
    
    tmp = u_mtx * vec4(v_uv.xy, 1.0, 1.0);
    vec3 at = tmp.xyz/tmp.w;
    
    float maxd = length(at - eye);
    vec3 dir = normalize(at - eye);
    
    float dist = trace(eye, dir, maxd);
    
    if (dist > 0.5) {
        vec3 pos = eye + dir*dist;
        vec3 normal = calcNormal(pos);
        
        vec2 bln = blinn(u_lightDir, normal, dir);
        vec4 lc = lit(bln.x, bln.y, 1.0);
        float fres = fresnel(bln.x, 0.2, 5.0);
        
        float val = 0.9*lc.y + pow(lc.z, 128.0)*fres;
        val *= calcAmbOcc(pos, normal);
        val = pow(val, 1.0/2.2);
        
        gl_FragColor = vec4(val, val, val, 1.0);
        // gl_FragDepth = dist/maxd;
    }
    else {
        gl_FragColor = vec4(0.5, 0.9, 0.5, 1.0);
        // gl_FragDepth = 1.0;
    }
}
`;

// 初始化 shader
Shader.create("water", vertexSource, fragSource);

class ShaderMaterial extends Material {
    constructor(engine: Engine) {
        super(engine, Shader.find("water"));
        this.shaderData.setMatrix("u_mtx", new Matrix());
        this.shaderData.setVector4("u_lightDirTime", new Vector4());
    }
}

const material = new ShaderMaterial(engine);
renderer.setMaterial(material);

// u_time 更新脚本=======================================================================================================
class WaterScript extends Script {
    m_time: number = 0;

    onUpdate(deltaTime) {
        this.m_time += deltaTime / 10000;
        const mtx = new Matrix();
        Matrix.rotationAxisAngle(new Vector3(0, 0, 1), this.m_time, mtx);
        const inverse_mvp = new Matrix();
        Matrix.multiply(cameraEntity.getComponent(Camera).invViewProjMat, mtx.invert(), inverse_mvp);

        material.shaderData.setMatrix("u_mtx", inverse_mvp);
        material.shaderData.setVector4("u_lightDirTime", new Vector4(1, 1, 1, this.m_time));
    }
}

sphereEntity.addComponent(WaterScript);

engine.run();