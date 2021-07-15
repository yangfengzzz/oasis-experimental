import {Component, Quaternion, Vector3} from "oasis-engine";

export class CharacterController extends Component {
    init() {

        window.addEventListener("keypress", (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.entity.transform.position = new Vector3(this.entity.transform.position.x - 1,
                        this.entity.transform.position.y, this.entity.transform.position.z);
                    console.log("move forward!")
                    break;

                case 'KeyS':
                    this.entity.transform.position = new Vector3(this.entity.transform.position.x + 1,
                        this.entity.transform.position.y, this.entity.transform.position.z);
                    console.log("move backward!")
                    break;

                case 'KeyA':
                    this.entity.transform.position = new Vector3(this.entity.transform.position.x,
                        this.entity.transform.position.y, this.entity.transform.position.z + 1);
                    console.log("move left!")
                    break;

                case 'KeyD':
                    this.entity.transform.position = new Vector3(this.entity.transform.position.x,
                        this.entity.transform.position.y, this.entity.transform.position.z - 1);
                    console.log("move right!")
                    break;
            }
        })
    }
}