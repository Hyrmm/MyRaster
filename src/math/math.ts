import { Vec3, Vec4 } from "./vector";

export const barycentric = (triangles: Vec4[], p: Vec3): Vec3 => {
    const a = triangles[0]
    const b = triangles[1]
    const c = triangles[2]

    const denominator = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y)

    const lambda1 = ((b.y - c.y) * (p.x - c.x) + (c.x - b.x) * (p.y - c.y)) / denominator
    const lambda2 = ((c.y - a.y) * (p.x - c.x) + (a.x - c.x) * (p.y - c.y)) / denominator
    const lambda3 = 1 - lambda1 - lambda2;

    return new Vec3(lambda1, lambda2, lambda3)
}

export const det = (v1, v2) => {
    return v1.x * v2.y - v1.y * v2.x;
}