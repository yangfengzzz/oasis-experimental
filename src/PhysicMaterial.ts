import {
    physics as PhysicsSystem,
} from "../main";

/**
 * Describes how physics materials of the colliding objects are combined.
 */
export enum PhysicCombineMode {
    /** Averages the friction/bounce of the two colliding materials. */
    Average,
    /** Uses the smaller friction/bounce of the two colliding materials. */
    Minimum,
    /** Multiplies the friction/bounce of the two colliding materials. */
    Multiply,
    /** Uses the larger friction/bounce of the two colliding materials. */
    Maximum,
}

/**
 * Physics material describes how to handle colliding objects (friction, bounciness).
 */
export class PhysicMaterial {
    private _bounciness: number;
    private _dynamicFriction: number;
    private _staticFriction: number;

    private _is_dirty: boolean;

    private _pxMaterial: any;
    private _bounceCombine: PhysicCombineMode = PhysicCombineMode.Average;
    private _frictionCombine: PhysicCombineMode = PhysicCombineMode.Average;

    constructor(staticFriction: number, dynamicFriction: number, bounciness: number) {
        this._staticFriction = staticFriction;
        this._dynamicFriction = dynamicFriction
        this._bounciness = bounciness;
        this._is_dirty = true;
    }

    /** Retrieves the coefficient of restitution. */
    get bounciness(): number {
        return this._bounciness;
    }

    /** Sets the coefficient of restitution
     * @param value Coefficient of restitution.
     */
    set bounciness(value: number) {
        this._bounciness = value;
        this._is_dirty = true;
    }

    /** Retrieves the DynamicFriction value. */
    get dynamicFriction(): number {
        return this._dynamicFriction;
    }

    /** Sets the coefficient of dynamic friction.
     * @param value Coefficient of dynamic friction.
     */
    set dynamicFriction(value: number) {
        this._dynamicFriction = value;
        this._is_dirty = true;
    }

    /** Retrieves the coefficient of static friction. */
    get staticFriction(): number {
        return this._staticFriction;
    }

    /** Sets the coefficient of static friction
     * @param value Coefficient of static friction.
     */
    set staticFriction(value: number) {
        this._staticFriction = value;
        this._is_dirty = true;
    }

    /** Retrieves the restitution combine mode. */
    get bounceCombine(): PhysicCombineMode {
        return this._bounceCombine;
    }

    /** Sets the restitution combine mode.
     * @param value Restitution combine mode for this material.
     */
    set bounceCombine(value: PhysicCombineMode) {
        this._bounceCombine = value;
        this._is_dirty = true;
    }

    /** Retrieves the friction combine mode. */
    get frictionCombine(): PhysicCombineMode {
        return this._frictionCombine;
    }

    /** Sets the friction combine mode.
     * @param value Friction combine mode to set for this material.
     */
    set frictionCombine(value: PhysicCombineMode) {
        this._frictionCombine = value;
        this._is_dirty = true;
    }

    create(): any {
        if (this._is_dirty) {
            this._pxMaterial = PhysicsSystem.createMaterial(this._staticFriction, this._dynamicFriction, this._bounciness);
            this._pxMaterial.setFrictionCombineMode(this._frictionCombine);
            this._pxMaterial.setRestitutionCombineMode(this._bounceCombine);
            this._is_dirty = false;
        }
        return this._pxMaterial;
    }
}