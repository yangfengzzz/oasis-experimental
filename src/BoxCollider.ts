import {
    PHYSX as PhysX,
    physics as PhysicsSystem,
} from "./physx.release";
import {Collider} from "./Collider";
import {Vector3} from "oasis-engine";

export class BoxCollider extends Collider {
    private _size: Vector3 = new Vector3();
    private _pxGeometry: any;

    get size(): Vector3 {
        return this._size;
    }

    set size(value: Vector3) {
        this._size = value;
        this._is_dirty = true;
    }

    init() {
        if (this._is_dirty) {
            this._pxGeometry = new PhysX.PxBoxGeometry(
                // PHYSX uses half-extents
                this._size.x / 2,
                this._size.y / 2,
                this._size.z / 2
            );
            this._pxShape = PhysicsSystem.createShape(this._pxGeometry, this._material.create(), false, this._flags);

            const transform = {
                translation: {
                    x: this._center.x,
                    y: this._center.y,
                    z: this._center.z,
                },
                rotation: {
                    w: 1, x: 0, y: 0, z: 0,
                },
            }
            this._pxShape.setLocalPose(transform);

            this._is_dirty = false;
        }
    }
}