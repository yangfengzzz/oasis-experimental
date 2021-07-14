import {Component, Vector3} from "oasis-engine";
import {PhysicMaterial} from "./PhysicMaterial";
import {
    PHYSX as PhysX,
} from "./physx.release";

export class Collider extends Component {
    protected _group_id: number;

    protected _center: Vector3 = new Vector3();
    protected _is_dirty: boolean = true;

    protected _pxShape: any;
    protected _flags: any = new PhysX.PxShapeFlags(
        PhysX.PxShapeFlag.eSCENE_QUERY_SHAPE.value |
        PhysX.PxShapeFlag.eSIMULATION_SHAPE.value
    )

    protected _material: PhysicMaterial = new PhysicMaterial(0.1, 0.1, 0.1);

    get center(): Vector3 {
        return this._center;
    }

    set center(value: Vector3) {
        this._center = value;
        this._is_dirty = true;
    }

    get material(): PhysicMaterial {
        this._is_dirty = true;
        return this._material;
    }

    set material(value: PhysicMaterial) {
        this._material = value;
        this._is_dirty = true;
    }

    get group_id(): number {
        return this._group_id;
    }

    get(): any {
        return this._pxShape;
    }
}