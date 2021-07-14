import {
    PHYSX as PhysX,
    physics as PhysicsSystem,
} from "./physx.release";
import {Rigidbody} from "./Rigidbody";
import {PhysicScript} from "./PhysicScript";
import {Collision} from "./Collision";

export class PhysicManager {
    triggerCallback = {
        onContactBegin: (obj1, obj2) => {
            let script: PhysicScript[] = [];
            this._physicObjectsMap[obj1.getQueryFilterData().word0].entity.getComponents(PhysicScript, script);
            if (script.length > 0) {
                script.forEach(value => {
                    value.onCollisionEnter(new Collision(this._physicObjectsMap[obj1.getQueryFilterData().word0].collider));
                })
            }

            script = [];
            this._physicObjectsMap[obj2.getQueryFilterData().word0].entity.getComponents(PhysicScript, script);
            if (script.length > 0) {
                script.forEach(value => {
                    value.onCollisionEnter(new Collision(this._physicObjectsMap[obj2.getQueryFilterData().word0].collider));
                })
            }
        },
        onContactEnd: (obj1, obj2) => {
            let script: PhysicScript[] = [];
            this._physicObjectsMap[obj1.getQueryFilterData().word0].entity.getComponents(PhysicScript, script);
            if (script.length > 0) {
                script.forEach(value => {
                    value.onCollisionExit(new Collision(this._physicObjectsMap[obj1.getQueryFilterData().word0].collider));
                })
            }

            script = [];
            this._physicObjectsMap[obj2.getQueryFilterData().word0].entity.getComponents(PhysicScript, script);
            if (script.length > 0) {
                script.forEach(value => {
                    value.onCollisionExit(new Collision(this._physicObjectsMap[obj2.getQueryFilterData().word0].collider));
                })
            }
        },
        onContactPersist: (obj1, obj2) => {
            let script: PhysicScript[] = [];
            this._physicObjectsMap[obj1.getQueryFilterData().word0].entity.getComponents(PhysicScript, script);
            if (script.length > 0) {
                script.forEach(value => {
                    value.onCollisionStay(new Collision(this._physicObjectsMap[obj1.getQueryFilterData().word0].collider));
                })
            }

            script = [];
            this._physicObjectsMap[obj2.getQueryFilterData().word0].entity.getComponents(PhysicScript, script);
            if (script.length > 0) {
                script.forEach(value => {
                    value.onCollisionStay(new Collision(this._physicObjectsMap[obj2.getQueryFilterData().word0].collider));
                })
            }
        },
        onTriggerBegin: (obj1, obj2) => {
            let script: PhysicScript[] = [];
            this._physicObjectsMap[obj1.getQueryFilterData().word0].entity.getComponents(PhysicScript, script);
            if (script.length > 0) {
                script.forEach(value => {
                    value.onTriggerEnter(this._physicObjectsMap[obj1.getQueryFilterData().word0].collider);
                })
            }

            script = [];
            this._physicObjectsMap[obj2.getQueryFilterData().word0].entity.getComponents(PhysicScript, script);
            if (script.length > 0) {
                script.forEach(value => {
                    value.onTriggerEnter(this._physicObjectsMap[obj2.getQueryFilterData().word0].collider);
                })
            }
        },
        onTriggerEnd: (obj1, obj2) => {
            let script: PhysicScript[] = [];
            this._physicObjectsMap[obj1.getQueryFilterData().word0].entity.getComponents(PhysicScript, script);
            if (script.length > 0) {
                script.forEach(value => {
                    value.onTriggerExit(this._physicObjectsMap[obj1.getQueryFilterData().word0].collider);
                })
            }

            script = [];
            this._physicObjectsMap[obj2.getQueryFilterData().word0].entity.getComponents(PhysicScript, script);
            if (script.length > 0) {
                script.forEach(value => {
                    value.onTriggerExit(this._physicObjectsMap[obj2.getQueryFilterData().word0].collider);
                })
            }
        },
    }

    //------------------------------------------------------------------------------------------------------------------
    _physicObjectsMap: any = {};
    _PxScene: any;

    addActor(actor: Rigidbody) {
        this._physicObjectsMap[actor.collider.group_id] = actor;
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