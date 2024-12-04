import { Vec3 } from "../math/vector"
import { Matrix44 } from "../math/matrix"

export enum ProjectType {
    Perspective,
    Orthogonal
}

export type CameraParam = {
    sceenWidth: number,
    sceenHeight: number,
    fovY: number,
    aspect: number,
    near: number,
    far: number,
    projectType: ProjectType
    pos: Vec3,
    lookAt: Vec3,
    up: Vec3
}

export class Camera {


    private fovY: number
    private aspect: number

    private far: number
    private near: number

    private projectType: ProjectType

    private screenWidth: number
    private screenHeight: number

    public up: Vec3
    public pos: Vec3
    public lookAt: Vec3

    private transMatExc: Matrix44
    private rotationMatExc: Matrix44


    constructor(params: CameraParam) {

        this.fovY = params.fovY
        this.aspect = params.aspect

        this.far = params.far
        this.near = params.near

        this.projectType = params.projectType

        this.up = params.up
        this.pos = params.pos
        this.lookAt = params.lookAt

        this.screenWidth = params.sceenWidth
        this.screenHeight = params.sceenHeight

        this.transMatExc = new Matrix44()
        this.rotationMatExc = new Matrix44()
    }

    public look(): Matrix44 {

        /**
         * 前提定义：
         * 0、基于右手系，X 叉乘 Y 等于+Z，Y 叉乘 Z 等于+X
         * 1、原相机-原本和世界坐标系重合的相机
         * 2、先相机-原相机经过矩阵变化后等到现在的相机状态，也就是pos,lookAt,up组成的状态
         * 
         * 视图变化个人理解:
         * 0、视图变化目的就是将世界坐标系和相机坐标做一个统一，方便后面投影计算，因为统一了坐标系，默认将原点作为投影的出发点定义一些平面和参数
         * 1、首先一个常识问题，对一个物体和相机以相同的方向和角度旋转，相机所观察到的画面是不不会变的，以互为相反的方向旋转，相机所观察的画面是我们显示生活中看到的画面
         * 2、想象原相机在世界坐标系下原点位置，在经过旋转、平移等操作后，得到我们现在的相机状态，也就是相机坐标系，vecZ,vecX,vecY
         * 3、由矩阵的本质，相机旋转、平移操作矩阵本质上就是现在相机坐标系的基向量，可以理解为原本和世界坐标系重合的相机经过现在的相机的基向量坐标系进行的矩阵变化
         * 4、理论上我们只要将世界坐标系下的所有点都转换到相机坐标系下，也就是将所有世界左边乘上如今相机的基向量的组成的矩阵，由于相机操作和物体操作时相反的，所以应该是乘上如今相机的基向量的组成的矩阵的逆矩阵
        */
        // 通过pos、lookAt、up求求现在相机的基向量
        const vecZ = this.pos.sub(this.lookAt).normalize()
        const vecX = this.up.cross(vecZ).normalize()
        const vecY = vecZ.cross(vecX).normalize()

        /**
         * oriTransMat：
         * [0, 0, 0, pos.x],
         * [0, 0, 0, pos.y],
         * [0, 0, 0, pos.z],
         * [0, 0, 0, 1]
         * 
         * oriRotationMat:
         * [vecX.x, vecY.x, vecZ]
         * [vecX.y, vecY.y, vecZ]
         * [vecX.z, vecY.z, vecZ]
         * [0, 0, 0, 1]
         * 
         * 现相机 = oriTransMat *  oriRotationMat * 原相机
         * 
         * 现在将世界坐标系下的点转换到相机坐标系下，可以想象原相加到先相机也是一个世界坐标系下的坐标到现相机的坐标系下
         * 考虑相机操作和物体是相反的操作，所以将世界坐标下的点等于
         * 值得关注的是，求逆后是先平移后旋转
         * (oriTransMat* oriRotationMat)^-1  =  oriRotationMat^-1 * oriTransMat^-1
        */
        const revTransMat = new Matrix44([
            [1, 0, 0, -this.pos.x],
            [0, 1, 0, -this.pos.y],
            [0, 0, 1, -this.pos.z],
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

    public orthogonal(): Matrix44 {

        const left = -this.screenWidth / 2
        const right = this.screenWidth / 2
        const bottom = -this.screenHeight / 2
        const top = this.screenHeight / 2

        const scaleMat = new Matrix44([
            [2 / (right - left), 0, 0, 0],
            [0, 2 / (top - bottom), 0, 0],
            [0, 0, 2 / (this.near - this.far), 0],
            [0, 0, 0, 1]
        ])

        const transMat = new Matrix44([
            [1, 0, 0, -((right + left) / 2)],
            [0, 1, 0, -((top + bottom) / 2)],
            [0, 0, 1, -((this.far + this.near) / 2)],
            [0, 0, 0, 1]
        ])
        return scaleMat.multiply(transMat)
    }

    public perspective(): Matrix44 {
        // 切换perspective分支查看透视投影实现
        return new Matrix44([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ])
    }

    public getViewMat(): Matrix44 {
        const baseViewMat = this.look()
        return this.transMatExc.transpose().multiply(this.rotationMatExc.transpose().multiply(baseViewMat))
    }

    public getProjectMat(): Matrix44 {
        if (this.projectType == ProjectType.Orthogonal) {
            return this.orthogonal()
        } else {
            return this.perspective()
        }
    }

    public rotatedCamera(mat: Matrix44): void {
        this.rotationMatExc = mat.multiply(this.rotationMatExc)
    }

    public translatedCamera(mat: Matrix44): void {
        this.transMatExc = mat.multiply(this.transMatExc)
    }
}