import {
    PHYSX as PhysX,
    physics as PhysicsSystem,
} from "./physx.release";
import {Quaternion, Vector3} from "oasis-engine";

export class Rigidbody {
    private _drag: number;
    private _angularDrag: number;

    private _velocity: Vector3;
    private _angularVelocity: Vector3;

    private _position: Vector3;
    private _rotation: Quaternion;

    private _mass: number;
    private _centerOfMass: Vector3;
    private _inertiaTensor: Vector3;

    private _maxAngularVelocity: number;
    private _maxDepenetrationVelocity: number;

    private _sleepThreshold: number;
    private _solverIterations: number;

    private _PxRigidActor: any;

    get drag(): number {
        return this._drag;
    }

    // setLinearDamping
    set drag(value: number) {
        this._drag = value;
    }

    get angularDrag(): number {
        return this._angularDrag;
    }

    //setAngularDamping
    set angularDrag(value: number) {
        this._angularDrag = value;
    }

    get velocity(): Vector3 {
        return this._velocity;
    }

    //setLinearVelocity
    set velocity(value: Vector3) {
        this._velocity = value;
    }

    get angularVelocity(): Vector3 {
        return this._angularVelocity;
    }

    //setAngularVelocity
    set angularVelocity(value: Vector3) {
        this._angularVelocity = value;
    }

    get position(): Vector3 {
        return this._position;
    }

    set position(value: Vector3) {
        this._position = value;
    }

    get rotation(): Quaternion {
        return this._rotation;
    }

    set rotation(value: Quaternion) {
        this._rotation = value;
    }

    get mass(): number {
        return this._mass;
    }

    // setMass
    set mass(value: number) {
        this._mass = value;
    }

    get centerOfMass(): Vector3 {
        return this._centerOfMass;
    }

    // setCMassLocalPose
    set centerOfMass(value: Vector3) {
        this._centerOfMass = value;
    }

    get inertiaTensor(): Vector3 {
        return this._inertiaTensor;
    }

    // setMassSpaceInertiaTensor
    set inertiaTensor(value: Vector3) {
        this._inertiaTensor = value;
    }

    get maxAngularVelocity(): number {
        return this._maxAngularVelocity;
    }

    // setMaxAngularVelocity(undefined)
    set maxAngularVelocity(value: number) {
        this._maxAngularVelocity = value;
    }

    get maxDepenetrationVelocity(): number {
        return this._maxDepenetrationVelocity;
    }

    // setMaxDepenetrationVelocity(undefined)
    set maxDepenetrationVelocity(value: number) {
        this._maxDepenetrationVelocity = value;
    }

    get sleepThreshold(): number {
        return this._sleepThreshold;
    }

    //setSleepThreshold(dynamic only)
    set sleepThreshold(value: number) {
        this._sleepThreshold = value;
    }

    get solverIterations(): number {
        return this._solverIterations;
    }

    //setSolverIterationCounts(undefined)
    set solverIterations(value: number) {
        this._solverIterations = value;
    }

    //----------------------------------------------------------------------------------



    create(isDynamic: boolean): any {
        const transform = {
            translation: {
                x: this._position.x,
                y: this._position.y,
                z: this._position.z,
            },
            rotation: {
                w: this._rotation.w, // PHYSX uses WXYZ quaternions,
                x: this._rotation.x,
                y: this._rotation.y,
                z: this._rotation.z,
            },
        }

        if (isDynamic) {
            this._PxRigidActor = PhysicsSystem.createRigidDynamic(transform)
        } else {
            this._PxRigidActor = PhysicsSystem.createRigidStatic(transform)
        }

        return this._PxRigidActor;
    }
}