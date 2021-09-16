import { Vec2 } from "./Vec2";

export class Mat22 {
  col1: Vec2;
  col2: Vec2;

  static Mul(A: Mat22, v: Vec2): Vec2;

  static Mul(A: Mat22, B: Mat22): Mat22;

  static Mul(A: Mat22, vOrB: Vec2 | Mat22): Vec2 | Mat22 {
    if (vOrB instanceof Vec2) {
      return new Vec2(A.col1.x * vOrB.x + A.col2.x * vOrB.y, A.col1.y * vOrB.x + A.col2.y * vOrB.y);
    } else {
      return new Mat22(Mat22.Mul(A, vOrB.col1), Mat22.Mul(A, vOrB.col2));
    }
  }

  static Add(A: Mat22, B: Mat22): Mat22 {
    return new Mat22(Vec2.Add(A.col1, B.col1), Vec2.Add(A.col2, B.col2));
  }

  static Abs(A: Mat22): Mat22 {
    return new Mat22(Vec2.Abs(A.col1), Vec2.Abs(A.col2));
  }

  constructor();

  constructor(angle: number);

  constructor(col1: Vec2, col2: Vec2);

  constructor(colOrAngle?: Vec2 | number, col2?: Vec2) {
    if (colOrAngle == undefined) {
      this.col1 = new Vec2();
      this.col2 = new Vec2();
    } else if (typeof colOrAngle == "number") {
      const c = Math.cos(colOrAngle);
      const s = Math.sin(colOrAngle);
      this.col1 = new Vec2(c, s);
      this.col2 = new Vec2(-s, c);
    } else {
      this.col1 = new Vec2(colOrAngle.x, colOrAngle.y);
      this.col2 = new Vec2(col2.x, col2.y);
    }
  }

  Transpose(): Mat22 {
    return new Mat22(new Vec2(this.col1.x, this.col2.x), new Vec2(this.col1.y, this.col2.y));
  }

  Invert(): Mat22 {
    const a = this.col1.x,
      b = this.col2.x,
      c = this.col1.y,
      d = this.col2.y;
    const B = new Mat22();
    let det = a * d - b * c;
    console.assert(det != 0.0);
    det = 1.0 / det;
    B.col1.x = det * d;
    B.col2.x = -det * b;
    B.col1.y = -det * c;
    B.col2.y = det * a;
    return B;
  }
}
