import { Vec3 } from "../math/vector"
import { Matrix44 } from "../math/matrix"

export enum ProjectType {
    Perspective,
    Orthogonal
}
export class Camera {


    private fovY: number
    private aspect: number
    private far: number
    private near: number

    constructor(fovY: number, aspect: number, near: number, far: number, projectType: ProjectType) {
        this.fovY = fovY
        this.far = far
        this.near = near
        this.aspect = aspect
    }

    public lookAt(pos: Vec3, lookAt: Vec3, up: Vec3): Matrix44 {
        // 定义：
        // 基础：基于右手系，X 叉乘 Y 等于+Z
        // 原相机:原本和世界坐标系重合的相机
        // 先相机:原相机经过矩阵变化后等到现在的相机状态，也就是pos,lookAt,up组成的状态

        // 视图变化个人理解:
        // 0、首先一个常识问题，对一个物体和相机以相同的方向和角度旋转，相机所观察到的画面是不不会变的，以互为相反的方向旋转，相机所观察的画面是我们显示生活中看到的画面
        // 1、想象相机原本和世界坐标系重合，在经过旋转、平移等操作后，等到我们现在的相机状态，也就是相机坐标系，vecZ,vecX,vecY
        // 2、由矩阵的本质，相机旋转、平移操作矩阵本质上就是现在相机坐标系的基向量，可以理解为原本和世界坐标系重合的相机经过现在的相机的基向量坐标系进行的矩阵变化
        // 3、理论上我们只要将世界坐标系下的所有点都转换到相机坐标系下，也就是将所有世界左边乘上如今相机的基向量的组成的矩阵，由于相机操作和物体操作时相反的，所以应该是乘上如今相机的基向量的组成的矩阵的逆矩阵

        // 通过pos、lookAt、up求求现在相机的基向量
        const vecZ = pos.sub(lookAt).normalize()
        const vecX = up.cross(vecZ).normalize()
        const vecY = vecZ.cross(vecX).normalize()

        // 现相机 = oriTransMat *  oriRotationMat * 原相机
        // oriTransMat = new Matrix44([
        //     [0, 0, 0, pos.x],
        //     [0, 0, 0, pos.y],
        //     [0, 0, 0, pos.z],
        //     [0, 0, 0, 1]
        // ])
        // oriRotationMat = new Matrix44([
        //     [vecX.x, vecY.x, vecZ.x, 0],
        //     [vecX.y, vecY.y, vecZ.y, 0],
        //     [vecX.z, vecY.z, vecZ.z, 0],
        //     [0, 0, 0, 1]
        // ])

        // 现在将世界坐标系下的点转换到相机坐标系下，可以想象原相加到先相机也是一个世界坐标系下的坐标到现相机的坐标系下
        // 考虑相机操作和物体是相反的操作，所以将世界坐标下的点等于
        // 值得关注的是，求逆后是先平移后旋转
        // (oriTransMat* oriRotationMat)^-1  =  oriRotationMat^-1 * oriTransMat^-1

        const revTransMat = new Matrix44([
            [1, 0, 0, -pos.x],
            [0, 1, 0, -pos.y],
            [0, 0, 1, -pos.z],
            [0, 0, 0, 1]
        ])

        const revRotationMat = new Matrix44([
            [vecX.x, vecX.y, vecX.z, 0],
            [vecY.x, vecY.y, vecY.z, 0],
            [vecZ.x, vecZ.y, vecZ.z, 0],
            [0, 0, 0, 1]
        ])

        // 合成view矩阵，先平移后旋转
        return revRotationMat.multiply(revTransMat)
    }

    public projection(width: number, height: number): Matrix44 {
        return new Matrix44()
    }

}