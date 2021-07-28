//-- create engine object
import {
    Camera, Engine,
    Material,
    MeshRenderer,
    PrimitiveMesh, Script,
    Shader,
    Vector3,
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
renderer.mesh = PrimitiveMesh.createPlane(engine, 20, 20);

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
  v_uv = vec2(TEXCOORD_0.x * 2.0 - 1.0, TEXCOORD_0.y * 3.0 - 1.0);
  v_normal = NORMAL;
  v_position = POSITION;
}
 `;

const fragSource = `
attribute vec3 POSITION;
attribute vec2 TEXCOORD_0;
attribute vec3 NORMAL;

varying vec2 v_uv;
varying vec3 v_position;
varying vec3 v_normal;

uniform mat4 u_mtx;
uniform vec4 u_lightDirTime;

#define u_lightDir u_lightDirTime.xyz
#define u_time     u_lightDirTime.w

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
        gl_FragDepth = dist/maxd;
    }
    else {
        gl_FragColor = vec4(0.5, 0.9, 0.5, 1.0);
        gl_FragDepth = 1.0;
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

// u_time 更新脚本
class WaterScript extends Script {
    m_data: Date = new Date();
    m_timeOffset: number = this.m_data.getSeconds();

    onUpdate() {
        const time = this.m_data.getSeconds() - this.m_timeOffset;
        const mtx = new Matrix();
        Matrix.rotationAxisAngle(new Vector3(1, 0, 0), time, mtx);
        const inverse_mvp = new Matrix();
        Matrix.multiply(cameraEntity.getComponent(Camera).invViewProjMat, mtx.invert(), inverse_mvp);

        material.shaderData.setMatrix("u_mtx", inverse_mvp);
        material.shaderData.setVector4("u_lightDirTime", new Vector4(1, 1, 1, time));
    }
}

sphereEntity.addComponent(WaterScript);

engine.run();