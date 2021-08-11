import * as simulator from "./src/Simulator";
import {PHYSX} from "./src/physx.release";

//----------------------------------------------------------------------------------------------------------------------
export let physics
export let PhysX

const host = '127.0.0.1';
const port = 8090;
let socket: WebSocket;
let queue: any[] = [];
const pvdTransportImpl = PhysX.IPvdTransport.implementation({
    connect: function () {
        socket = new WebSocket(`wsl://$(host):$(port)`, ['binary'])
        socket.onopen = () => {
            console.log('Connected to PhysX Debugger');
            queue.forEach(data => socket.send(data));
            queue = []
        }
        socket.onclose = () => {
        }
        return true
    },
    disconnect: function () {
        console.log("Socket disconnect")
    },
    isConnected: function () {
    },
    write: function (inBytes: number, inLength: number) {
        const data = PhysX.HEAPU8.slice(inBytes, inBytes + inLength)
        if (socket.readyState === WebSocket.OPEN) {
            if (queue.length) {
                queue.forEach(data => socket.send(data));
                queue.length = 0;
            }
            socket.send(data);
        } else {
            queue.push(data);
        }
        return true;
    }
})

const pvdTransport = new PhysX.ccPvdTransport(pvdTransportImpl);

const setup = () => {
    const version = PhysX.PX_PHYSICS_VERSION
    const defaultErrorCallback = new PhysX.PxDefaultErrorCallback()
    const allocator = new PhysX.PxDefaultAllocator()
    const foundation = PhysX.PxCreateFoundation(
        version,
        allocator,
        defaultErrorCallback
    )

    const gPvd = PhysX.PxCreatePvd(foundation);
    gPvd.connect(pvdTransport, new PhysX.PxPvdInstrumentationFlags(PhysX.PxPvdInstrumentationFlag.eALL.value));

    physics = PhysX.PxCreatePhysics(
        version,
        foundation,
        new PhysX.PxTolerancesScale(),
        true,
        gPvd
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