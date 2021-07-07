import * as renderer from "./src/renderer";
import * as physics from "./src/physx.release";
import {makeEntities} from './src/entities'

const entities = makeEntities()

const update = () => {
    physics.update(entities)
    renderer.update(entities)
    renderer.engine.update()

    // if (tick >= 200) return // DEBUG: only run a few ticks then stop
    requestAnimationFrame(update)
}

physics.onLoad(() => {
    window.addEventListener("keydown", (event) => {
        switch (event.key) {
            case 'Enter':
                const entity = {
                    id: ++entities.length,
                    transform: {
                        position: [
                            Math.floor(Math.random() * 6) - 2.5,
                            5,
                            Math.floor(Math.random() * 6) -2.5,
                        ],
                        rotation: [0, 0, 0.3, 0.7],
                    },
                    model: {
                        type: 'sphere',
                        size: [0.5, 1, 1],
                    },
                    body: {
                        type: 'sphere',
                        size: [0.5, 1, 1],
                        dynamic: true,
                    },
                }
                physics.add(entity)
                renderer.add(entity)
                entities.push(entity)
                break;
        }
    })

    physics.init(entities)
    renderer.init(entities)
    update()
})