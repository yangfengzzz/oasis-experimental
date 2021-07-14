import {
    PHYSX as PhysX,
    physics as PhysicsSystem,
} from "./physx.release";
import {Rigidbody} from "./Rigidbody";

export class PhysicManager {
    triggerCallback = {
        onContactBegin: (obj1, obj2) => {
            if (this._physicObjectsMap[obj1.getQueryFilterData().word0] != undefined
                && this._physicObjectsMap[obj2.getQueryFilterData().word0] != undefined) {
                console.log("onContactBegin");
            } else {
                console.log("onContactBegin unknown!");
            }
        },
        onContactEnd: (obj1, obj2) => {
            if (this._physicObjectsMap[obj1.getQueryFilterData().word0] != undefined
                && this._physicObjectsMap[obj2.getQueryFilterData().word0] != undefined) {
                console.log("onContactEnd");
            } else {
                console.log("onContactEnd unknown!");
            }
        },
        onContactPersist: (obj1, obj2) => {
            if (this._physicObjectsMap[obj1.getQueryFilterData().word0] != undefined
                && this._physicObjectsMap[obj2.getQueryFilterData().word0] != undefined) {
                console.log("onContactPersist");
            } else {
                console.log("onContactPersist unknown!");
            }
        },
        onTriggerBegin: (obj1, obj2) => {
            if (this._physicObjectsMap[obj1.getQueryFilterData().word0] != undefined
                && this._physicObjectsMap[obj2.getQueryFilterData().word0] != undefined) {
                console.log("onTriggerBegin");
            } else {
                console.log("onTriggerBegin unknown!");
            }
        },
        onTriggerEnd: (obj1, obj2) => {
            if (this._physicObjectsMap[obj1.getQueryFilterData().word0] != undefined
                && this._physicObjectsMap[obj2.getQueryFilterData().word0] != undefined) {
                console.log("onTriggerEnd");
            } else {
                console.log("onTriggerEnd unknown!");
            }
        },
    }

    _physicObjectsMap: any = {};
    _PxScene: any;

    addActor(actor: Rigidbody) {
        this._physicObjectsMap[actor.collider.group_id] = actor.collider;
        if (this._physicObjectsMap[1] == undefined) {
            console.log("find noting");
        }
        this._PxScene.addActor(actor.get(), null);
    }

    simulateAndFetchResult() {
        this._PxScene.simulate(1 / 60, true)
        this._PxScene.fetchResults(true)
    }

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

    get(): any {
        return this._PxScene;
    }
}