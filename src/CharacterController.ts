import {
    PHYSX as PhysX,
    physics as PhysicsSystem,
} from "./physx.release";
import {Component, Vector3} from "oasis-engine";
import {PhysicManager} from "./PhysicManager";
import {PhysicMaterial} from "./PhysicMaterial";

export class CharacterController extends Component {
    private _group_id: number;
    position: Vector3;

    _PxControllerManager: any;
    _PxController: any;

    get group_id(): number {
        return this._group_id;
    }

    update() {
        this._PxController.setPosition({x: this.position.x, y: this.position.y, z: this.position.z})
        this.entity.transform.position = this.position;
    }

    init(scene: PhysicManager, group_id: number) {
        this._PxControllerManager = PhysX.PxCreateControllerManager(scene.get(), false);

        this._group_id = group_id;
        const data = new PhysX.PxFilterData(group_id, 0, 0, 0);

        const controllerDesc = new PhysX.PxCapsuleControllerDesc();
        controllerDesc.radius = 1.25;
        controllerDesc.height = 10;
        controllerDesc.setMaterial(new PhysicMaterial(0.1, 0.1, 0.1).create());
        this._PxController = this._PxControllerManager.createController(controllerDesc);
        this._PxController.setQueryFilterData(data);

        this.position = new Vector3(this.entity.transform.position.x,
            this.entity.transform.position.y, this.entity.transform.position.z);
        window.addEventListener("keypress", (event) => {
            switch (event.code) {
                case 'KeyW': {
                    this.position.x -= 0.3;
                    break;
                }
                case 'KeyS': {
                    this.position.x += 0.3;
                    break;
                }
                case 'KeyA': {
                    this.position.z += 0.3;
                    break;
                }
                case 'KeyD': {
                    this.position.z -= 0.3;
                    break;
                }
            }
        })
    }
}