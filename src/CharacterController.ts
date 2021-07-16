import {
    PHYSX as PhysX,
} from "./physx.release";
import {Component, Entity, Vector3} from "oasis-engine";
import {PhysicManager} from "./PhysicManager";
import {PhysicMaterial} from "./PhysicMaterial";

enum ControllerCollisionFlag {
    COLLISION_SIDES = 1 << 0,
    COLLISION_UP = 1 << 1,
    COLLISION_DOWN = 1 << 2,
}

export class CharacterController extends Component {
    private _group_id: number;

    _PxControllerManager: any;
    _PxController: any;

    get group_id(): number {
        return this._group_id;
    }

    queryFilterCallback = {
        postFilter: (filterData, hit) => {

        },

        preFilter: (filterData, shape, actor) => {

        }
    }

    PHYSXPxQueryFilterCallbackInstance = PhysX.PxQueryFilterCallback.implement(
        this.queryFilterCallback
    )

    _PxControllerFilters = new PhysX.PxControllerFilters(
        null,
        null,
        null);

    update() {
        const pos = this._PxController.getPosition();
        this.entity.transform.position = new Vector3(pos.x, pos.y, pos.z);
    }

    init(scene: PhysicManager, camera: Entity, group_id: number, radius: number, height: number) {
        this._PxControllerManager = PhysX.PxCreateControllerManager(scene.get(), false);

        this._group_id = group_id;
        const data = new PhysX.PxFilterData(group_id, 0, 0, 0);

        const controllerDesc = new PhysX.PxCapsuleControllerDesc();
        controllerDesc.radius = radius * 1.3; // maybe because of skin.
        controllerDesc.height = height;
        controllerDesc.setMaterial(new PhysicMaterial(0.1, 0.1, 0.1).create());
        this._PxController = this._PxControllerManager.createController(controllerDesc);
        this._PxController.setQueryFilterData(data);
        this._PxController.setPosition({
            x: this.entity.transform.position.x,
            y: this.entity.transform.position.y,
            z: this.entity.transform.position.z
        })

        window.addEventListener("keypress", (event) => {
            let forward = new Vector3();
            Vector3.subtract(this.entity.transform.position, camera.transform.position, forward);
            forward.y = 0;
            forward = forward.normalize();
            let cross = new Vector3(forward.z, 0, -forward.x);

            switch (event.code) {
                case 'KeyW': {
                    this._PxController.move({
                        x: forward.x,
                        y: forward.y,
                        z: forward.z
                    }, 0.1, 0.1, this._PxControllerFilters, null)
                    break;
                }
                case 'KeyS': {
                    this._PxController.move({
                        x: -forward.x,
                        y: -forward.y,
                        z: -forward.z
                    }, 0.1, 0.1, this._PxControllerFilters, null)
                    break;
                }
                case 'KeyA': {
                    this._PxController.move({
                        x: cross.x,
                        y: cross.y,
                        z: cross.z
                    }, 0.1, 0.1, this._PxControllerFilters, null)
                    break;
                }
                case 'KeyD': {
                    this._PxController.move({
                        x: -cross.x,
                        y: -cross.y,
                        z: -cross.z
                    }, 0.1, 0.1, this._PxControllerFilters, null)
                    break;
                }
                case 'Space' : {
                    this._PxController.move({x: 0, y: -1, z: 0}, 0.1, 0.1, this._PxControllerFilters, null)
                }
            }
        })
    }
}