import {BoundingBox} from "@oasis-engine/math";
import {SubMesh} from "./SubMesh";
import {MeshTopology} from "oasis-engine";
import {EngineObject} from "./EngineObject";
import {Engine} from "./Engine";

/**
 * Mesh.
 */
export abstract class Mesh extends EngineObject {
    /** Name. */
    name: string;
    /** The bounding volume of the mesh. */
    readonly bounds: BoundingBox = new BoundingBox();

    private _subMeshes: SubMesh[] = [];

    /**
     * First sub-mesh. Rendered using the first material.
     */
    get subMesh(): SubMesh | null {
        return this._subMeshes[0] || null;
    }

    /**
     * A collection of sub-mesh, each sub-mesh can be rendered with an independent material.
     */
    get subMeshes(): Readonly<SubMesh[]> {
        return this._subMeshes;
    }

    /**
     * Create mesh.
     * @param engine - Engine
     * @param name - Mesh name
     */
    constructor(engine: Engine, name?: string) {
        super(engine);
        this.name = name;
    }

    /**
     * Add sub-mesh, each sub-mesh can correspond to an independent material.
     * @param subMesh - Start drawing offset, if the index buffer is set, it means the offset in the index buffer, if not set, it means the offset in the vertex buffer
     * @returns Sub-mesh
     */
    addSubMesh(subMesh: SubMesh): SubMesh;

    /**
     * Add sub-mesh, each sub-mesh can correspond to an independent material.
     * @param start - Start drawing offset, if the index buffer is set, it means the offset in the index buffer, if not set, it means the offset in the vertex buffer
     * @param count - Drawing count, if the index buffer is set, it means the count in the index buffer, if not set, it means the count in the vertex buffer
     * @param topology - Drawing topology, default is MeshTopology.Triangles
     * @returns Sub-mesh
     */
    addSubMesh(start: number, count: number, topology?: MeshTopology): SubMesh;

    addSubMesh(
        startOrSubMesh: number | SubMesh,
        count?: number,
        topology: MeshTopology = MeshTopology.Triangles
    ): SubMesh {
        if (typeof startOrSubMesh === "number") {
            startOrSubMesh = new SubMesh(startOrSubMesh, count, topology);
        }
        this._subMeshes.push(startOrSubMesh);
        return startOrSubMesh;
    }

    /**
     * Remove sub-mesh.
     * @param subMesh - Sub-mesh needs to be removed
     */
    removeSubMesh(subMesh: SubMesh): void {
        const subMeshes = this._subMeshes;
        const index = subMeshes.indexOf(subMesh);
        if (index !== -1) {
            subMeshes.splice(index, 1);
        }
    }

    /**
     * Clear all sub-mesh.
     */
    clearSubMesh(): void {
        this._subMeshes.length = 0;
    }
}