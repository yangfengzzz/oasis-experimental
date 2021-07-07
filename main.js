import * as renderer from "./src/renderer";
import * as physics from "./src/physx.release";
import {makeEntities} from './src/entities'

const entities = makeEntities()

const update = () => {
    physics.update(entities)
    renderer.update(entities)
    renderer.engine.run()

    // if (tick >= 200) return // DEBUG: only run a few ticks then stop
    requestAnimationFrame(update)
}

physics.onLoad(() => {
    physics.init(entities)
    renderer.init(entities)
    update()
})