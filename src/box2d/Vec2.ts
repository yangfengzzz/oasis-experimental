export class Vec2 {
    public x: number;
    public y: number;

    static Dot(a: Vec2, b: Vec2): number {
        return a.x * b.x + a.y * b.y;
    }

    static Cross(a: Vec2, b: Vec2): number;

    static Cross(a: number, b: Vec2): Vec2;

    static Cross(a: Vec2, b: number): Vec2;

    static Cross(a: Vec2 | number, b: Vec2 | number): number | Vec2 {
        if (typeof a == "number" && typeof b != "number") {
            return new Vec2(-a * b.y, a * b.x);
        } else if (typeof a != "number" && typeof b == "number") {
            return new Vec2(b * a.y, -b * a.x);
        } else if (typeof a != "number" && typeof b != "number") {
            return a.x * b.y - a.y * b.x;
        }
    }

    static Add(a: Vec2, b: Vec2): Vec2 {
        return new Vec2(a.x + b.x, a.y + b.y);
    }

    static Subtract(a: Vec2, b: Vec2): Vec2 {
        return new Vec2(a.x - b.x, a.y - b.y);
    }

    static Mul(s: number, v: Vec2): Vec2 {
        return new Vec2(s * v.x, s * v.y);
    }

    static Abs(a: Vec2): Vec2 {
        return new Vec2(Math.abs(a.x), Math.abs(a.y));
    }

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    Set(x_: number, y_: number) {
        this.x = x_;
        this.y = y_;
    }

    Neg(): Vec2 {
        return new Vec2(-this.x, -this.y);
    }

    AddAssign(v: Vec2) {
        this.x += v.x;
        this.y += v.y;
    }

    SubtractAssign(v: Vec2) {
        this.x -= v.x;
        this.y -= v.y;
    }

    MultiAssign(a: number) {
        this.x *= a;
        this.y *= a;
    }

    Length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}
