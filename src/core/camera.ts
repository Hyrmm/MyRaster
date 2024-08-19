import { Vec3 } from "../math/vector"
import { Matrix4 } from "../math/matrix"
export class Camera {


    private fovY: number
    private aspect: number
    private far: number
    private near: number

    constructor(fovY: number, aspect: number, near: number, far: number) {
        this.fovY = fovY
        this.far = far
        this.near = near
        this.aspect = aspect
    }

    public lookAt(pos: Vec3, lookAt: Vec3, up: Vec3): void {
        // 基于右手坐标系，所以 x * y = +z , 且相机永远朝向 -z 方向

        // 相机坐标系的基向量
        const vecZ = pos.sub(lookAt).normalize()
        const vecX = up.cross(vecZ).normalize()
        const vecY = vecZ.cross(vecX)


        // 平移矩阵(将世界坐标系原点移动到相机坐标系原点)
        const transMat = new Matrix4()
        transMat.setCol(3, [-pos.x, -pos.y, -pos.z, 1])

    }


}