import {
    PHYSX as PhysX,
    physics as PhysicsSystem,
} from "./physx.release";

export class Rigidbody {
    private _angularDrag: number

    get angularDrag(): number {
        return this._angularDrag;
    }

    set angularDrag(value: number) {
        this._angularDrag = value;
    }
}