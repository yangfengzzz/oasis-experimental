import { Vec2 } from "./Vec2";
import { Body } from "./Body";
import { World } from "./World";
import { Clamp } from "./MathUtils";
import { Collide } from "./Collide";

export class FeaturePair {
  inEdge1: number;
  outEdge1: number;
  inEdge2: number;
  outEdge2: number;
}

export class Contact {
  position: Vec2;
  normal: Vec2;
  r1: Vec2;
  r2: Vec2;
  separation: number;
  // accumulated normal impulse
  Pn: number;
  // accumulated tangent impulse
  Pt: number;
  // accumulated normal impulse for position bias
  Pnb: number;
  massNormal: number;
  massTangent: number;
  bias: number;
  feature: FeaturePair;

  constructor() {
    this.Pn = 0.0;
    this.Pt = 0.0;
    this.Pnb = 0.0;
  }

  clone(contact: Contact) {
    this.position.x = contact.position.x;
    this.position.y = contact.position.y;

    this.normal.x = contact.normal.x;
    this.normal.y = contact.normal.y;

    this.r1.x = contact.r1.x;
    this.r1.y = contact.r1.y;
    this.r2.x = contact.r2.x;
    this.r2.y = contact.r2.y;

    this.separation = contact.separation;
    // accumulated normal impulse
    this.Pn = contact.Pn;
    // accumulated tangent impulse
    this.Pt = contact.Pt;
    // accumulated normal impulse for position bias
    this.Pnb = contact.Pnb;
    this.massNormal = contact.massNormal;
    this.massTangent = contact.massTangent;
    this.bias = contact.bias;

    this.feature.inEdge1 = contact.feature.inEdge1;
    this.feature.inEdge2 = contact.feature.inEdge2;
    this.feature.outEdge1 = contact.feature.outEdge1;
    this.feature.outEdge2 = contact.feature.outEdge2;
  }
}

export class ArbiterKey {
  body1: Body;
  body2: Body;

  constructor(b1: Body, b2: Body) {
    if (b1 < b2) {
      this.body1 = b1;
      this.body2 = b2;
    } else {
      this.body1 = b2;
      this.body2 = b1;
    }
  }
}

export class Arbiter {
  contacts: Contact[] = [new Contact(), new Contact()];
  numContacts: number;

  body1: Body;
  body2: Body;

  // Combined friction
  friction: number;

  constructor(b1: Body, b2: Body) {
    if (b1 < b2) {
      this.body1 = b1;
      this.body2 = b2;
    } else {
      this.body1 = b2;
      this.body2 = b1;
    }

    this.numContacts = Collide(this.contacts, this.body1, this.body2);

    this.friction = Math.sqrt(this.body1.friction * this.body2.friction);
  }

  Update(newContacts: Contact[], numNewContacts: number) {
    const mergedContacts = [new Contact(), new Contact()];

    for (let i = 0; i < numNewContacts; ++i) {
      const cNew = newContacts[i];
      let k = -1;
      for (let j = 0; j < this.numContacts; ++j) {
        let cOld = this.contacts[j];
        if (
          cNew.feature.inEdge1 == cOld.feature.inEdge1 &&
          cNew.feature.inEdge2 == cOld.feature.inEdge2 &&
          cNew.feature.outEdge1 == cOld.feature.outEdge1 &&
          cNew.feature.outEdge2 == cOld.feature.outEdge2
        ) {
          k = j;
          break;
        }
      }

      if (k > -1) {
        const c = mergedContacts[i];
        const cOld = this.contacts[k];
        c.clone(cNew);
        if (World.warmStarting) {
          c.Pn = cOld.Pn;
          c.Pt = cOld.Pt;
          c.Pnb = cOld.Pnb;
        } else {
          c.Pn = 0.0;
          c.Pt = 0.0;
          c.Pnb = 0.0;
        }
      } else {
        mergedContacts[i] = newContacts[i];
      }
    }

    for (let i = 0; i < numNewContacts; ++i) {
      this.contacts[i] = mergedContacts[i];
    }

    this.numContacts = numNewContacts;
  }

  PreStep(inv_dt: number) {
    const k_allowedPenetration = 0.01;
    const k_biasFactor = World.positionCorrection ? 0.2 : 0.0;

    for (let i = 0; i < this.numContacts; ++i) {
      const c = this.contacts[i];

      const r1 = Vec2.Subtract(c.position, this.body1.position);
      const r2 = Vec2.Subtract(c.position, this.body2.position);

      // Precompute normal mass, tangent mass, and bias.
      const rn1 = Vec2.Dot(r1, c.normal);
      const rn2 = Vec2.Dot(r2, c.normal);
      let kNormal = this.body1.invMass + this.body2.invMass;
      kNormal += this.body1.invI * (Vec2.Dot(r1, r1) - rn1 * rn1) + this.body2.invI * (Vec2.Dot(r2, r2) - rn2 * rn2);
      c.massNormal = 1.0 / kNormal;

      const tangent = Vec2.Cross(c.normal, 1.0);
      const rt1 = Vec2.Dot(r1, tangent);
      const rt2 = Vec2.Dot(r2, tangent);
      let kTangent = this.body1.invMass + this.body2.invMass;
      kTangent += this.body1.invI * (Vec2.Dot(r1, r1) - rt1 * rt1) + this.body2.invI * (Vec2.Dot(r2, r2) - rt2 * rt2);
      c.massTangent = 1.0 / kTangent;

      c.bias = -k_biasFactor * inv_dt * Math.min(0.0, c.separation + k_allowedPenetration);

      if (World.accumulateImpulses) {
        // Apply normal + friction impulse
        const P = Vec2.Add(Vec2.Mul(c.Pn, c.normal), Vec2.Mul(c.Pt, tangent));

        this.body1.velocity.SubtractAssign(Vec2.Mul(this.body1.invMass, P));
        this.body1.angularVelocity -= this.body1.invI * Vec2.Cross(r1, P);

        this.body2.velocity.AddAssign(Vec2.Mul(this.body2.invMass, P));
        this.body2.angularVelocity += this.body2.invI * Vec2.Cross(r2, P);
      }
    }
  }

  ApplyImpulse() {
    const b1 = this.body1;
    const b2 = this.body2;

    for (let i = 0; i < this.numContacts; ++i) {
      const c = this.contacts[i];
      c.r1 = Vec2.Subtract(c.position, b1.position);
      c.r2 = Vec2.Subtract(c.position, b2.position);

      // Relative velocity at contact
      let dv = Vec2.Subtract(
        Vec2.Add(b2.velocity, Vec2.Cross(b2.angularVelocity, c.r2)),
        Vec2.Add(b1.velocity, Vec2.Cross(b1.angularVelocity, c.r1))
      );

      // Compute normal impulse
      const vn = Vec2.Dot(dv, c.normal);

      let dPn = c.massNormal * (-vn + c.bias);

      if (World.accumulateImpulses) {
        // Clamp the accumulated impulse
        const Pn0 = c.Pn;
        c.Pn = Math.max(Pn0 + dPn, 0.0);
        dPn = c.Pn - Pn0;
      } else {
        dPn = Math.max(dPn, 0.0);
      }

      // Apply contact impulse
      const Pn = Vec2.Mul(dPn, c.normal);

      b1.velocity.SubtractAssign(Vec2.Mul(b1.invMass, Pn));
      b1.angularVelocity -= b1.invI * Vec2.Cross(c.r1, Pn);

      b2.velocity.AddAssign(Vec2.Mul(b2.invMass, Pn));
      b2.angularVelocity += b2.invI * Vec2.Cross(c.r2, Pn);

      // Relative velocity at contact
      dv = Vec2.Subtract(
        Vec2.Add(b2.velocity, Vec2.Cross(b2.angularVelocity, c.r2)),
        Vec2.Add(b1.velocity, Vec2.Cross(b1.angularVelocity, c.r1))
      );

      const tangent = Vec2.Cross(c.normal, 1.0);
      const vt = Vec2.Dot(dv, tangent);
      let dPt = c.massTangent * -vt;

      if (World.accumulateImpulses) {
        // Compute friction impulse
        const maxPt = this.friction * c.Pn;

        // Clamp friction
        const oldTangentImpulse = c.Pt;
        c.Pt = Clamp(oldTangentImpulse + dPt, -maxPt, maxPt);
        dPt = c.Pt - oldTangentImpulse;
      } else {
        const maxPt = this.friction * dPn;
        dPt = Clamp(dPt, -maxPt, maxPt);
      }

      // Apply contact impulse
      const Pt = Vec2.Mul(dPt, tangent);

      b1.velocity.SubtractAssign(Vec2.Mul(b1.invMass, Pt));
      b1.angularVelocity -= b1.invI * Vec2.Cross(c.r1, Pt);

      b2.velocity.AddAssign(Vec2.Mul(b2.invMass, Pt));
      b2.angularVelocity += b2.invI * Vec2.Cross(c.r2, Pt);
    }
  }
}

function Compare(a1: ArbiterKey, a2: ArbiterKey): Boolean {
  if (a1.body1 < a2.body1) {
    return true;
  }

  return a1.body1 == a2.body1 && a1.body2 < a2.body2;
}
