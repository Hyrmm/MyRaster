import { Vec3, Vec4 } from "../math/vector"
import { Raster } from "./raster"

export abstract class Shader {
    protected vertex: Array<Vec3> = []
    protected raster: Raster
    constructor(raster: Raster) { this.raster = raster }
    public vertexShader(vertex: Vec3, idx: number): Vec3 { return new Vec3(0, 0, 0) }
    public fragmentShader(barycentric: Vec3): [number, number, number, number] { return [0, 0, 0, 0] }
}

// 冯氏着色
// 逐像素获取法向量，用道法线贴图
export class PhoneShader extends Shader {
    private textureVetex: Array<Vec3> = []
    private viewSpaceVertex: Array<Vec3> = []
    public vertexShader(vertex: Vec3, idx: number): Vec3 {

        if (this.vertex.length == 3) {
            this.vertex = []
            this.viewSpaceVertex = []
            this.textureVetex = []
        }
        this.vertex.push(vertex)
        const vertexTextures = this.raster.model.textures
        this.textureVetex.push(new Vec3(vertexTextures[idx], vertexTextures[idx + 1], 0))

        let result = new Vec4(vertex.x, vertex.y, vertex.z, 1)
        
        // mvp
        const modelMatrix = this.raster.modelMatrix
        const viewMatrix = this.raster.viewMatrix
        const projectionMatrix = this.raster.projectionMatrix
        const mvpMatrix = projectionMatrix.multiply(viewMatrix.multiply(modelMatrix))

        result = mvpMatrix.multiplyVec(result)

        // viewport
        const viewPortMatrix = this.raster.viewPortMatrix
        result = viewPortMatrix.multiplyVec(result)

        this.viewSpaceVertex.push(mvpMatrix.multiplyVec(new Vec4(vertex.x, vertex.y, vertex.z, 1)).toVec3())

        return result.toVec3()
    }

    public fragmentShader(barycentric: Vec3): [number, number, number, number] {


        const u = this.textureVetex[0].x * barycentric.x + this.textureVetex[1].x * barycentric.y + this.textureVetex[2].x * barycentric.z
        const v = this.textureVetex[0].y * barycentric.x + this.textureVetex[1].y * barycentric.y + this.textureVetex[2].y * barycentric.z
        const x = this.viewSpaceVertex[0].x * barycentric.x + this.viewSpaceVertex[1].x * barycentric.y + this.viewSpaceVertex[2].x
        const y = this.viewSpaceVertex[0].y * barycentric.x + this.viewSpaceVertex[1].y * barycentric.y + this.viewSpaceVertex[2].y
        const z = this.viewSpaceVertex[0].z * barycentric.x + this.viewSpaceVertex[1].z * barycentric.y + this.viewSpaceVertex[2].z

        const corlor = this.raster.textureDiffuse.sampling(u, v)
        const normals = this.raster.textureNormal.sampling(u, v)

        if (!corlor || !normals) return [255, 255, 255, 255]

        const light = Vec3.neg(this.raster.lightDir).normalize()
        const normal = new Vec3(normals[0] * 2 / 255 - 1, normals[1] * 2 / 255 - 1, normals[2] * 2 / 255 - 1).normalize()


        // 环境光
        const ambient = .5

        // 漫反射
        const diffuse = Math.max(Vec3.dot(normal, light), 0)

        // 镜面反射
        const reflect = normal.scale(2 * Vec3.dot(normal, light)).sub(light)
        const viewVec = new Vec3(0, 0, 0).sub(new Vec3(x, y, z)).normalize()
        const specular = Math.pow(Math.max(Vec3.dot(reflect, viewVec), 0), 256)

        const intensity = ambient + diffuse + specular
        return [corlor[0] * intensity, corlor[1] * intensity, corlor[2] * intensity, corlor[3]]
    }
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

        let result = new Vec4(vertex.x, vertex.y, vertex.z, 1)

        // mvp
        const modelMatrix = this.raster.modelMatrix
        const viewMatrix = this.raster.viewMatrix
        const projectionMatrix = this.raster.projectionMatrix
        const mvpMatrix = projectionMatrix.multiply(viewMatrix.multiply(modelMatrix))
        result = mvpMatrix.multiplyVec(result)

        // viewport
        const viewPortMatrix = this.raster.viewPortMatrix
        result = viewPortMatrix.multiplyVec(result)

        return result.toVec3()
    }

    public fragmentShader(barycentric: Vec3): [number, number, number, number] {
        const lightIntensity = this.lightIntensityVetex[0] * barycentric.x + this.lightIntensityVetex[1] * barycentric.y + this.lightIntensityVetex[2] * barycentric.z
        return [255 * lightIntensity, 255 * lightIntensity, 255 * lightIntensity, 255]
    }
}

// 平面着色
// 逐三角形着色,根据三角形顶点，顶点叉乘计算三角面法向量，计算光照强度
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

        let result = new Vec4(vertex.x, vertex.y, vertex.z, 1)

        // mvp
        const modelMatrix = this.raster.modelMatrix
        const viewMatrix = this.raster.viewMatrix
        const projectionMatrix = this.raster.projectionMatrix
        const mvpMatrix = projectionMatrix.multiply(viewMatrix.multiply(modelMatrix))
        result = mvpMatrix.multiplyVec(result)

        // viewport
        const viewPortMatrix = this.raster.viewPortMatrix
        result = viewPortMatrix.multiplyVec(result)

        return result.toVec3()
    }

    public fragmentShader(barycentric: Vec3): [number, number, number, number] {
        return [255 * this.lightIntensity, 255 * this.lightIntensity, 255 * this.lightIntensity, 255]
    }
}