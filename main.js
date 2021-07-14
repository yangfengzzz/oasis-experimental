import * as simulator from "./src/simulator";
import {
    onLoad as PhysicsOnLoad,
} from "./src/physx.release";

const update = () => {
    simulator.update()
    requestAnimationFrame(update)
}

PhysicsOnLoad(() => {
    simulator.init()

    update()
})