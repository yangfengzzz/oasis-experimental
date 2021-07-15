import {Component, Quaternion, Vector3} from "oasis-engine";
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
                    this.position.x -= 1;
                    console.log("move forward!")
                    break;
                }
                case 'KeyS': {
                    this.position.x += 1;
                    console.log("move backward!")
                    break;
                }
                case 'KeyA': {
                    this.position.z += 1;
                    console.log("move left!")
                    break;
                }
                case 'KeyD': {
                    this.position.z -= 1;
                    console.log("move right!")
                    break;
                }
            }
        })
    }

    update() {
        this.body.MovePosition(this.position);
        this.entity.transform.position = this.position;
    }
}