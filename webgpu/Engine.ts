import {ComponentsManager} from "./ComponentsManager";
import {ResourceManager} from "./asset/ResourceManager";
import {WebGPURenderer} from "./rhi-webgpu/WebGPURenderer";
import {Canvas} from "oasis-engine";

/**
 * Engine.
 */
export class Engine {
    _componentsManager: ComponentsManager = new ComponentsManager();
    _hardwareRenderer: WebGPURenderer;

    protected _canvas: Canvas;
    private _resourceManager: ResourceManager = new ResourceManager(this);

    /**
     * Get the resource manager.
     */
    get resourceManager(): ResourceManager {
        return this._resourceManager;
    }

    constructor(canvas: Canvas, hardwareRenderer: WebGPURenderer) {
        this._canvas = canvas;
        this._hardwareRenderer = hardwareRenderer;
    }

    init() {
        return this._hardwareRenderer.init(this._canvas);
    }

    public RunRenderLoop(fn: Function) {
        fn();

        requestAnimationFrame(() => this.RunRenderLoop(fn));
    }
}