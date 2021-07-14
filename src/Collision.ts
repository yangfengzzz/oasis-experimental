import {Collider} from "./Collider";

export class Collision {
    public readonly collider: Collider;

    constructor(collider: Collider) {
        this.collider = collider;
    }
}