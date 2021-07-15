import {Component, Quaternion, Vector3} from "oasis-engine";
import {Rigidbody} from "./Rigidbody";

export class CharacterController extends Component {
    init(body: Rigidbody) {
        window.addEventListener("keypress", (event) => {
            switch (event.code) {
                case 'KeyW': {
                    const new_pos = new Vector3(this.entity.transform.position.x - 1,
                        this.entity.transform.position.y, this.entity.transform.position.z);
                    this.entity.transform.position = new_pos;
                    body.MovePosition(new_pos);
                    console.log("move forward!")
                    break;
                }
                case 'KeyS': {
                    const new_pos = new Vector3(this.entity.transform.position.x + 1,
                        this.entity.transform.position.y, this.entity.transform.position.z);
                    this.entity.transform.position = new_pos;
                    body.MovePosition(new_pos);
                    console.log("move backward!")
                    break;
                }
                case 'KeyA': {
                    const new_pos = new Vector3(this.entity.transform.position.x,
                        this.entity.transform.position.y, this.entity.transform.position.z + 1);
                    this.entity.transform.position = new_pos;
                    body.MovePosition(new_pos);
                    console.log("move left!")
                    break;
                }
                case 'KeyD': {
                    const new_pos = new Vector3(this.entity.transform.position.x,
                        this.entity.transform.position.y, this.entity.transform.position.z - 1);
                    this.entity.transform.position = new_pos;
                    body.MovePosition(new_pos);
                    console.log("move right!")
                    break;
                }
            }
        })
    }
}