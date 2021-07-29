varying vec2 v_uv;
varying vec3 v_position;
varying vec3 v_normal;

uniform sampler2D u_shadowMaps;

void main (void) {
    gl_FragColor = texture2D(u_shadowMaps, v_uv);
}

