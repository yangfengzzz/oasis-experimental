import * as renderer from "./src/renderer";
import {
    PHYSX as PhysX,
    scene as PhysicsScene,
    physics as PhysicsSystem,
    onLoad as PhysicsOnLoad
} from "./src/physx.release";
import {makeEntities} from './src/entities'

let bodies = {}
const entities = makeEntities()

export const init_physics = entities => {
    entities.forEach(entity => {
        add_physics(entity)
    })
}

export const add_physics = entity => {
    let geometry
    if (entity.body.type === 'box') {
        geometry = new PhysX.PxBoxGeometry(
            // PHYSX uses half-extents
            entity.body.size[0] / 2,
            entity.body.size[1] / 2,
            entity.body.size[2] / 2
        )
    } else if (entity.body.type === 'sphere') {
        geometry = new PhysX.PxSphereGeometry(entity.body.size[0])
    }

    const material = PhysicsSystem.createMaterial(0.8, 0.8, 0.8)
    console.log("lalala")
    const flags = new PhysX.PxShapeFlags(
        PhysX.PxShapeFlag.eSCENE_QUERY_SHAPE.value |
        PhysX.PxShapeFlag.eSIMULATION_SHAPE.value
    )

    const shape = PhysicsSystem.createShape(geometry, material, false, flags)
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
    body.attachShape(shape)
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