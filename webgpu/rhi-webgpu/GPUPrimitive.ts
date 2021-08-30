import {IPlatformPrimitive} from "./IPlatformPrimitive";
import {SubMesh} from "../graphic/SubMesh";
import {WebGPURenderer} from "./WebGPURenderer";
import {Mesh} from "../graphic/Mesh";
import {ShaderProgram} from "../shader/ShaderProgram";

/**
 * @internal
 * WebGPU platform primitive.
 */
export class GPUPrimitive implements IPlatformPrimitive {
    protected readonly _primitive: Mesh;
    private _renderer: WebGPURenderer;

    public renderPipeline: GPURenderPipeline;

    constructor(rhi: WebGPURenderer, primitive: Mesh) {
        this._renderer = rhi;
        this._primitive = primitive;
    }

    /**
     * Draw the primitive.
     */
    draw(renderPassEncoder: GPURenderPassEncoder, shaderProgram: ShaderProgram, subMesh: SubMesh): void {
        this.createRenderPipeline(shaderProgram, subMesh);
        renderPassEncoder.setPipeline(this.renderPipeline);

        renderPassEncoder.setVertexBuffer(0, this._primitive._vertexBufferBindings[0]._buffer._nativeBuffer);
        renderPassEncoder.setIndexBuffer(this._primitive._indexBufferBinding._buffer._nativeBuffer, "uint32");
        renderPassEncoder.drawIndexed(subMesh.count, 1, subMesh.start, 0, 0);
    }

    createRenderPipeline(shaderProgram: ShaderProgram, subMesh: SubMesh) {
        const device = this._renderer.device;

        let layout: GPUPipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [this._renderer.uniformGroupLayout]
        });

        this.renderPipeline = device.createRenderPipeline({
            layout: layout,
            vertex: {
                buffers: [
                    {
                        arrayStride: 4 * 8,
                        attributes: [
                            // position
                            {
                                shaderLocation: 0,
                                offset: 0,
                                format: 'float32x3'
                            },

                            // normal
                            {
                                shaderLocation: 1,
                                offset: 4 * 3,
                                format: 'float32x3'
                            },

                            // uv
                            {
                                shaderLocation: 2,
                                offset: 4 * 6,
                                format: 'float32x2'
                            }
                        ],
                        stepMode: 'vertex'
                    },
                ],
                module: shaderProgram.vertexShader,
                entryPoint: 'main'
            },

            fragment: {
                module: shaderProgram.fragmentShader,
                entryPoint: 'main',
                targets: [
                    {
                        format: this._renderer.format
                    }
                ]
            },

            primitive: {
                topology: 'triangle-list'
            },

            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus-stencil8'
            },

            multisample: {
                count: 4
            }
        });
    }

    destroy() {
    }
}