import {
    PHYSX as PhysX,
    physics as PhysicsSystem,
} from "./physx.release";
import {Rigidbody} from "./Rigidbody";
import {PhysicScript} from "./PhysicScript";
import {Collision} from "./Collision";
import {Collider} from "./Collider";
import {Vector3} from "oasis-engine";
import {RaycastHit} from "./RaycastHit";

export class PhysicManager {
    triggerCallback = {
        onContactBegin: (obj1, obj2) => {
            let scripts: PhysicScript[] = [];
            this._physicObjectsMap[obj1.getQueryFilterData().word0].entity.getComponents(PhysicScript, scripts);
            if (scripts.length > 0) {
                scripts.forEach(value => {
                    let collision = new Collision(this._physicObjectsMap[obj2.getQueryFilterData().word0]);
                    value.onCollisionEnter(collision);
                })
            }

            scripts = [];
            this._physicObjectsMap[obj2.getQueryFilterData().word0].entity.getComponents(PhysicScript, scripts);
            if (scripts.length > 0) {
                scripts.forEach(value => {
                    let collision = new Collision(this._physicObjectsMap[obj1.getQueryFilterData().word0]);
                    value.onCollisionEnter(collision);
                })
            }
        },
        onContactEnd: (obj1, obj2) => {
            let scripts: PhysicScript[] = [];
            this._physicObjectsMap[obj1.getQueryFilterData().word0].entity.getComponents(PhysicScript, scripts);
            if (scripts.length > 0) {
                scripts.forEach(value => {
                    let collision = new Collision(this._physicObjectsMap[obj2.getQueryFilterData().word0]);
                    value.onCollisionExit(collision);
                })
            }

            scripts = [];
            this._physicObjectsMap[obj2.getQueryFilterData().word0].entity.getComponents(PhysicScript, scripts);
            if (scripts.length > 0) {
                scripts.forEach(value => {
                    let collision = new Collision(this._physicObjectsMap[obj1.getQueryFilterData().word0]);
                    value.onCollisionExit(collision);
                })
            }
        },
        onContactPersist: (obj1, obj2) => {
            let scripts: PhysicScript[] = [];
            this._physicObjectsMap[obj1.getQueryFilterData().word0].entity.getComponents(PhysicScript, scripts);
            if (scripts.length > 0) {
                scripts.forEach(value => {
                    let collision = new Collision(this._physicObjectsMap[obj2.getQueryFilterData().word0]);
                    value.onCollisionStay(collision);
                })
            }

            scripts = [];
            this._physicObjectsMap[obj2.getQueryFilterData().word0].entity.getComponents(PhysicScript, scripts);
            if (scripts.length > 0) {
                scripts.forEach(value => {
                    let collision = new Collision(this._physicObjectsMap[obj1.getQueryFilterData().word0]);
                    value.onCollisionStay(collision);
                })
            }
        },
        onTriggerBegin: (obj1, obj2) => {
            let scripts: PhysicScript[] = [];
            this._physicObjectsMap[obj1.getQueryFilterData().word0].entity.getComponents(PhysicScript, scripts);
            if (scripts.length > 0) {
                scripts.forEach(value => {
                    value.onTriggerEnter(this._physicObjectsMap[obj2.getQueryFilterData().word0]);
                })
            }
        },
        onTriggerEnd: (obj1, obj2) => {
            let scripts: PhysicScript[] = [];
            this._physicObjectsMap[obj1.getQueryFilterData().word0].entity.getComponents(PhysicScript, scripts);
            if (scripts.length > 0) {
                scripts.forEach(value => {
                    value.onTriggerExit(this._physicObjectsMap[obj2.getQueryFilterData().word0]);
                })
            }
        },
    }

    raycastCallback = {
        processTouches: (obj) => {
            const hit = new RaycastHit;
            hit.distance = obj.distance;
            hit.point.x = obj.position.x;
            hit.point.y = obj.position.y;
            hit.point.z = obj.position.z;
            hit.normal.x = obj.normal.x;
            hit.normal.y = obj.normal.y;
            hit.normal.z = obj.normal.z;
            hit.collider = this._physicObjectsMap[obj.getShape().getQueryFilterData().word0];
            this._hits.push(hit);
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    raycastTest(origin: Vector3, direction: Vector3, maxDistance: number): boolean {
        return this._PxScene.raycastAny({x: origin.x, y: origin.y, z: origin.z}, {
            x: direction.x,
            y: direction.y,
            z: direction.z
        }, maxDistance);
    }

    raycast(origin: Vector3, direction: Vector3, maxDistance: number, hit: RaycastHit): boolean {
        const pxRaycastHit: any = new PhysX.PxRaycastHit();
        const result = this._PxScene.raycastSingle({x: origin.x, y: origin.y, z: origin.z}, {
            x: direction.x,
            y: direction.y,
            z: direction.z
        }, maxDistance, pxRaycastHit);

        if (result == false) {
            return;
        }

        hit.distance = pxRaycastHit.distance;
        hit.point = new Vector3(pxRaycastHit.position.x, pxRaycastHit.position.y, pxRaycastHit.position.z);
        hit.normal = new Vector3(pxRaycastHit.normal.x, pxRaycastHit.normal.y, pxRaycastHit.normal.z);
        hit.collider = this._physicObjectsMap[pxRaycastHit.getShape().getQueryFilterData().word0];

        return result;
    }

    raycastAll(origin: Vector3, direction: Vector3, maxDistance: number): boolean {
        const PHYSXRaycastCallbackInstance = PhysX.PxRaycastCallback.implement(
            this.raycastCallback
        )
        this._hits = [];
        return this._PxScene.raycast({x: origin.x, y: origin.y, z: origin.z}, {
            x: direction.x,
            y: direction.y,
            z: direction.z
        }, maxDistance, PHYSXRaycastCallbackInstance);
    }

    //------------------------------------------------------------------------------------------------------------------
    _physicObjectsMap: any = {};
    _hits: RaycastHit[] = [];

    _PxScene: any;

    addDynamicActor(actor: Rigidbody) {
        this._physicObjectsMap[actor.collider.group_id] = actor.collider;
        this._PxScene.addActor(actor.get(), null);
    }

    addStaticActor(actor: Collider) {
        this._physicObjectsMap[actor.group_id] = actor;
        this._PxScene.addActor(actor.staticActor, null);
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