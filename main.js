import * as simulator from "./src/simulator";
import {
    onLoad as PhysicsOnLoad,
} from "./src/physx.release";
import {PhysicManager} from "./src/physicManager";
import {Quaternion, Vector3} from "oasis-engine";

const physic_scene = new PhysicManager();

//----------------------------------------------------------------------------------------------------------------------
const update = () => {
    simulator.update(physic_scene)
    requestAnimationFrame(update)
}

PhysicsOnLoad(() => {
    window.addEventListener("keydown", (event) => {
        switch (event.key) {
            case 'Enter':
                simulator.addSphere(true, 0.5, new Vector3(
                    Math.floor(Math.random() * 6) - 2.5,
                    5,
                    Math.floor(Math.random() * 6) - 2.5,
                ), new Quaternion(0, 0, 0.3, 0.7), physic_scene);
                break;
        }
    })

    physic_scene.init();
    simulator.init(physic_scene)

    update()
})