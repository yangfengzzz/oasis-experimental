import {IPlatformPrimitive} from "./IPlatformPrimitive";
import {SubMesh} from "../graphic/SubMesh";
import {WebGPURenderer} from "./WebGPURenderer";
import {Mesh} from "../graphic/Mesh";

/**
 * @internal
 * WebGPU platform primitive.
 */
export class GPUPrimitive implements IPlatformPrimitive {
    protected readonly _primitive: Mesh;

    constructor(rhi: WebGPURenderer, primitive: Mesh) {
        this._primitive = primitive;
    }

    /**
     * Draw the primitive.
     */
    draw(renderPassEncoder: GPURenderPassEncoder, shaderProgram: any, subMesh: SubMesh): void {
        renderPassEncoder.setVertexBuffer(0, this._primitive._vertexBufferBindings[0]._buffer._nativeBuffer);
        renderPassEncoder.setIndexBuffer(this._primitive._indexBufferBinding._buffer._nativeBuffer, "uint32");
        renderPassEncoder.drawIndexed(subMesh.count, 1, 0, 0, 0);
    }

    destroy() {
    }
}