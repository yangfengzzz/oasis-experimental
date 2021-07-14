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
            let scripts: PhysicScript[] = [];
            this._physicObjectsMap[obj1.getQueryFilterData().word0].entity.getComponents(PhysicScript, scripts);
            if (scripts.length > 0) {
                scripts.forEach(value => {
                    let collision = new Collision(this._physicObjectsMap[obj2.getQueryFilterData().word0].collider);
                    collision.rigidbody = this._physicObjectsMap[obj2.getQueryFilterData().word0];
                    value.onCollisionEnter(collision);
                })
            }

            scripts = [];
            this._physicObjectsMap[obj2.getQueryFilterData().word0].entity.getComponents(PhysicScript, scripts);
            if (scripts.length > 0) {
                scripts.forEach(value => {
                    let collision = new Collision(this._physicObjectsMap[obj1.getQueryFilterData().word0].collider);
                    collision.rigidbody = this._physicObjectsMap[obj1.getQueryFilterData().word0];
                    value.onCollisionEnter(collision);
                })
            }
        },
        onContactEnd: (obj1, obj2) => {
            let scripts: PhysicScript[] = [];
            this._physicObjectsMap[obj1.getQueryFilterData().word0].entity.getComponents(PhysicScript, scripts);
            if (scripts.length > 0) {
                scripts.forEach(value => {
                    let collision = new Collision(this._physicObjectsMap[obj2.getQueryFilterData().word0].collider);
                    collision.rigidbody = this._physicObjectsMap[obj2.getQueryFilterData().word0];
                    value.onCollisionExit(collision);
                })
            }

            scripts = [];
            this._physicObjectsMap[obj2.getQueryFilterData().word0].entity.getComponents(PhysicScript, scripts);
            if (scripts.length > 0) {
                scripts.forEach(value => {
                    let collision = new Collision(this._physicObjectsMap[obj1.getQueryFilterData().word0].collider);
                    collision.rigidbody = this._physicObjectsMap[obj1.getQueryFilterData().word0];
                    value.onCollisionExit(collision);
                })
            }
        },
        onContactPersist: (obj1, obj2) => {
            let scripts: PhysicScript[] = [];
            this._physicObjectsMap[obj1.getQueryFilterData().word0].entity.getComponents(PhysicScript, scripts);
            if (scripts.length > 0) {
                scripts.forEach(value => {
                    let collision = new Collision(this._physicObjectsMap[obj2.getQueryFilterData().word0].collider);
                    collision.rigidbody = this._physicObjectsMap[obj2.getQueryFilterData().word0];
                    value.onCollisionStay(collision);
                })
            }

            scripts = [];
            this._physicObjectsMap[obj2.getQueryFilterData().word0].entity.getComponents(PhysicScript, scripts);
            if (scripts.length > 0) {
                scripts.forEach(value => {
                    let collision = new Collision(this._physicObjectsMap[obj1.getQueryFilterData().word0].collider);
                    collision.rigidbody = this._physicObjectsMap[obj1.getQueryFilterData().word0];
                    value.onCollisionStay(collision);
                })
            }
        },
        onTriggerBegin: (obj1, obj2) => {
            let scripts: PhysicScript[] = [];
            this._physicObjectsMap[obj1.getQueryFilterData().word0].entity.getComponents(PhysicScript, scripts);
            if (scripts.length > 0) {
                scripts.forEach(value => {
                    value.onTriggerEnter(this._physicObjectsMap[obj2.getQueryFilterData().word0].collider);
                })
            }
        },
        onTriggerEnd: (obj1, obj2) => {
            let scripts: PhysicScript[] = [];
            this._physicObjectsMap[obj1.getQueryFilterData().word0].entity.getComponents(PhysicScript, scripts);
            if (scripts.length > 0) {
                scripts.forEach(value => {
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