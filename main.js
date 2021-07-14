import * as renderer from "./src/renderer";
import {
    PHYSX as PhysX,
    physics as PhysicsSystem,
    onLoad as PhysicsOnLoad,
} from "./src/physx.release";
import {makeEntities} from './src/entities'
import {SphereCollider} from "./src/SphereCollider";
import {BoxCollider} from "./src/BoxCollider";
import {Quaternion, Vector3} from "oasis-engine";
import {PhysicCombineMode} from "./src/PhysicMaterial";
import {Rigidbody} from "./src/Rigidbody";

let bodies = {}
const entities = makeEntities()

export let PhysicsScene;
const createScene = () => {
    const triggerCallback = {
        onContactBegin: (obj1, obj2) => {
            console.log("onContactBegin", obj1.getQueryFilterData().word0, "with ", obj2.getQueryFilterData().word0)
        },
        onContactEnd: (obj1, obj2) => {
            console.log("onContactEnd", obj1.getQueryFilterData().word0, "with ", obj2.getQueryFilterData().word0)
        },
        onContactPersist: (obj1, obj2) => {
            // console.log("onContactPersist", obj1.getQueryFilterData().word0, "with ", obj2.getQueryFilterData().word0)
        },
        onTriggerBegin: (obj1, obj2) => {
            console.log("onTriggerBegin", obj1.getQueryFilterData().word0, "with ", obj2.getQueryFilterData().word0)
        },
        onTriggerEnd: (obj1, obj2) => {
            console.log("onTriggerEnd", obj1.getQueryFilterData().word0, "with ", obj2.getQueryFilterData().word0)
        },
    }
    const PHYSXSimulationCallbackInstance = PhysX.PxSimulationEventCallback.implement(
        triggerCallback
    )
    const sceneDesc = PhysX.getDefaultSceneDesc(
        PhysicsSystem.getTolerancesScale(),
        0,
        PHYSXSimulationCallbackInstance
    )
    PhysicsScene = PhysicsSystem.createScene(sceneDesc)
}

export const init_physics = entities => {
    createScene();
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
        shape.init();
    } else if (entity.body.type === 'sphere') {
        shape = new SphereCollider();
        shape.radius = entity.body.size.x;
        shape.material.staticFriction = 0.1;
        shape.material.dynamicFriction = 0.2;
        shape.material.bounciness = 2;
        shape.material.bounceCombine = PhysicCombineMode.Minimum;
        shape.init();
    }

    let rigid_body = new Rigidbody();
    rigid_body.init(entity.body.dynamic, entity.transform.position, entity.transform.rotation);
    rigid_body.freezeRotation = false;
    rigid_body.attachShape(shape);
    bodies[entity.id] = rigid_body;

    PhysicsScene.addActor(rigid_body.get(), null)
    rigid_body.addForce(new Vector3(0, 300, 0));
}

export const update_physics = entities => {
    PhysicsScene.simulate(1 / 60, true)
    PhysicsScene.fetchResults(true)
    entities.forEach(entity => {
        const body = bodies[entity.id]
        const transform = body.getGlobalPose()
        entity.transform.position = transform.translation;
        entity.transform.rotation = transform.rotation;
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