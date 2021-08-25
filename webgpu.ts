import {App} from './app';
import vxCode from './shader/vertex.wgsl';
import fxCode from './shader/fragment.wgsl'
import {Matrix, Vector3} from "@oasis-engine/math";

const triangleVertexPositon = new Float32Array([

    0.0, 1.0, 0.0,
    -1.0, -1.0, 0.0,
    1.0, -1.0, 0.0,

]);

const triangleVertexColor = new Float32Array([

    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0

]);

const triangleIndex = new Uint32Array([0, 1, 2]);

const triangleMVMatrix = new Matrix;

const squareVertexPosition = new Float32Array([

    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0

]);

const squareVertexColor = new Float32Array([

    0.5, 0.5, 1.0, 1.0,
    0.5, 0.5, 1.0, 1.0,
    0.5, 0.5, 1.0, 1.0,
    0.5, 0.5, 1.0, 1.0,

]);

const squareIndex = new Uint32Array([0, 1, 2, 1, 2, 3]);

const squareMVMatrix = new Matrix();

let main = async () => {
    let pMatrix = new Matrix();
    Matrix.perspective(45, document.body.clientWidth / document.body.clientHeight, 0.1, 100, pMatrix);

    let backgroundColor = {r: 0, g: 0, b: 0, a: 1.0};

    let app = new App();

    app.CreateCanvas(document.body)

    await app.InitWebGPU();

    app.InitRenderPass(backgroundColor);

    app.InitPipelineWitMultiBuffers(vxCode, fxCode);

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

    app.RunRenderLoop(() => {

        animate();

        app.InitRenderPass(backgroundColor);

        app.renderPassEncoder.setPipeline(app.renderPipeline);

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

        app.InitGPUBufferWithMultiBuffers(triangleVertexPositon, triangleVertexColor, triangleIndex, triangleUniformBufferView);

        app.Draw(triangleIndex.length);

        app.InitGPUBufferWithMultiBuffers(squareVertexPosition, squareVertexColor, squareIndex, squareUniformBufferView);

        app.Draw(squareIndex.length);

        app.Present();

    })


}

window.addEventListener('DOMContentLoaded', main);