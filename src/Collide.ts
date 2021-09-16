import { Body } from "./Body";
import { Contact, FeaturePair } from "./Arbiter";
import { Vec2 } from "./Vec2";
import { Mat22 } from "./Mat22";

enum Axis {
  FACE_A_X,
  FACE_A_Y,
  FACE_B_X,
  FACE_B_Y
}

enum EdgeNumbers {
  NO_EDGE = 0,
  EDGE1,
  EDGE2,
  EDGE3,
  EDGE4
}

class ClipVertex {
  v: Vec2;
  fp: FeaturePair;

  constructor() {
    this.fp.inEdge1 = 0;
    this.fp.inEdge2 = 0;
    this.fp.outEdge1 = 0;
    this.fp.outEdge2 = 0;
  }
}

function Flip(fp: FeaturePair) {
  let tmp = fp.inEdge1;
  fp.inEdge1 = fp.inEdge2;
  fp.inEdge2 = tmp;

  tmp = fp.outEdge1;
  fp.outEdge1 = fp.outEdge2;
  fp.outEdge2 = tmp;
}

function ClipSegmentToLine(
  vOut: ClipVertex[],
  vIn: ClipVertex[],
  normal: Vec2,
  offset: number,
  clipEdge: number
): number {
  // Start with no output points
  let numOut = 0;

  // Calculate the distance of end points to the line
  const distance0 = Vec2.Dot(normal, vIn[0].v) - offset;
  const distance1 = Vec2.Dot(normal, vIn[1].v) - offset;

  // If the points are behind the plane
  if (distance0 <= 0.0) vOut[numOut++] = vIn[0];
  if (distance1 <= 0.0) vOut[numOut++] = vIn[1];

  // If the points are on different sides of the plane
  if (distance0 * distance1 < 0.0) {
    // Find intersection point of edge and plane
    const interp = distance0 / (distance0 - distance1);
    vOut[numOut].v = Vec2.Add(vIn[0].v, Vec2.Mul(interp, Vec2.Subtract(vIn[1].v, vIn[0].v)));
    if (distance0 > 0.0) {
      vOut[numOut].fp = vIn[0].fp;
      vOut[numOut].fp.inEdge1 = clipEdge;
      vOut[numOut].fp.inEdge2 = EdgeNumbers.NO_EDGE;
    } else {
      vOut[numOut].fp = vIn[1].fp;
      vOut[numOut].fp.outEdge1 = clipEdge;
      vOut[numOut].fp.outEdge2 = EdgeNumbers.NO_EDGE;
    }
    ++numOut;
  }

  return numOut;
}

function ComputeIncidentEdge(c: ClipVertex[], h: Vec2, pos: Vec2, Rot: Mat22, normal: Vec2) {
  // The normal is from the reference box. Convert it
  // to the incident box's frame and flip sign.
  const RotT = Rot.Transpose();
  const n = Mat22.Mul(RotT, normal).Neg();
  const nAbs = Vec2.Abs(n);

  if (nAbs.x > nAbs.y) {
    if (Math.sign(n.x) > 0.0) {
      c[0].v.Set(h.x, -h.y);
      c[0].fp.inEdge2 = EdgeNumbers.EDGE3;
      c[0].fp.outEdge2 = EdgeNumbers.EDGE4;

      c[1].v.Set(h.x, h.y);
      c[1].fp.inEdge2 = EdgeNumbers.EDGE4;
      c[1].fp.outEdge2 = EdgeNumbers.EDGE1;
    } else {
      c[0].v.Set(-h.x, h.y);
      c[0].fp.inEdge2 = EdgeNumbers.EDGE1;
      c[0].fp.outEdge2 = EdgeNumbers.EDGE2;

      c[1].v.Set(-h.x, -h.y);
      c[1].fp.inEdge2 = EdgeNumbers.EDGE2;
      c[1].fp.outEdge2 = EdgeNumbers.EDGE3;
    }
  } else {
    if (Math.sign(n.y) > 0.0) {
      c[0].v.Set(h.x, h.y);
      c[0].fp.inEdge2 = EdgeNumbers.EDGE4;
      c[0].fp.outEdge2 = EdgeNumbers.EDGE1;

      c[1].v.Set(-h.x, h.y);
      c[1].fp.inEdge2 = EdgeNumbers.EDGE1;
      c[1].fp.outEdge2 = EdgeNumbers.EDGE2;
    } else {
      c[0].v.Set(-h.x, -h.y);
      c[0].fp.inEdge2 = EdgeNumbers.EDGE2;
      c[0].fp.outEdge2 = EdgeNumbers.EDGE3;

      c[1].v.Set(h.x, -h.y);
      c[1].fp.inEdge2 = EdgeNumbers.EDGE3;
      c[1].fp.outEdge2 = EdgeNumbers.EDGE4;
    }
  }

  c[0].v = Vec2.Add(pos, Mat22.Mul(Rot, c[0].v));
  c[1].v = Vec2.Add(pos, Mat22.Mul(Rot, c[1].v));
}

export function Collide(contacts: Contact[], body1: Body, body2: Body): number {
  // Setup
  const hA = Vec2.Mul(0.5, this.bodyA.width);
  const hB = Vec2.Mul(0.5, this.bodyB.width);

  const posA = this.bodyA.position;
  const posB = this.bodyB.position;

  const RotA = new Mat22(this.bodyA.rotation);
  const RotB = new Mat22(this.bodyB.rotation);

  const RotAT = RotA.Transpose();
  const RotBT = RotB.Transpose();

  const dp = Vec2.Subtract(posB, posA);
  const dA = Mat22.Mul(RotAT, dp);
  const dB = Mat22.Mul(RotBT, dp);

  const C = Mat22.Mul(RotAT, RotB);
  const absC = Mat22.Abs(C);
  const absCT = absC.Transpose();

  // Box A faces
  const faceA = Vec2.Subtract(Vec2.Subtract(Vec2.Abs(dA), hA), Mat22.Mul(absC, hB));
  if (faceA.x > 0.0 || faceA.y > 0.0) {
    return 0;
  }

  // Box B faces
  const faceB = Vec2.Subtract(Vec2.Subtract(Vec2.Abs(dB), hB), Mat22.Mul(absCT, hA));
  if (faceB.x > 0.0 || faceB.y > 0.0) {
    return 0;
  }

  // Box A faces
  let axis = Axis.FACE_A_X;
  let separation = faceA.x;
  let normal = dA.x > 0.0 ? RotA.col1 : RotA.col1.Neg();

  const relativeTol = 0.95;
  const absoluteTol = 0.01;

  if (faceA.y > relativeTol * separation + absoluteTol * hA.y) {
    axis = Axis.FACE_A_Y;
    separation = faceA.y;
    normal = dA.y > 0.0 ? RotA.col2 : RotA.col2.Neg();
  }

  // Box B faces
  if (faceB.x > relativeTol * separation + absoluteTol * hB.x) {
    axis = Axis.FACE_B_X;
    separation = faceB.x;
    normal = dB.x > 0.0 ? RotB.col1 : RotB.col1.Neg();
  }

  if (faceB.y > relativeTol * separation + absoluteTol * hB.y) {
    axis = Axis.FACE_B_Y;
    separation = faceB.y;
    normal = dB.y > 0.0 ? RotB.col2 : RotB.col2.Neg();
  }

  // Setup clipping plane data based on the separating axis
  const frontNormal = new Vec2();
  const sideNormal = new Vec2();
  const incidentEdge = [new ClipVertex(), new ClipVertex()];
  let front: number;
  let negSide: number;
  let posSide: number;
  let negEdge: number;
  let posEdge: number;

  // Compute the clipping lines and the line segment to be clipped.
  switch (axis) {
    case Axis.FACE_A_X: {
      frontNormal.x = normal.x;
      frontNormal.y = normal.y;
      front = Vec2.Dot(posA, frontNormal) + hA.x;
      sideNormal.x = RotA.col2.x;
      sideNormal.y = RotA.col2.y;
      const side = Vec2.Dot(posA, sideNormal);
      negSide = -side + hA.y;
      posSide = side + hA.y;
      negEdge = EdgeNumbers.EDGE3;
      posEdge = EdgeNumbers.EDGE1;
      ComputeIncidentEdge(incidentEdge, hB, posB, RotB, frontNormal);
    }
      break;

    case Axis.FACE_A_Y: {
      frontNormal.x = normal.x;
      frontNormal.y = normal.y;
      front = Vec2.Dot(posA, frontNormal) + hA.y;
      sideNormal.x = RotA.col1.x;
      sideNormal.y = RotA.col1.y;
      const side = Vec2.Dot(posA, sideNormal);
      negSide = -side + hA.x;
      posSide = side + hA.x;
      negEdge = EdgeNumbers.EDGE2;
      posEdge = EdgeNumbers.EDGE4;
      ComputeIncidentEdge(incidentEdge, hB, posB, RotB, frontNormal);
    }
      break;

    case Axis.FACE_B_X: {
      frontNormal.x = -normal.x;
      frontNormal.y = -normal.y;
      front = Vec2.Dot(posB, frontNormal) + hB.x;
      sideNormal.x = RotB.col2.x;
      sideNormal.y = RotB.col2.y;
      const side = Vec2.Dot(posB, sideNormal);
      negSide = -side + hB.y;
      posSide = side + hB.y;
      negEdge = EdgeNumbers.EDGE3;
      posEdge = EdgeNumbers.EDGE1;
      ComputeIncidentEdge(incidentEdge, hA, posA, RotA, frontNormal);
    }
      break;

    case Axis.FACE_B_Y: {
      frontNormal.x = -normal.x;
      frontNormal.y = -normal.y;
      front = Vec2.Dot(posB, frontNormal) + hB.y;
      sideNormal.x = RotB.col1.x;
      sideNormal.y = RotB.col1.y;
      const side = Vec2.Dot(posB, sideNormal);
      negSide = -side + hB.x;
      posSide = side + hB.x;
      negEdge = EdgeNumbers.EDGE2;
      posEdge = EdgeNumbers.EDGE4;
      ComputeIncidentEdge(incidentEdge, hA, posA, RotA, frontNormal);
    }
      break;
  }

  // clip other face with 5 box planes (1 face plane, 4 edge planes)

  const clipPoints1 = [new ClipVertex(), new ClipVertex()];
  const clipPoints2 = [new ClipVertex(), new ClipVertex()];

  // Clip to box side 1
  let np = ClipSegmentToLine(clipPoints1, incidentEdge, sideNormal.Neg(), negSide, negEdge);

  if (np < 2) {
    return 0;
  }

  // Clip to negative box side 1
  np = ClipSegmentToLine(clipPoints2, clipPoints1, sideNormal, posSide, posEdge);

  if (np < 2) {
    return 0;
  }

  // Now clipPoints2 contains the clipping points.
  // Due to roundoff, it is possible that clipping removes all points.

  let numContacts = 0;
  for (let i = 0; i < 2; ++i) {
    const separation = Vec2.Dot(frontNormal, clipPoints2[i].v) - front;

    if (separation <= 0) {
      contacts[numContacts].separation = separation;
      contacts[numContacts].normal = normal;
      // slide contact point onto reference face (easy to cull)
      contacts[numContacts].position = Vec2.Subtract(clipPoints2[i].v, Vec2.Mul(separation, frontNormal));
      contacts[numContacts].feature = clipPoints2[i].fp;
      if (axis == Axis.FACE_B_X || axis == Axis.FACE_B_Y) {
        Flip(contacts[numContacts].feature);
      }
      ++numContacts;
    }
  }

  return numContacts;
}
