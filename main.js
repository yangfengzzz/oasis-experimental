import * as renderer from "./src/renderer";
import {
    PHYSX as PhysX,
    scene as PhysicsScene,
    physics as PhysicsSystem,
    onLoad as PhysicsOnLoad
} from "./src/physx.release";
import {makeEntities} from './src/entities'
import {PhysicCombineMode, PhysicMaterial} from "./src/PhysicMaterial";
import {SphereCollider} from "./src/SphereCollider";
import {BoxCollider} from "./src/BoxCollider";
import {Vector3} from "oasis-engine";

let bodies = {}
const entities = makeEntities()

export const init_physics = entities => {
    entities.forEach(entity => {
        add_physics(entity)
    })
}

export const add_physics = entity => {
    const mat = new PhysicMaterial(0.1, 0.2, 0.5);

    let shape
    let raw_shape;
    if (entity.body.type === 'box') {
        shape = new BoxCollider();
        shape.size = new Vector3(entity.body.size[0], entity.body.size[1], entity.body.size[2]);
        raw_shape = shape.create(mat);
    } else if (entity.body.type === 'sphere') {
        shape = new SphereCollider();
        shape.radius = entity.body.size[0];
        raw_shape = shape.create(mat);
    }

    const transform = {
        translation: {
            x: entity.transform.position[0],
            y: entity.transform.position[1],
            z: entity.transform.position[2],
        },
        rotation: {
            w: entity.transform.rotation[3], // PHYSX uses WXYZ quaternions,
            x: entity.transform.rotation[0],
            y: entity.transform.rotation[1],
            z: entity.transform.rotation[2],
        },
    }

    let body
    if (entity.body.dynamic) {
        body = PhysicsSystem.createRigidDynamic(transform)
    } else {
        body = PhysicsSystem.createRigidStatic(transform)
    }
    body.attachShape(raw_shape)
    bodies[entity.id] = body
    PhysicsScene.addActor(body, null)
}

export const update_physics = entities => {
    PhysicsScene.simulate(1 / 60, true)
    PhysicsScene.fetchResults(true)
    entities.forEach(entity => {
        const body = bodies[entity.id]
        const transform = body.getGlobalPose()
        entity.transform.position[0] = transform.translation.x
        entity.transform.position[1] = transform.translation.y
        entity.transform.position[2] = transform.translation.z
        entity.transform.rotation[0] = transform.rotation.x
        entity.transform.rotation[1] = transform.rotation.y
        entity.transform.rotation[2] = transform.rotation.z
        entity.transform.rotation[3] = transform.rotation.w
    })
}

//----------------------------------------------------------------------------------------------------------------------

const update = () => {
    update_physics(entities)
    renderer.update(entities)
    renderer.engine.update()

    // if (tick >= 200) return // DEBUG: only run a few ticks then stop
    requestAnimationFrame(update)
}

PhysicsOnLoad(() => {
    window.addEventListener("keydown", (event) => {
        switch (event.key) {
            case 'Enter':
                const entity = {
                    id: ++entities.length,
                    transform: {
                        position: [
                            Math.floor(Math.random() * 6) - 2.5,
                            5,
                            Math.floor(Math.random() * 6) - 2.5,
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
                add_physics(entity)
                renderer.add(entity)
                entities.push(entity)
                break;
        }
    })

    init_physics(entities)
    renderer.init(entities)

    update()
})