import { Vec3 } from "../math/vector"
import { Matrix44 } from "../math/matrix"
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

    public lookAt(pos: Vec3, lookAt: Vec3, up: Vec3): Matrix44 {
        // 基于右手坐标系，所以 x * y = +z , 且相机永远朝向 -z 方向

        // 相机坐标系的基向量
        const vecZ = pos.sub(lookAt).normalize()
        const vecX = up.cross(vecZ).normalize()
        const vecY = vecZ.cross(vecX)
        const rotationMat = new Matrix44([
            [vecX.x, vecY.x, vecZ.x, 0],
            [vecX.y, vecY.y, vecZ.y, 0],
            [vecX.z, vecY.z, vecZ.z, 0],
            [0, 0, 0, 1]
        ])
        console.log(rotationMat)

        // 平移矩阵(将世界坐标系原点移动到相机坐标系原点)
        const transMat = new Matrix44()
        transMat.setCol(3, [-pos.x, -pos.y, -pos.z, 1])

        // 合成view矩阵，先平移后旋转
        return transMat.multiply(rotationMat)
    }

    public projection(width: number, height: number): Matrix44 {
        return new Matrix44()
    }

}