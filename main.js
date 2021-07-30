import * as simulator from "./src/Simulator";
import {onLoad} from "./src/physx.release";

const update = () => {
    simulator.update()
    requestAnimationFrame(update)
}

onLoad(() => {
    simulator.init()

    update()
})

// import * as simulator from "./src/RenderToTexture";