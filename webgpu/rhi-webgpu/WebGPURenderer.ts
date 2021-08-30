import {Canvas, IHardwareRenderer, Logger, WebCanvas} from "oasis-engine";
import {Mesh} from "../graphic/Mesh";
import {SubMesh} from "../graphic/SubMesh";
import {IPlatformPrimitive} from "./IPlatformPrimitive";
import {GPUPrimitive} from "./GPUPrimitive";
import {Buffer} from "../graphic/Buffer";
import {Engine} from "../Engine";

/**
 * WebGPU renderer.
 */
export class WebGPURenderer implements IHardwareRenderer {
    public canvas: Canvas;

    public adapter: GPUAdapter;

    public device: GPUDevice;

    public context: GPUCanvasContext;

    public format: GPUTextureFormat = 'bgra8unorm';

    public commandEncoder: GPUCommandEncoder;

    public renderPassEncoder: GPURenderPassEncoder;

    public uniformGroupLayout: GPUBindGroupLayout;

    public renderPipeline: GPURenderPipeline;

    private _clearColor: GPUColorDict;

    init(canvas: Canvas) {
        this.canvas = canvas;
        return this.InitWebGPU(<WebCanvas>canvas);
    }

    public async InitWebGPU(canvas: WebCanvas) {
        this.adapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance'
        });

        this.device = await this.adapter.requestDevice();

        this.context = canvas._webCanvas.getContext('webgpu') as GPUCanvasContext;
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.format = this.context.getPreferredFormat(this.adapter);

        this.context.configure({
            device: this.device,
            format: this.format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });

        let colorTexture = this.device.createTexture({
            size: {
                width,
                height,
                depthOrArrayLayers: 1
            },
            sampleCount: 4,
            format: this.format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        let colorAttachmentView = colorTexture.createView();

        let depthStencilTexture = this.device.createTexture({
            size: {
                width,
                height,
                depthOrArrayLayers: 1
            },
            sampleCount: 4,
            format: 'depth24plus-stencil8',
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        let depthStencilAttachmentView = depthStencilTexture.createView();

        // @ts-ignore
        return Promise.resolve({colorAttachmentView, depthStencilAttachmentView});
    }

    public InitRenderPass(clearColor: GPUColorDict, colorAttachmentView: GPUTextureView, depthStencilAttachmentView: GPUTextureView) {
        this.commandEncoder = this.device.createCommandEncoder();
        let renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: colorAttachmentView,
                resolveTarget: this.context.getCurrentTexture().createView(),
                loadValue: clearColor,
                storeOp: 'store'
            }],

            depthStencilAttachment: {
                view: depthStencilAttachmentView,
                depthLoadValue: 1.0,
                depthStoreOp: 'store',
                stencilLoadValue: 0,
                stencilStoreOp: 'store'
            }
        }

        this.renderPassEncoder = this.commandEncoder.beginRenderPass(renderPassDescriptor);

        if (!this._clearColor) {
            this._clearColor = clearColor;
        }

        this.renderPassEncoder.setViewport(0, 0, this.canvas.width, this.canvas.height, 0, 1);
    }

    public InitPipelineWitMultiBuffers(vxCode: string, fxCode: string) {
        this.uniformGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: 'uniform'
                    }
                }
            ]
        });

        let layout: GPUPipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [this.uniformGroupLayout]
        });

        let vxModule: GPUShaderModule = this.device.createShaderModule({
            code: vxCode
        });

        let fxModule: GPUShaderModule = this.device.createShaderModule({
            code: fxCode
        });

        this.renderPipeline = this.device.createRenderPipeline({
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
                module: vxModule,
                entryPoint: 'main'
            },

            fragment: {
                module: fxModule,
                entryPoint: 'main',
                targets: [
                    {
                        format: this.format
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

        this.renderPassEncoder.setPipeline(this.renderPipeline);

    }

    public createUniformBuffer(engine: Engine, mxArray: Float32Array) {
        let uniformBuffer = new Buffer(engine, mxArray, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
        uniformBuffer.setData(mxArray);

        let uniformBindGroup = this.device.createBindGroup({
            layout: this.uniformGroupLayout,
            entries: [{
                binding: 0,
                resource: {buffer: uniformBuffer._nativeBuffer}
            }]
        });

        this.renderPassEncoder.setBindGroup(0, uniformBindGroup);

        return {uniformBuffer};
    }

    public DrawIndexed(indexCount: number) {
        this.renderPassEncoder.drawIndexed(indexCount, 1, 0, 0, 0);
    }

    public Draw(vertexCount: number) {
        this.renderPassEncoder.draw(vertexCount, 1, 0, 0);
    }

    public Present() {
        this.renderPassEncoder.endPass();
        this.device.queue.submit([this.commandEncoder.finish()]);
    }

    //------------------------------------------------------------------------------------------------------------------
    createPlatformPrimitive(primitive: Mesh): IPlatformPrimitive {
        return new GPUPrimitive(this, primitive);
    }

    drawPrimitive(primitive: Mesh, subPrimitive: SubMesh, shaderProgram: any) {
        // todo: VAO not support morph animation
        if (primitive) {
            //@ts-ignore
            primitive._draw(this.renderPassEncoder, shaderProgram, subPrimitive);
        } else {
            Logger.error("draw primitive failed.");
        }
    }
}