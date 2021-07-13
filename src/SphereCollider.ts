import {
    PHYSX as PhysX,
    physics as PhysicsSystem,
} from "./physx.release";
import {Collider} from "./Collider";
import {Vector3} from "oasis-engine";
import {PhysicMaterial} from "./PhysicMaterial";

export class SphereCollider extends Collider {
    private _radius: number = 0.0;
    private _pxGeometry: any;

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
            this._pxShape = PhysicsSystem.createShape(this._pxGeometry, mat.create(), false, this.flags);

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

        return this._pxShape;
    }
}