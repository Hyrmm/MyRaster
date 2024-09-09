import { Vec3, Vec4 } from "../math/vector"
import { Raster } from "./raster"

export abstract class Shader {
    protected vertex: Array<Vec3> = []
    protected raster: Raster
    constructor(raster: Raster) { this.raster = raster }
    public vertexShader(vertex: Vec3, idx: number): Vec3 { return new Vec3(0, 0, 0) }
    public fragmentShader(barycentric: Vec3): [number, number, number, number] { return [0, 0, 0, 0] }
}


// 高洛德着色
// 逐顶点法计算顶点的光照强度，当前像素插值计算光照强度
export class GouraudShader extends Shader {

    private lightIntensityVetex: Array<number> = []
    public vertexShader(vertex: Vec3, idx: number): Vec3 {

        if (this.vertex.length == 3) {
            this.vertex = []
            this.lightIntensityVetex = []
        }
        this.vertex.push(vertex)
        const vertexNormals = this.raster.model.vertexNormals
        const vertexNormal = new Vec3(vertexNormals[idx], vertexNormals[idx + 1], vertexNormals[idx + 2]).normalize()
        this.lightIntensityVetex.push(Vec3.dot(vertexNormal, Vec3.neg(this.raster.lightDir).normalize()))

        // mvp、viewport
        const modelMatrix = this.raster.modelMatrix
        const viewMatrix = this.raster.viewMatrix
        const projectionMatrix = this.raster.projectionMatrix
        const mvpMatrix = projectionMatrix.multiply(viewMatrix.multiply(modelMatrix))
        const viewPortMatrix = this.raster.viewPortMatrix
        const mergedMatrix = viewPortMatrix.multiply(mvpMatrix)

        return mergedMatrix.multiplyVec(new Vec4(vertex.x, vertex.y, vertex.z, 1)).toVec3()
    }

    public fragmentShader(barycentric: Vec3): [number, number, number, number] {
        const lightIntensity = this.lightIntensityVetex[0] * barycentric.x + this.lightIntensityVetex[1] * barycentric.y + this.lightIntensityVetex[2] * barycentric.z
        return [255 * lightIntensity, 255 * lightIntensity, 255 * lightIntensity, 255]
    }
}

// 逐三角形着色,根据三角形顶点，得三角面法向量，计算光照强度
export class FlatShader extends Shader {

    private normal: Vec3 = new Vec3(0, 0, 0)
    private lightIntensity: number = 0

    public vertexShader(vertex: Vec3): Vec3 {
        if (this.vertex.length == 3) this.vertex = []

        this.vertex.push(vertex)
        if (this.vertex.length == 3) {
            this.normal = this.vertex[1].sub(this.vertex[0]).cross(this.vertex[2].sub(this.vertex[0])).normalize()
            this.lightIntensity = Vec3.dot(Vec3.neg(this.raster.lightDir).normalize(), this.normal)
        }

        // mvp、viewport
        const modelMatrix = this.raster.modelMatrix
        const viewMatrix = this.raster.viewMatrix
        const projectionMatrix = this.raster.projectionMatrix
        const mvpMatrix = projectionMatrix.multiply(viewMatrix.multiply(modelMatrix))
        const viewPortMatrix = this.raster.viewPortMatrix
        const mergedMatrix = viewPortMatrix.multiply(mvpMatrix)

        return mergedMatrix.multiplyVec(new Vec4(vertex.x, vertex.y, vertex.z, 1)).toVec3()
    }

    public fragmentShader(barycentric: Vec3): [number, number, number, number] {
        return [255 * this.lightIntensity, 255 * this.lightIntensity, 255 * this.lightIntensity, 255]
    }
}