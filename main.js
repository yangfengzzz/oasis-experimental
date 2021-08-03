import * as simulator from "./src/Simulator";
import {PHYSX} from "./src/physx.release.js";

//----------------------------------------------------------------------------------------------------------------------
export let physics
export let PhysX

const setup = () => {
    const version = PhysX.PX_PHYSICS_VERSION
    const defaultErrorCallback = new PhysX.PxDefaultErrorCallback()
    const allocator = new PhysX.PxDefaultAllocator()
    const foundation = PhysX.PxCreateFoundation(
        version,
        allocator,
        defaultErrorCallback
    )

    physics = PhysX.PxCreatePhysics(
        version,
        foundation,
        new PhysX.PxTolerancesScale(),
        false,
        null
    )
    PhysX.PxInitExtensions(physics, null)
}

const update = () => {
    simulator.update()
    requestAnimationFrame(update)
}

PHYSX().then(function (PHYSX) {
    PhysX = PHYSX;
    console.log('PHYSX loaded')
    setup()
    simulator.init()

    update()
});

// import * as simulator from "./src/RenderToTexture";