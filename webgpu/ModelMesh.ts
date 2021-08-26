import {Mesh} from "./Mesh";
import { Color, Vector2, Vector3, Vector4 } from "@oasis-engine/math";
import {IndexFormat} from "oasis-engine";

/**
 * Mesh containing common vertex elements of the model.
 */
export class ModelMesh extends Mesh {
    private _vertexCount: number = 0;
    private _accessible: boolean = true;
    private _verticesFloat32: Float32Array | null = null;
    private _verticesUint8: Uint8Array | null = null;
    private _indices: Uint8Array | Uint16Array | Uint32Array | null = null;
    private _indicesFormat: IndexFormat = null;
    private _vertexSlotChanged: boolean = true;
    private _vertexChangeFlag: number = 0;
    private _indicesChangeFlag: boolean = false;

    private _positions: Vector3[] = [];
    private _normals: Vector3[] | null = null;
    private _uv: Vector2[] | null = null;
    private _uv1: Vector2[] | null = null;
    private _uv2: Vector2[] | null = null;
    private _uv3: Vector2[] | null = null;
    private _uv4: Vector2[] | null = null;
    private _uv5: Vector2[] | null = null;
    private _uv6: Vector2[] | null = null;
    private _uv7: Vector2[] | null = null;

    /**
     * Set positions for the mesh.
     * @param positions - The positions for the mesh.
     */
    setPositions(positions: Vector3[]): void {
        if (!this._accessible) {
            throw "Not allowed to access data while accessible is false.";
        }

        const count = positions.length;
        this._positions = positions;
        this._vertexChangeFlag |= ValueChanged.Position;

        if (this._vertexCount !== count) {
            this._vertexCount = count;
        }
    }

    /**
     * Get positions for the mesh.
     * @remarks Please call the setPositions() method after modification to ensure that the modification takes effect.
     */
    getPositions(): Vector3[] | null {
        if (!this._accessible) {
            throw "Not allowed to access data while accessible is false.";
        }

        return this._positions;
    }

    /**
     * Set per-vertex normals for the mesh.
     * @param normals - The normals for the mesh.
     */
    setNormals(normals: Vector3[] | null): void {
        if (!this._accessible) {
            throw "Not allowed to access data while accessible is false.";
        }

        if (normals.length !== this._vertexCount) {
            throw "The array provided needs to be the same size as vertex count.";
        }

        this._vertexSlotChanged = !!this._normals !== !!normals;
        this._vertexChangeFlag |= ValueChanged.Normal;
        this._normals = normals;
    }

    /**
     * Get normals for the mesh.
     * @remarks Please call the setNormals() method after modification to ensure that the modification takes effect.
     */
    getNormals(): Vector3[] | null {
        if (!this._accessible) {
            throw "Not allowed to access data while accessible is false.";
        }
        return this._normals;
    }

    /**
     * Set per-vertex uv for the mesh.
     * @param uv - The uv for the mesh.
     */
    setUVs(uv: Vector2[] | null): void;
    /**
     * Set per-vertex uv for the mesh by channelIndex.
     * @param uv - The uv for the mesh.
     * @param channelIndex - The index of uv channels, in [0 ~ 7] range.
     */
    setUVs(uv: Vector2[] | null, channelIndex: number): void;
    setUVs(uv: Vector2[] | null, channelIndex?: number): void {
        if (!this._accessible) {
            throw "Not allowed to access data while accessible is false.";
        }

        if (uv.length !== this._vertexCount) {
            throw "The array provided needs to be the same size as vertex count.";
        }

        channelIndex = channelIndex ?? 0;
        switch (channelIndex) {
            case 0:
                this._vertexSlotChanged = !!this._uv !== !!uv;
                this._vertexChangeFlag |= ValueChanged.UV;
                this._uv = uv;
                break;
            case 1:
                this._vertexSlotChanged = !!this._uv1 !== !!uv;
                this._vertexChangeFlag |= ValueChanged.UV1;
                this._uv1 = uv;
                break;
            case 2:
                this._vertexSlotChanged = !!this._uv2 !== !!uv;
                this._vertexChangeFlag |= ValueChanged.UV2;
                this._uv2 = uv;
                break;
            case 3:
                this._vertexSlotChanged = !!this._uv3 !== !!uv;
                this._vertexChangeFlag |= ValueChanged.UV3;
                this._uv3 = uv;
                break;
            case 4:
                this._vertexSlotChanged = !!this._uv4 !== !!uv;
                this._vertexChangeFlag |= ValueChanged.UV4;
                this._uv4 = uv;
                break;
            case 5:
                this._vertexSlotChanged = !!this._uv5 !== !!uv;
                this._vertexChangeFlag |= ValueChanged.UV5;
                this._uv5 = uv;
                break;
            case 6:
                this._vertexSlotChanged = !!this._uv6 !== !!uv;
                this._vertexChangeFlag |= ValueChanged.UV6;
                this._uv6 = uv;
                break;
            case 7:
                this._vertexSlotChanged = !!this._uv7 !== !!uv;
                this._vertexChangeFlag |= ValueChanged.UV7;
                this._uv7 = uv;
                break;
            default:
                throw "The index of channel needs to be in range [0 - 7].";
        }
    }

    /**
     * Get uv for the mesh.
     * @remarks Please call the setUV() method after modification to ensure that the modification takes effect.
     */
    getUVs(): Vector2[] | null;
    /**
     * Get uv for the mesh by channelIndex.
     * @param channelIndex - The index of uv channels, in [0 ~ 7] range.
     * @remarks Please call the setUV() method after modification to ensure that the modification takes effect.
     */
    getUVs(channelIndex: number): Vector2[] | null;
    getUVs(channelIndex?: number): Vector2[] | null {
        if (!this._accessible) {
            throw "Not allowed to access data while accessible is false.";
        }
        channelIndex = channelIndex ?? 0;
        switch (channelIndex) {
            case 0:
                return this._uv;
            case 1:
                return this._uv1;
            case 2:
                return this._uv2;
            case 3:
                return this._uv3;
            case 4:
                return this._uv4;
            case 5:
                return this._uv5;
            case 6:
                return this._uv6;
            case 7:
                return this._uv7;
        }
        throw "The index of channel needs to be in range [0 - 7].";
    }

    /**
     * Set indices for the mesh.
     * @param indices - The indices for the mesh.
     */
    setIndices(indices: Uint8Array | Uint16Array | Uint32Array): void {
        if (!this._accessible) {
            throw "Not allowed to access data while accessible is false.";
        }

        if (this._indices !== indices) {
            this._indices = indices;
            if (indices instanceof Uint8Array) {
                this._indicesFormat = IndexFormat.UInt8;
            } else if (indices instanceof Uint16Array) {
                this._indicesFormat = IndexFormat.UInt16;
            } else if (indices instanceof Uint32Array) {
                this._indicesFormat = IndexFormat.UInt32;
            }
        }

        this._indicesChangeFlag = true;
    }

    /**
     * Get indices for the mesh.
     */
    getIndices(): Uint8Array | Uint16Array | Uint32Array {
        return this._indices;
    }
}

enum ValueChanged {
    Position = 0x1,
    Normal = 0x2,
    Color = 0x4,
    Tangent = 0x8,
    BoneWeight = 0x10,
    BoneIndex = 0x20,
    UV = 0x40,
    UV1 = 0x80,
    UV2 = 0x100,
    UV3 = 0x200,
    UV4 = 0x400,
    UV5 = 0x800,
    UV6 = 0x1000,
    UV7 = 0x2000,
    BlendShape = 0x4000,
    All = 0xffff
}