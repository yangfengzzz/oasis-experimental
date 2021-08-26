import {Engine} from './webgpu/Engine';
import vxCode from './shader/vertex.wgsl';
import fxCode from './shader/fragment.wgsl'
import {Matrix, Vector3} from "@oasis-engine/math";

const triangleVertexPositionColor = new Float32Array([
    0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0,
    -1.0, -1.0, 0.0, 0.0, 1.0, 0.0, 1.0,
    1.0, -1.0, 0.0, 0.0, 0.0, 1.0, 1.0
]);

const triangleIndex = new Uint32Array([0, 1, 2]);

const triangleMVMatrix = new Matrix;

const squareVertexPositionColor = new Float32Array([
    1.0, 1.0, 0.0,  0.5, 0.5, 1.0, 1.0,
    -1.0, 1.0, 0.0,  0.5, 0.5, 1.0, 1.0,
    1.0, -1.0, 0.0, 0.5, 0.5, 1.0, 1.0,
    -1.0, -1.0, 0.0, 0.5, 0.5, 1.0, 1.0,
]);

const squareIndex = new Uint32Array([0, 1, 2, 1, 2, 3]);

const squareMVMatrix = new Matrix();

let main = async () => {
    let pMatrix = new Matrix();
    Matrix.perspective(45, document.body.clientWidth / document.body.clientHeight, 0.1, 100, pMatrix);

    let backgroundColor = {r: 0, g: 0, b: 0, a: 1.0};

    let engine = new Engine();

    engine.CreateCanvas(document.body)

    await engine.InitWebGPU();

    engine.InitRenderPass(backgroundColor);

    engine.InitPipelineWitMultiBuffers(vxCode, fxCode);

    let lastTime = 0, rTri = 0, rSquare = 0;

    let animate = () => {

        let timeNow = performance.now();

        if (lastTime != 0) {

            let elapsed = timeNow - lastTime;

            rTri += (Math.PI / 180 * 90 * elapsed) / 1000.0;

            rSquare += (Math.PI / 180 * 75 * elapsed) / 1000.0;

        }

        lastTime = timeNow;
    }

    engine.RunRenderLoop(() => {

        animate();

        engine.InitRenderPass(backgroundColor);

        engine.renderPassEncoder.setPipeline(engine.renderPipeline);

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

        engine.InitGPUBufferWithMultiBuffers(triangleVertexPositionColor, triangleIndex, triangleUniformBufferView);

        engine.Draw(triangleIndex.length);

        engine.InitGPUBufferWithMultiBuffers(squareVertexPositionColor, squareIndex, squareUniformBufferView);

        engine.Draw(squareIndex.length);

        engine.Present();

    })


}

window.addEventListener('DOMContentLoaded', main);