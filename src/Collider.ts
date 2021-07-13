import {Component, Vector3} from "oasis-engine";
import {PhysicMaterial} from "./PhysicMaterial";
import {
    PHYSX as PhysX,
    physics as PhysicsSystem,
} from "./physx.release";

export class Collider {
    protected _center: Vector3 = new Vector3();
    protected _is_dirty: boolean = true;

    protected _pxShape: any;
    protected flags: any = new PhysX.PxShapeFlags(
        PhysX.PxShapeFlag.eSCENE_QUERY_SHAPE.value |
        PhysX.PxShapeFlag.eSIMULATION_SHAPE.value
    )

    protected _material: PhysicMaterial;

    get center(): Vector3 {
        return this._center;
    }

    set center(value: Vector3) {
        this._center = value;
        this._is_dirty = true;
    }
}