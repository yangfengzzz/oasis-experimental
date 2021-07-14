import * as simulator from "./src/simulator";
import {
    onLoad as PhysicsOnLoad,
} from "./src/physx.release";
import {PhysicManager} from "./src/physicManager";
import {makeEntities} from './src/entities'
import {Quaternion, Vector3} from "oasis-engine";

const entities = makeEntities()
const physic_scene = new PhysicManager();

//----------------------------------------------------------------------------------------------------------------------
const update = () => {
    simulator.update(entities, physic_scene)
    requestAnimationFrame(update)
}

PhysicsOnLoad(() => {
    window.addEventListener("keydown", (event) => {
        switch (event.key) {
            case 'Enter':
                const entity = {
                    id: ++entities.length,
                    transform: {
                        position: new Vector3(
                            Math.floor(Math.random() * 6) - 2.5,
                            5,
                            Math.floor(Math.random() * 6) - 2.5,
                        ),
                        rotation: new Quaternion(0, 0, 0.3, 0.7),
                    },
                    model: {
                        type: 'sphere',
                        size: new Vector3(0.5, 1, 1),
                    },
                    body: {
                        type: 'sphere',
                        size: new Vector3(0.5, 1, 1),
                        dynamic: true,
                    },
                }
                // add_physics(entity)
                simulator.add(entity, physic_scene)
                entities.push(entity)
                break;
        }
    })

    physic_scene.init();
    simulator.init(entities, physic_scene)

    update()
})