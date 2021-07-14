import {Collider} from "./Collider";
import {Rigidbody} from "./Rigidbody";

export class Collision {
    /** The Collider we hit */
    public readonly collider: Collider;
    public rigidbody: Rigidbody | undefined;

    constructor(collider: Collider) {
        this.collider = collider;
    }
}