import {
    PHYSX as PhysX,
    physics as PhysicsSystem,
} from "./physx.release";
import {Quaternion, Vector3} from "oasis-engine";

export enum CollisionDetectionMode {
    Discrete,
    Continuous, // eENABLE_CCD
    ContinuousDynamic,// eENABLE_CCD_FRICTION
    ContinuousSpeculative, // eENABLE_SPECULATIVE_CCD
}

export enum RigidbodyConstraints {
    None,
    FreezePositionX, // eLOCK_LINEAR_X
    FreezePositionY, // eLOCK_LINEAR_Y
    FreezePositionZ, // eLOCK_LINEAR_Z
    FreezeRotationX, // eLOCK_ANGULAR_X
    FreezeRotationY, // eLOCK_ANGULAR_Y
    FreezeRotationZ, // eLOCK_ANGULAR_Z
    FreezePosition, // eLOCK_LINEAR_X, eLOCK_LINEAR_Y, eLOCK_LINEAR_Z
    FreezeRotation, // eLOCK_ANGULAR_X, eLOCK_ANGULAR_Y, eLOCK_ANGULAR_Z
    FreezeAll,
}

// detectCollisions, inertiaTensorRotation,
// interpolation, solverVelocityIterations, worldCenterOfMass
export class Rigidbody {
    /** The drag of the object. */
    private _drag: number;
    /** The angular drag of the object. */
    private _angularDrag: number;

    /** The velocity vector of the rigidbody. It represents the rate of change of Rigidbody position. */
    private _velocity: Vector3;
    /** The angular velocity vector of the rigidbody measured in radians per second. */
    private _angularVelocity: Vector3;

    /** The position of the rigidbody. */
    private _position: Vector3 = new Vector3();
    /** The rotation of the Rigidbody. */
    private _rotation: Quaternion = new Quaternion();

    /** The mass of the rigidbody. */
    private _mass: number;
    /** The center of mass relative to the transform's origin. */
    private _centerOfMass: Vector3;
    /** The diagonal inertia tensor of mass relative to the center of mass. */
    private _inertiaTensor: Vector3;

    /** The maximum angular velocity of the rigidbody measured in radians per second. (Default 7) range { 0, infinity }. */
    private _maxAngularVelocity: number;
    /** Maximum velocity of a rigidbody when moving out of penetrating state. */
    private _maxDepenetrationVelocity: number;

    /** The mass-normalized energy threshold, below which objects start going to sleep. */
    private _sleepThreshold: number;
    /** The solverIterations determines how accurately Rigidbody joints and collision contacts are resolved.
     * Overrides Physics.defaultSolverIterations. Must be positive. */
    private _solverIterations: number;

    /** Controls whether gravity affects this rigidbody. */
    private _useGravity: boolean;
    /** Controls whether physics affects the rigidbody. */
    private _isKinematic: boolean;
    /** The Rigidbody's collision detection mode. */
    private _collisionDetectionMode: CollisionDetectionMode;
    /** Controls which degrees of freedom are allowed for the simulation of this Rigidbody. */
    private _constraints: RigidbodyConstraints;
    private _freezeRotation: boolean;

    private _isDynamic: boolean;

    private _PxRigidActor: any;

    get drag(): number {
        return this._drag;
    }

    // setLinearDamping
    set drag(value: number) {
        this._drag = value;
        if (this.isDynamic) {
            this._PxRigidActor.setLinearDamping(value);
        }
    }

    get angularDrag(): number {
        return this._angularDrag;
    }

    //setAngularDamping
    set angularDrag(value: number) {
        this._angularDrag = value;
        if (this.isDynamic) {
            this._PxRigidActor.setAngularDamping(value);
        }
    }

    get velocity(): Vector3 {
        return this._velocity;
    }

    //setLinearVelocity
    set velocity(value: Vector3) {
        this._velocity = value;
        if (this.isDynamic) {
            const vel = {x: value.x, y: value.y, z: value.z};
            this._PxRigidActor.setLinearVelocity(vel, true);
        }
    }

    get angularVelocity(): Vector3 {
        return this._angularVelocity;
    }

    //setAngularVelocity
    set angularVelocity(value: Vector3) {
        this._angularVelocity = value;
        if (this.isDynamic) {
            this._PxRigidActor.setAngularVelocity({x: value.x, y: value.y, z: value.z}, true);
        }
    }

    get position(): Vector3 {
        return this._position;
    }

    get rotation(): Quaternion {
        return this._rotation;
    }

    get mass(): number {
        return this._mass;
    }

    // setMass
    set mass(value: number) {
        this._mass = value;
        if (this.isDynamic) {
            this._PxRigidActor.setMass(value);
        }
    }

    get centerOfMass(): Vector3 {
        return this._centerOfMass;
    }

    // setCMassLocalPose
    set centerOfMass(value: Vector3) {
        this._centerOfMass = value;
        if (this.isDynamic) {
            const transform = {
                translation: {
                    x: value.x,
                    y: value.y,
                    z: value.z,
                },
                rotation: {
                    w: 1, x: 0, y: 0, z: 0,
                },
            }
            this._PxRigidActor.setCMassLocalPose(value);
        }
    }

    get inertiaTensor(): Vector3 {
        return this._inertiaTensor;
    }

    // setMassSpaceInertiaTensor
    set inertiaTensor(value: Vector3) {
        this._inertiaTensor = value;
        if (this.isDynamic) {
            this._PxRigidActor.setMassSpaceInertiaTensor({x: value.x, y: value.y, z: value.z});
        }
    }

    get maxAngularVelocity(): number {
        return this._maxAngularVelocity;
    }

    // setMaxAngularVelocity
    set maxAngularVelocity(value: number) {
        this._maxAngularVelocity = value;
        if (this.isDynamic) {
            this._PxRigidActor.setMaxAngularVelocity(value);
        }
    }

    get maxDepenetrationVelocity(): number {
        return this._maxDepenetrationVelocity;
    }

    // setMaxDepenetrationVelocity
    set maxDepenetrationVelocity(value: number) {
        this._maxDepenetrationVelocity = value;
        if (this.isDynamic) {
            this._PxRigidActor.setMaxDepenetrationVelocity(value);
        }
    }

    get sleepThreshold(): number {
        return this._sleepThreshold;
    }

    //setSleepThreshold
    set sleepThreshold(value: number) {
        this._sleepThreshold = value;
        if (this.isDynamic) {
            this._PxRigidActor.setSleepThreshold(value);
        }
    }

    get solverIterations(): number {
        return this._solverIterations;
    }

    //setSolverIterationCounts
    set solverIterations(value: number) {
        this._solverIterations = value;
        if (this.isDynamic) {
            this._PxRigidActor.setSolverIterationCounts(value, 1);
        }
    }

    get isKinematic(): boolean {
        return this._isKinematic;
    }

    //eKINEMATIC
    set isKinematic(value: boolean) {
        this._isKinematic = value;
    }

    get collisionDetectionMode(): CollisionDetectionMode {
        return this._collisionDetectionMode;
    }

    set collisionDetectionMode(value: CollisionDetectionMode) {
        this._collisionDetectionMode = value;
    }

    get useGravity(): boolean {
        return this._useGravity;
    }

    set useGravity(value: boolean) {
        this._useGravity = value;
    }

    get constraints(): RigidbodyConstraints {
        return this._constraints;
    }

    set constraints(value: RigidbodyConstraints) {
        this._constraints = value;
    }

    get freezeRotation(): boolean {
        return this._freezeRotation;
    }

    set freezeRotation(value: boolean) {
        this._freezeRotation = value;
    }

    get isDynamic(): boolean {
        return this._isDynamic;
    }

    //----------------------------------------------------------------------------------
    // AddExplosionForce, AddRelativeTorque, ClosestPointOnBounds,
    // MovePosition, MoveRotation, ResetCenterOfMass, ResetInertiaTensor
    // SweepTest, SweepTestAll

    // addForce(undefined)
    addForce(force: Vector3) {

    }

    // addForceAtPos
    addForceAtPosition(force: Vector3) {

    }

    // addLocalForceAtLocalPos
    addRelativeForce(force: Vector3) {

    }

    // addTorque
    addTorque(torque: Vector3) {

    }

    //getVelocityAtPos(undefined)
    getPointVelocity(): Vector3 {
        return new Vector3();
    }

    //getLocalVelocityAtLocalPos(undefined)
    getRelativePointVelocity(): Vector3 {
        return new Vector3();
    }

    //isSleeping(undefined)
    isSleeping(): boolean {
        return true;
    }

    //updateMassAndInertia(undefined)
    setDensity() {

    }

    //putToSleep(undefined)
    sleep() {

    }

    //wakeUp(undefined)
    wakeUp() {

    }

    init(isDynamic: boolean, position?: Vector3, rotation?: Quaternion) {
        this._isDynamic = isDynamic
        if (position != undefined) {
            this._position = position;
        }

        if (rotation != undefined) {
            this._rotation = rotation;
        }

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
    }

    get(): any {
        return this._PxRigidActor;
    }
}