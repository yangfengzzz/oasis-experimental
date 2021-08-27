import "@webgpu/types"

// typed array parameters
export type TypedArray =
    Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array;

/**
 * Engine.
 */
export class Engine {
    public canvas: HTMLCanvasElement;

    public adapter: GPUAdapter;

    public device: GPUDevice;

    public context: GPUCanvasContext;

    public format: GPUTextureFormat = 'bgra8unorm';

    public commandEncoder: GPUCommandEncoder;

    public renderPassEncoder: GPURenderPassEncoder;

    public uniformGroupLayout: GPUBindGroupLayout;

    public renderPipeline: GPURenderPipeline;

    public devicePixelWidth: number;

    public devicePixelHeight: number;

    private _clearColor: GPUColorDict;

    public CreateCanvas(rootElement: HTMLElement) {
        let width = rootElement.clientWidth;
        let height = rootElement.clientHeight;

        this.devicePixelWidth = width * window.devicePixelRatio;
        this.devicePixelHeight = height * window.devicePixelRatio;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.devicePixelWidth;
        this.canvas.height = this.devicePixelHeight;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';

        rootElement.appendChild(this.canvas);

        // @ts-ignore
        return Promise.resolve({
            width: this.devicePixelWidth,
            height: this.devicePixelHeight
        });
    }

    public async InitWebGPU(width: number, height: number) {
        this.adapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance'
        });

        this.device = await this.adapter.requestDevice();

        this.context = <unknown>this.canvas.getContext('webgpu') as GPUCanvasContext;

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

        this.renderPassEncoder.setViewport(0, 0, this.devicePixelWidth, this.devicePixelHeight, 0, 1);
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

    private _CreateGPUBuffer(typedArray: TypedArray, usage: GPUBufferUsageFlags) {

        let gpuBuffer = this.device.createBuffer({

            size: typedArray.byteLength,

            usage: usage | GPUBufferUsage.COPY_DST,

            mappedAtCreation: true

        });

        let constructor = typedArray.constructor as new (buffer: ArrayBuffer) => TypedArray;

        let view = new constructor(gpuBuffer.getMappedRange());

        view.set(typedArray, 0);

        gpuBuffer.unmap();

        return gpuBuffer;

    }

    public createVertexIndexBuffer(vxArray: Float32Array, idxArray: Uint32Array) {
        let vertexBuffer = this._CreateGPUBuffer(vxArray, GPUBufferUsage.VERTEX);

        this.renderPassEncoder.setVertexBuffer(0, vertexBuffer);

        let indexBuffer = this._CreateGPUBuffer(idxArray, GPUBufferUsage.INDEX);

        this.renderPassEncoder.setIndexBuffer(indexBuffer, "uint32");
    }

    public createUniformBuffer(mxArray: Float32Array) {
        let uniformBuffer = this._CreateGPUBuffer(mxArray, GPUBufferUsage.UNIFORM);

        let uniformBindGroup = this.device.createBindGroup({
            layout: this.uniformGroupLayout,
            entries: [{
                binding: 0,
                resource: {buffer: uniformBuffer}
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

    public RunRenderLoop(fn: Function) {
        fn();

        requestAnimationFrame(() => this.RunRenderLoop(fn));
    }

}