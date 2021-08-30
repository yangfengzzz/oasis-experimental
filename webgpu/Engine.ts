import {ComponentsManager} from "./ComponentsManager";
import {ResourceManager} from "./asset/ResourceManager";
import {WebGPURenderer} from "./rhi-webgpu/WebGPURenderer";

/**
 * Engine.
 */
export class Engine {
    _componentsManager: ComponentsManager = new ComponentsManager();
    _hardwareRenderer: WebGPURenderer;
    private _resourceManager: ResourceManager = new ResourceManager(this);

    /**
     * Get the resource manager.
     */
    get resourceManager(): ResourceManager {
        return this._resourceManager;
    }

    constructor() {
        this._hardwareRenderer = new WebGPURenderer();
    }

    public RunRenderLoop(fn: Function) {
        fn();

        requestAnimationFrame(() => this.RunRenderLoop(fn));
    }
}