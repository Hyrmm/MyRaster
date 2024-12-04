export class Vec3 {

    public x: number;
    public y: number;
    public z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x
        this.y = y
        this.z = z
    }

    static sub(v1: Vec3, v2: Vec3): Vec3 {
        return new Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z)
    }

    static dot(v1: Vec3, v2: Vec3): number {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
    }

    static mul(v1: Vec3, v2: Vec3): Vec3 {
        return new Vec3(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z)
    }

    static neg(v1: Vec3): Vec3 {
        return new Vec3(-v1.x, -v1.y, -v1.z)
    }

    static plus(v1: Vec3, v2: Vec3): Vec3 {
        return new Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z)
    }

    public sub(v: Vec3): Vec3 {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z)
    }

    public scale(s: number): Vec3 {
        return new Vec3(this.x * s, this.y * s, this.z * s)
    }

    public cross(v: Vec3): Vec3 {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;
        return new Vec3(x, y, z);
    }

    public normalize(): Vec3 {
        const length = this.length
        return new Vec3(this.x / length, this.y / length, this.z / length)
    }

    public toVec4(w: number = 1): Vec4 {
        return new Vec4(this.x, this.y, this.z, w)
    }



    public get length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
}

export class Vec4 {

    public x: number;
    public y: number;
    public z: number;
    public w: number;

    constructor(x: number, y: number, z: number, w: number) {
        this.x = x
        this.y = y
        this.z = z
        this.w = w
    }

    public div(v: number): Vec4 {
        return new Vec4(this.x / v, this.y / v, this.z / v, this.w / v)
    }

    public toVec3(): Vec3 {
        return new Vec3(this.x, this.y, this.z)
    }
}