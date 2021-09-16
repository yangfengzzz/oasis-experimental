import {Vec2} from "./Vec2";

export class Body {
    position: Vec2;
    rotation: number;

    velocity: Vec2;
    angularVelocity: number;

    force: Vec2;
    torque: number;

    width: Vec2;

    friction: number;
    mass: number;
    invMass: number;
    I: number;
    invI: number;

    constructor() {
        this.position = new Vec2(0.0, 0.0);
        this.rotation = 0.0;
        this.velocity = new Vec2(0.0, 0.0);
        this.angularVelocity = 0.0;
        this.force = new Vec2(0.0, 0.0);
        this.torque = 0.0;
        this.friction = 0.2;

        this.width = new Vec2(1.0, 1.0);
        this.mass = Number.MAX_VALUE;
        this.invMass = 0.0;
        this.I = Number.MAX_VALUE;
        this.invI = 0.0;
    }

    Set(w: Vec2, m: number) {
        this.position.Set(0.0, 0.0);
        this.rotation = 0.0;
        this.velocity.Set(0.0, 0.0);
        this.angularVelocity = 0.0;
        this.force.Set(0.0, 0.0);
        this.torque = 0.0;
        this.friction = 0.2;

        this.width = w;
        this.mass = m;

        if (this.mass < Number.MAX_VALUE) {
            this.invMass = 1.0 / this.mass;
            this.I = (this.mass * (this.width.x * this.width.x + this.width.y * this.width.y)) / 12.0;
            this.invI = 1.0 / this.I;
        } else {
            this.invMass = 0.0;
            this.I = Number.MAX_VALUE;
            this.invI = 0.0;
        }
    }

    AddForce(f: Vec2) {
        this.force.AddAssign(f);
    }
}
