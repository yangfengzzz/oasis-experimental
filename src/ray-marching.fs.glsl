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

