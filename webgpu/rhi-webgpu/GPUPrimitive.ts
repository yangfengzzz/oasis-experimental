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
    draw(shaderProgram: any, subMesh: SubMesh): void {
    }

    destroy() {
    }
}