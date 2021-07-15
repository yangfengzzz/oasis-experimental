import {Component, Vector3} from "oasis-engine";
import {PhysicMaterial} from "./PhysicMaterial";
import {
    PHYSX as PhysX,
    physics as PhysicsSystem,
} from "./physx.release";

export enum ColliderFlag {
    SIMULATION_SHAPE,
    SCENE_QUERY_SHAPE,
    TRIGGER_SHAPE,
}

export class Collider extends Component {
    protected _group_id: number;

    protected _center: Vector3 = new Vector3();
    protected _is_dirty: boolean = true;

    protected _pxShape: any;
    protected _flags: any = new PhysX.PxShapeFlags(
        PhysX.PxShapeFlag.eSCENE_QUERY_SHAPE.value |
        PhysX.PxShapeFlag.eSIMULATION_SHAPE.value
    )

    protected _material: PhysicMaterial = new PhysicMaterial(0.1, 0.1, 0.1);

    protected _PxRigidStatic: any;

    get center(): Vector3 {
        return this._center;
    }

    set center(value: Vector3) {
        this._center = value;
        this._is_dirty = true;
    }

    get material(): PhysicMaterial {
        this._is_dirty = true;
        return this._material;
    }

    set material(value: PhysicMaterial) {
        this._material = value;
        this._is_dirty = true;
    }

    get group_id(): number {
        return this._group_id;
    }

    isTrigger(value: boolean) {
        this._pxShape.setFlag(PhysX.PxShapeFlag.eSIMULATION_SHAPE, !value);
    }

    setFlag(flag: ColliderFlag, value: boolean) {
        switch (flag) {
            case ColliderFlag.SCENE_QUERY_SHAPE:
                this._pxShape.setFlag(PhysX.PxShapeFlag.eSCENE_QUERY_SHAPE, value);
                break;
            case ColliderFlag.SIMULATION_SHAPE:
                this._pxShape.setFlag(PhysX.PxShapeFlag.eSIMULATION_SHAPE, value);
                break;
            case ColliderFlag.TRIGGER_SHAPE:
                this._pxShape.setFlag(PhysX.PxShapeFlag.eTRIGGER_SHAPE, value);
                break;
        }
    }

    protected attachActor() {
        const transform = {
            translation: {
                x: this.entity.transform.position.x,
                y: this.entity.transform.position.y,
                z: this.entity.transform.position.z,
            },
            rotation: {
                w: this.entity.transform.rotationQuaternion.w, // PHYSX uses WXYZ quaternions,
                x: this.entity.transform.rotationQuaternion.x,
                y: this.entity.transform.rotationQuaternion.y,
                z: this.entity.transform.rotationQuaternion.z,
            },
        }

        this._PxRigidStatic = PhysicsSystem.createRigidStatic(transform)
        this._PxRigidStatic.attachShape(this._pxShape);
    }

    get staticActor(): any {
        return this._PxRigidStatic;
    }

    get(): any {
        return this._pxShape;
    }
}