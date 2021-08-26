export default
`[[block]]struct Uniforms {
  [[size(64)]]uPMatrix: mat4x4<f32>;
  [[size(64)]]uMVMatrix: mat4x4<f32>;
};
[[group(0), binding(0)]]
var<uniform> uniforms: Uniforms;

struct VertexInput {
    [[location(0)]] aVertexPosition: vec3<f32>;
    [[location(1)]] aVertexColor: vec3<f32>;
    [[location(2)]] aVertexUV: vec2<f32>;
};

struct Output {
  [[location(0)]] vColor: vec3<f32>;
  [[builtin(position)]] Position: vec4<f32>;
};

[[stage(vertex)]]
fn main(vertexInput: VertexInput) -> Output {
  var output: Output;
  output.Position = uniforms.uPMatrix * uniforms.uMVMatrix * vec4<f32>(vertexInput.aVertexPosition, 1.0);
  output.vColor = vertexInput.aVertexColor;
  return output;
}`;