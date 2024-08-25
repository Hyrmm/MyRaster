import { Vec3, Vec4 } from "../math/vector"
import { Raster } from "./raster"

export abstract class Shader {
    protected raster: Raster
    constructor(raster: Raster) { this.raster = raster }
    public vertexShader(vertex: Vec3): Vec4 { return new Vec4(0, 0, 0, 0) }
    public fragmentShader(vertex1: Vec3, vertex2: Vec3, vertex3: Vec3): void { }
}


// 高洛德着模型
export class GouraudShader extends Shader {

    public vertexShader(vertex: Vec3): Vec4 {
        return new Vec4(vertex.x, vertex.y, vertex.z, 1)
    }

    public fragmentShader() {

    }
}


export class FlatShader extends Shader {

    public vertexShader(vertex: Vec3): Vec4 {
        const modelMatrix = this.raster.modelMatrix
        const viewMatrix = this.raster.viewMatrix
        const projectionMatrix = this.raster.projectionMatrix
        const mvpMatrix = projectionMatrix.multiply(viewMatrix.multiply(modelMatrix))

        const viewPortMatrix = this.raster.viewPortMatrix
        const mergedMatrix = viewPortMatrix.multiply(mvpMatrix)

        return mergedMatrix.multiplyVec(new Vec4(vertex.x, vertex.y, vertex.z, 1))
    }

    public fragmentShader() {

    }
}