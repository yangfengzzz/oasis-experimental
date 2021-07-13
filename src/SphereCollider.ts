import {
    PHYSX as PhysX,
    physics as PhysicsSystem,
} from "./physx.release";
import {Collider} from "./Collider";
import {Vector3} from "oasis-engine";
import {PhysicMaterial} from "./PhysicMaterial";

export class SphereCollider extends Collider {
    private _center: Vector3 = new Vector3();
    private _radius: number = 0.0;

    private _is_dirty: boolean = true;

    private _pxShape: any;
    private _pxGeometry: any;
    private flags: any = new PhysX.PxShapeFlags(
        PhysX.PxShapeFlag.eSCENE_QUERY_SHAPE.value |
        PhysX.PxShapeFlag.eSIMULATION_SHAPE.value
    )

    get center(): Vector3 {
        return this._center;
    }

    set center(value: Vector3) {
        this._center = value;
        this._is_dirty = true;
    }

    get radius(): number {
        return this._radius;
    }

    set radius(value: number) {
        this._radius = value;
        this._is_dirty = true;
    }

    create(mat: PhysicMaterial): any {
        if (this._is_dirty) {
            this._pxGeometry = new PhysX.PxSphereGeometry(this._radius);
            this._pxShape = PhysicsSystem.createShape(this._pxGeometry, mat.create(), false, this.flags)
            this._is_dirty = false;
        }

        return this._pxShape;
    }
}