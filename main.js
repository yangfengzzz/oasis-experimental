import * as renderer from "./src/renderer";
import {
    scene as PhysicsScene,
    onLoad as PhysicsOnLoad
} from "./src/physx.release";
import {makeEntities} from './src/entities'
import {SphereCollider} from "./src/SphereCollider";
import {BoxCollider} from "./src/BoxCollider";
import {Quaternion, Vector3} from "oasis-engine";
import {PhysicCombineMode} from "./src/PhysicMaterial";
import {Rigidbody} from "./src/Rigidbody";

let bodies = {}
const entities = makeEntities()

export const init_physics = entities => {
    entities.forEach(entity => {
        add_physics(entity)
    })
}

export const add_physics = entity => {
    let shape
    if (entity.body.type === 'box') {
        shape = new BoxCollider();
        shape.size = entity.body.size;
        shape.material.staticFriction = 0.1;
        shape.material.dynamicFriction = 0.2;
        shape.material.bounciness = 0.1;
    } else if (entity.body.type === 'sphere') {
        shape = new SphereCollider();
        shape.radius = entity.body.size.x;
        shape.material.staticFriction = 0.1;
        shape.material.dynamicFriction = 0.2;
        shape.material.bounciness = 2;
        shape.material.bounceCombine = PhysicCombineMode.Minimum;
    }

    const transform = {
        translation: {
            x: entity.transform.position.x,
            y: entity.transform.position.y,
            z: entity.transform.position.z,
        },
        rotation: {
            w: entity.transform.rotation.w, // PHYSX uses WXYZ quaternions,
            x: entity.transform.rotation.x,
            y: entity.transform.rotation.y,
            z: entity.transform.rotation.z,
        },
    }

    let rigid_body = new Rigidbody();
    rigid_body.init(entity.body.dynamic, entity.transform.position, entity.transform.rotation);
    rigid_body.freezeRotation = false;
    rigid_body.get().attachShape(shape.create())
    bodies[entity.id] = rigid_body.get()
    PhysicsScene.addActor(rigid_body.get(), null)
}

export const update_physics = entities => {
    PhysicsScene.simulate(1 / 60, true)
    PhysicsScene.fetchResults(true)
    entities.forEach(entity => {
        const body = bodies[entity.id]
        const transform = body.getGlobalPose()
        entity.transform.position.x = transform.translation.x
        entity.transform.position.y = transform.translation.y
        entity.transform.position.z = transform.translation.z
        entity.transform.rotation.x = transform.rotation.x
        entity.transform.rotation.y = transform.rotation.y
        entity.transform.rotation.z = transform.rotation.z
        entity.transform.rotation.w = transform.rotation.w
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