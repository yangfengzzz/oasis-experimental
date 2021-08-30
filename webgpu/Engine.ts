import {Canvas} from "oasis-engine";
import {ComponentsManager} from "./ComponentsManager";
import {ResourceManager} from "./asset/ResourceManager";
import {WebGPURenderer} from "./rhi-webgpu/WebGPURenderer";
import {SceneManager} from "./SceneManager";

/**
 * Engine.
 */
export class Engine {
    _componentsManager: ComponentsManager = new ComponentsManager();
    _hardwareRenderer: WebGPURenderer;

    protected _canvas: Canvas;
    private _resourceManager: ResourceManager = new ResourceManager(this);
    private _sceneManager: SceneManager = new SceneManager(this);

    /**
     * The canvas to use for rendering.
     */
    get canvas(): Canvas {
        return this._canvas;
    }

    /**
     * Get the resource manager.
     */
    get resourceManager(): ResourceManager {
        return this._resourceManager;
    }

    /**
     * Get the scene manager.
     */
    get sceneManager(): SceneManager {
        return this._sceneManager;
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