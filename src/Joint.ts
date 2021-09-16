import { Mat22 } from "./Mat22";
import { Vec2 } from "./Vec2";
import { Body } from "./Body";
import { World } from "./World";

export class Joint {
  M: Mat22 = new Mat22();
  localAnchor1: Vec2 = new Vec2();
  localAnchor2: Vec2 = new Vec2();
  r1: Vec2 = new Vec2();
  r2: Vec2 = new Vec2();
  bias: Vec2 = new Vec2();
  // accumulated impulse
  P: Vec2;
  body1: Body;
  body2: Body;
  biasFactor: number;
  softness: number;

  constructor() {
    this.body1 = null;
    this.body2 = null;
    this.P = new Vec2(0.0, 0.0);
    this.biasFactor = 0.2;
    this.softness = 0.0;
  }

  Set(b1: Body, b2: Body, anchor: Vec2) {
    this.body1 = b1;
    this.body2 = b2;

    const Rot1 = new Mat22(this.body1.rotation);
    const Rot2 = new Mat22(this.body2.rotation);
    const Rot1T = Rot1.Transpose();
    const Rot2T = Rot2.Transpose();

    this.localAnchor1 = Mat22.Mul(Rot1T, Vec2.Subtract(anchor, this.body1.position));
    this.localAnchor2 = Mat22.Mul(Rot2T, Vec2.Subtract(anchor, this.body2.position));

    this.P.Set(0.0, 0.0);

    this.softness = 0.0;
    this.biasFactor = 0.2;
  }

  PreStep(inv_dt: number) {
    // Pre-compute anchors, mass matrix, and bias.
    const Rot1 = new Mat22(this.body1.rotation);
    const Rot2 = new Mat22(this.body2.rotation);

    this.r1 = Mat22.Mul(Rot1, this.localAnchor1);
    this.r2 = Mat22.Mul(Rot2, this.localAnchor2);

    // deltaV = deltaV0 + K * impulse
    // invM = [(1/m1 + 1/m2) * eye(2) - skew(r1) * invI1 * skew(r1) - skew(r2) * invI2 * skew(r2)]
    //      = [1/m1+1/m2     0    ] + invI1 * [r1.y*r1.y -r1.x*r1.y] + invI2 * [r1.y*r1.y -r1.x*r1.y]
    //        [    0     1/m1+1/m2]           [-r1.x*r1.y r1.x*r1.x]           [-r1.x*r1.y r1.x*r1.x]
    let K1 = new Mat22();
    K1.col1.x = this.body1.invMass + this.body2.invMass;
    K1.col2.x = 0.0;
    K1.col1.y = 0.0;
    K1.col2.y = this.body1.invMass + this.body2.invMass;

    let K2 = new Mat22();
    K2.col1.x = this.body1.invI * this.r1.y * this.r1.y;
    K2.col2.x = -this.body1.invI * this.r1.x * this.r1.y;
    K2.col1.y = -this.body1.invI * this.r1.x * this.r1.y;
    K2.col2.y = this.body1.invI * this.r1.x * this.r1.x;

    let K3 = new Mat22();
    K3.col1.x = this.body2.invI * this.r2.y * this.r2.y;
    K3.col2.x = -this.body2.invI * this.r2.x * this.r2.y;
    K3.col1.y = -this.body2.invI * this.r2.x * this.r2.y;
    K3.col2.y = this.body2.invI * this.r2.x * this.r2.x;

    let K = Mat22.Add(K1, Mat22.Add(K2, K3));
    K.col1.x += this.softness;
    K.col2.y += this.softness;

    this.M = K.Invert();

    const p1 = Vec2.Add(this.body1.position, this.r1);
    const p2 = Vec2.Add(this.body2.position, this.r2);
    const dp = Vec2.Subtract(p2, p1);

    if (World.positionCorrection) {
      this.bias = Vec2.Mul(-this.biasFactor * inv_dt, dp);
    } else {
      this.bias.Set(0.0, 0.0);
    }

    if (World.warmStarting) {
      // Apply accumulated impulse.
      this.body1.velocity.SubtractAssign(Vec2.Mul(this.body1.invMass, this.P));
      this.body1.angularVelocity -= this.body1.invI * Vec2.Cross(this.r1, this.P);

      this.body2.velocity.AddAssign(Vec2.Mul(this.body2.invMass, this.P));
      this.body2.angularVelocity += this.body2.invI * Vec2.Cross(this.r2, this.P);
    } else {
      this.P.Set(0.0, 0.0);
    }
  }

  ApplyImpulse() {
    const dv = Vec2.Add(
      this.body2.velocity,
      Vec2.Subtract(
        Vec2.Cross(this.body2.angularVelocity, this.r2),
        Vec2.Add(this.body1.velocity, Vec2.Cross(this.body1.angularVelocity, this.r1))
      )
    );

    const impulse = Mat22.Mul(this.M, Vec2.Subtract(this.bias, Vec2.Add(dv, Vec2.Mul(this.softness, this.P))));

    this.body1.velocity.SubtractAssign(Vec2.Mul(this.body1.invMass, impulse));
    this.body1.angularVelocity -= this.body1.invI * Vec2.Cross(this.r1, impulse);

    this.body2.velocity.AddAssign(Vec2.Mul(this.body2.invMass, impulse));
    this.body2.angularVelocity += this.body2.invI * Vec2.Cross(this.r2, impulse);

    this.P.AddAssign(impulse);
  }
}
