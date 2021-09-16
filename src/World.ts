import { Body } from "./Body";
import { Joint } from "./Joint";
import { Arbiter, ArbiterKey } from "./Arbiter";
import { Vec2 } from "./Vec2";

export class World {
  bodies: Body[] = [];
  joints: Joint[] = [];
  arbiters: Map<ArbiterKey, Arbiter> = new Map<ArbiterKey, Arbiter>();
  gravity: Vec2;
  iterations: number;
  static accumulateImpulses: Boolean = true;
  static warmStarting: Boolean = true;
  static positionCorrection: Boolean = true;

  constructor(gravity: Vec2, iterations: number) {
    this.gravity = gravity;
    this.iterations = iterations;
  }

  AddBody(body: Body) {
    this.bodies.push(body);
  }

  AddJoint(joint: Joint) {
    this.joints.push(joint);
  }

  Clear() {
    this.bodies.length = 0;
    this.joints.length = 0;
    this.arbiters.clear();
  }

  Step(dt: number) {
    const inv_dt = dt > 0.0 ? 1.0 / dt : 0.0;

    // Determine overlapping bodies and update contact points.
    this.BroadPhase();

    // Integrate forces.
    for (let i = 0; i < this.bodies.length; ++i) {
      const b = this.bodies[i];

      if (b.invMass == 0.0) {
        continue;
      }

      b.velocity.AddAssign(Vec2.Mul(dt, Vec2.Add(this.gravity, Vec2.Mul(b.invMass, b.force))));
      b.angularVelocity += dt * b.invI * b.torque;
    }

    // Perform pre-steps.
    this.arbiters.forEach((arb) => {
      arb.PreStep(inv_dt);
    });

    for (let i = 0; i < this.joints.length; ++i) {
      this.joints[i].PreStep(inv_dt);
    }

    // Perform iterations
    for (let i = 0; i < this.iterations; ++i) {
      this.arbiters.forEach((arb) => {
        arb.ApplyImpulse();
      });

      for (let j = 0; j < this.joints.length; ++j) {
        this.joints[j].ApplyImpulse();
      }
    }

    // Integrate Velocities
    for (let i = 0; i < this.bodies.length; ++i) {
      const b = this.bodies[i];

      b.position.AddAssign(Vec2.Mul(dt, b.velocity));
      b.rotation += dt * b.angularVelocity;

      b.force.Set(0.0, 0.0);
      b.torque = 0.0;
    }
  }

  BroadPhase() {
    // O(n^2) broad-phase
    for (let i = 0; i < this.bodies.length; ++i) {
      const bi = this.bodies[i];

      for (let j = i + 1; j < this.bodies.length; ++j) {
        const bj = this.bodies[j];

        if (bi.invMass == 0.0 && bj.invMass == 0.0) {
          continue;
        }

        const newArb = new Arbiter(bi, bj);
        const key = new ArbiterKey(bi, bj);

        if (newArb.numContacts > 0) {
          const iter = this.arbiters.get(key);
          if (iter == undefined) {
            this.arbiters.set(key, newArb);
          } else {
            iter.Update(newArb.contacts);
          }
        } else {
          this.arbiters.delete(key);
        }
      }
    }
  }
}
