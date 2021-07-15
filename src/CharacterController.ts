import {Component, Vector3} from "oasis-engine";
import {Rigidbody} from "./Rigidbody";

export class CharacterController extends Component {
    position: Vector3;
    body: Rigidbody;

    init(body: Rigidbody) {
        this.position = new Vector3(this.entity.transform.position.x,
            this.entity.transform.position.y, this.entity.transform.position.z);
        this.body = body;
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

    update() {
        this.body.MovePosition(this.position);
    }
}