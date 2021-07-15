import {
    PHYSX as PhysX,
    physics as PhysicsSystem,
} from "./physx.release";
import {Component, Vector3} from "oasis-engine";
import {PhysicManager} from "./PhysicManager";
import {PhysicMaterial} from "./PhysicMaterial";

export class CharacterController extends Component {
    position: Vector3;

    _PxControllerManager: any;
    _PxController: any;

    update() {
        this._PxController.setPosition({x: this.position.x, y: this.position.y, z: this.position.z})
        this.entity.transform.position = this.position;
    }

    initManager(scene: PhysicManager) {
        this._PxControllerManager = PhysX.PxCreateControllerManager(scene.get(), false);
    }

    createCapsuleController() {
        const controllerDesc = new PhysX.PxCapsuleControllerDesc();
        controllerDesc.radius = 1.25;
        controllerDesc.height = 10;
        controllerDesc.setMaterial(new PhysicMaterial(0.1, 0.1, 0.1).create());
        this._PxController = this._PxControllerManager.createController(controllerDesc);

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