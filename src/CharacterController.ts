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
    displacement: Vector3 = new Vector3;
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

    _PxControllerFilters: any;

    update() {
        let flag = this._PxController.move({
            x: this.displacement.x,
            y: this.displacement.y,
            z: this.displacement.z
        }, 0.1, 0.1, this._PxControllerFilters, null)
        this.displacement = new Vector3();
        if (!flag.isSet(PhysX.PxControllerCollisionFlag.eCOLLISION_DOWN)) {
            this._PxController.move({x: 0, y: -0.2, z: 0}, 0.1, 0.1, this._PxControllerFilters, null)
        }

        const pos = this._PxController.getPosition();
        this.entity.transform.position = new Vector3(pos.x, pos.y, pos.z);
    }

    init(scene: PhysicManager, camera: Entity, group_id: number, radius: number, height: number) {
        const PHYSXPxQueryFilterCallbackInstance = PhysX.PxQueryFilterCallback.implement(
            this.queryFilterCallback
        );
        this._PxControllerFilters = new PhysX.PxControllerFilters(
            new PhysX.PxFilterData(0, 0, 0, 0),
            null,
            null);

        this._PxControllerManager = PhysX.PxCreateControllerManager(scene.get(), false);

        this._group_id = group_id;
        const data = new PhysX.PxFilterData(group_id, 0, 0, 0);

        const controllerDesc = new PhysX.PxCapsuleControllerDesc();
        controllerDesc.radius = radius; // maybe because of skin.
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
                    this.displacement = forward.scale(0.3);
                    break;
                }
                case 'KeyS': {
                    this.displacement = forward.negate().scale(0.3);
                    break;
                }
                case 'KeyA': {
                    this.displacement = cross.scale(0.3);
                    break;
                }
                case 'KeyD': {
                    this.displacement = cross.negate().scale(0.3);
                    break;
                }
                case 'Space' : {
                    this.displacement = new Vector3(0, 2, 0);
                    break;
                }
            }
        })
    }
}