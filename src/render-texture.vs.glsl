uniform mat4 u_MVPMat;
attribute vec3 POSITION;
attribute vec2 TEXCOORD_0;
attribute vec3 NORMAL;

varying vec2 v_uv;
varying vec3 v_position;
varying vec3 v_normal;

void main() {
    gl_Position = u_MVPMat  *  vec4(POSITION, 1.0);
    v_uv = TEXCOORD_0;
    v_normal = NORMAL;
    v_position = POSITION;
}
