import {Matrix, Vector3} from "@oasis-engine/math";
import vxCode from './shader/vertex.wgsl';
import fxCode from './shader/fragment.wgsl'
import {PrimitiveMesh} from "./webgpu/mesh/PrimitiveMesh";
import {WebGPUEngine} from "./webgpu/rhi-webgpu/WebGPUEngine";

const triangleMVMatrix = new Matrix;
const squareMVMatrix = new Matrix();
const pMatrix = new Matrix();
Matrix.perspective(45, document.body.clientWidth / document.body.clientHeight, 0.1, 100, pMatrix);

const backgroundColor = {r: 0.4, g: 0.4, b: 0.4, a: 1.0};

let lastTime = 0, rTri = 0, rSquare = 0;
const animate = () => {
    let timeNow = performance.now();
    if (lastTime != 0) {
        let elapsed = timeNow - lastTime;
        rTri += (Math.PI / 180 * 90 * elapsed) / 1000.0;
        rSquare += (Math.PI / 180 * 75 * elapsed) / 1000.0;
    }
    lastTime = timeNow;
}

//----------------------------------------------------------------------------------------------------------------------
const engine = new WebGPUEngine("canvas");
engine.canvas.resizeByClientSize();
engine.init().then(({colorAttachmentView, depthStencilAttachmentView}) => {
    engine._hardwareRenderer.InitRenderPass(backgroundColor, colorAttachmentView, depthStencilAttachmentView)

    engine._hardwareRenderer.InitPipelineWitMultiBuffers(vxCode, fxCode);

    engine.RunRenderLoop(() => {
        animate();

        engine._hardwareRenderer.InitRenderPass(backgroundColor, colorAttachmentView, depthStencilAttachmentView);

        engine._hardwareRenderer.renderPassEncoder.setPipeline(engine._hardwareRenderer.renderPipeline);

        triangleMVMatrix.identity().translate(new Vector3(-1.5, 0.0, -7.0)).multiply(new Matrix().rotateAxisAngle(new Vector3(0, 1, 0), rTri));
        squareMVMatrix.identity().translate(new Vector3(1.5, 0.0, -7.0)).multiply(new Matrix().rotateAxisAngle(new Vector3(1, 0, 0), rSquare));

        let pBuffer: number[] = [
            0.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0];
        pMatrix.toArray(pBuffer);

        let mvBuffer: number[] = [
            0.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0];
        triangleMVMatrix.toArray(mvBuffer);

        let triangleUniformBufferView = new Float32Array(pBuffer.concat(mvBuffer));

        squareMVMatrix.toArray(mvBuffer);
        let squareUniformBufferView = new Float32Array(pBuffer.concat(mvBuffer));

        const box = PrimitiveMesh.createCuboid(engine, 1);
        engine._hardwareRenderer.createUniformBuffer(engine, triangleUniformBufferView);
        engine._hardwareRenderer.drawPrimitive(box, box.subMesh, null);

        const sphere = PrimitiveMesh.createSphere(engine, 1, 50);
        engine._hardwareRenderer.createUniformBuffer(engine, squareUniformBufferView);
        engine._hardwareRenderer.drawPrimitive(sphere, sphere.subMesh, null);

        engine._hardwareRenderer.Present();
    })
});