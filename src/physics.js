let loaded = false
let cb = null
let physics
let scene
let bodies = {}

const PHYSX = {
    onRuntimeInitialized: function () {
        loaded = true
        console.log('PHYSX loaded')
        setup()
        if (cb) cb()
    }
};

const onLoad = _cb => {
    cb = _cb
    if (loaded) cb()
}

const setup = () => {
    const version = PHYSX.PX_PHYSICS_VERSION
    const defaultErrorCallback = new PHYSX.PxDefaultErrorCallback()
    const allocator = new PHYSX.PxDefaultAllocator()
    const foundation = PHYSX.PxCreateFoundation(
        version,
        allocator,
        defaultErrorCallback
    )
    const triggerCallback = {
        onContactBegin: () => {
        },
        onContactEnd: () => {
        },
        onContactPersist: () => {
        },
        onTriggerBegin: () => {
        },
        onTriggerEnd: () => {
        },
    }
    const PHYSXSimulationCallbackInstance = PHYSX.PxSimulationEventCallback.implement(
        triggerCallback
    )

    physics = PHYSX.PxCreatePhysics(
        version,
        foundation,
        new PHYSX.PxTolerancesScale(),
        false,
        null
    )
    PHYSX.PxInitExtensions(physics, null)
    const sceneDesc = PHYSX.getDefaultSceneDesc(
        physics.getTolerancesScale(),
        0,
        PHYSXSimulationCallbackInstance
    )
    scene = physics.createScene(sceneDesc)
}

const init = entities => {
    entities.forEach(entity => {
        let geometry
        if (entity.body.type === 'box') {
            geometry = new PHYSX.PxBoxGeometry(
                // PHYSX uses half-extents
                entity.body.size[0] / 2,
                entity.body.size[1] / 2,
                entity.body.size[2] / 2
            )
        }
        if (entity.body.type === 'spehre') {
            geometry = new PHYSX.PxSphereGeometry(...entity.body.size)
        }
        const material = physics.createMaterial(0.2, 0.2, 0.2)
        const flags = new PHYSX.PxShapeFlags(
            PHYSX.PxShapeFlag.eSCENE_QUERY_SHAPE.value |
            PHYSX.PxShapeFlag.eSIMULATION_SHAPE.value
        )
        const shape = physics.createShape(geometry, material, false, flags)
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
            body = physics.createRigidDynamic(transform)
        } else {
            body = physics.createRigidStatic(transform)
        }
        body.attachShape(shape)
        bodies[entity.id] = body
        scene.addActor(body, null)
    })
}

const update = entities => {
    scene.simulate(1 / 60, true)
    scene.fetchResults(true)
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

    console.log("finish update!")
}