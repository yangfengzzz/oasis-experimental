import {Script} from "oasis-engine";

export class PhysicScript extends Script {
    onCollisionEnter(): void {
        console.log("onCollisionEnter");
    }

    onCollisionExit(): void {
        console.log("onCollisionExit");
    }

    onCollisionStay(): void {
        console.log("onCollisionStay");
    }

    onTriggerEnter(): void {
        console.log("onTriggerEnter");
    }

    onTriggerExit(): void {
        console.log("onTriggerExit");
    }

    onTriggerStay(): void {
        console.log("onTriggerStay");
    }
}