import {
    PHYSX as PhysX,
    physics as PhysicsSystem,
} from "./physx.release";

export class PhysicManager {
    triggerCallback = {
        onContactBegin: (obj1, obj2) => {
            console.log("onContactBegin", obj1.getQueryFilterData().word0, "with ", obj2.getQueryFilterData().word0)
        },
        onContactEnd: (obj1, obj2) => {
            console.log("onContactEnd", obj1.getQueryFilterData().word0, "with ", obj2.getQueryFilterData().word0)
        },
        onContactPersist: (obj1, obj2) => {
            // console.log("onContactPersist", obj1.getQueryFilterData().word0, "with ", obj2.getQueryFilterData().word0)
        },
        onTriggerBegin: (obj1, obj2) => {
            console.log("onTriggerBegin", obj1.getQueryFilterData().word0, "with ", obj2.getQueryFilterData().word0)
        },
        onTriggerEnd: (obj1, obj2) => {
            console.log("onTriggerEnd", obj1.getQueryFilterData().word0, "with ", obj2.getQueryFilterData().word0)
        },
    }

    _PxScene: any;

    init() {
        const PHYSXSimulationCallbackInstance = PhysX.PxSimulationEventCallback.implement(
            this.triggerCallback
        )
        const sceneDesc = PhysX.getDefaultSceneDesc(
            PhysicsSystem.getTolerancesScale(),
            0,
            PHYSXSimulationCallbackInstance
        )
        this._PxScene = PhysicsSystem.createScene(sceneDesc)
    }

    get():any {
        return this._PxScene;
    }
}