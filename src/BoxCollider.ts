import {Collider} from "./Collider";
import {Vector3} from "oasis-engine";

export class BoxCollider extends Collider {
    center: Vector3 = new Vector3(0, 0, 0);
    size: Vector3 = new Vector3(0, 0, 0);
}