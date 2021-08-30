import {IHardwareRenderer, Logger} from "oasis-engine";
import {Mesh} from "../graphic/Mesh";
import {SubMesh} from "../graphic/SubMesh";
import {IPlatformPrimitive} from "./IPlatformPrimitive";
import {GPUPrimitive} from "./GPUPrimitive";

/**
 * WebGPU renderer.
 */
export class WebGPURenderer implements IHardwareRenderer {
    createPlatformPrimitive(primitive: Mesh): IPlatformPrimitive {
        return new GPUPrimitive(this, primitive);
    }

    drawPrimitive(primitive: Mesh, subPrimitive: SubMesh, shaderProgram: any) {
        // todo: VAO not support morph animation
        if (primitive) {
            //@ts-ignore
            primitive._draw(shaderProgram, subPrimitive);
        } else {
            Logger.error("draw primitive failed.");
        }
    }
}