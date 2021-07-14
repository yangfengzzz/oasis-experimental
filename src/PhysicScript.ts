import {Script} from "oasis-engine";
import {Collider} from "./Collider";
import {Collision} from "./Collision";

export class PhysicScript extends Script {
    onCollisionEnter(other: Collision): void {
        console.log("onCollisionEnter");
    }

    onCollisionExit(other: Collision): void {
        console.log("onCollisionExit");
    }

    onCollisionStay(other: Collision): void {
        console.log("onCollisionStay");
    }

    onTriggerEnter(other: Collider): void {
        console.log("onTriggerEnter");
    }

    onTriggerExit(other: Collider): void {
        console.log("onTriggerExit");
    }

    onTriggerStay(other: Collider): void {
        console.log("onTriggerStay");
    }
}