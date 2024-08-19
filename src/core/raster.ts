import { Mesh } from "webgl-obj-loader";
import { FrameBuffer } from "../utils/frameBuffer";
import african_head from "../model/african_head";
import { Shader, GouraudShader } from "../core/shader";


export class Raster {

    private width: number
    private height: number

    private frameBuffer: FrameBuffer
    private vertexsBuffer: Array<number>
    private trianglseBuffer: Array<number>

    private model: Mesh
    private shader: Shader

    private context: CanvasRenderingContext2D

    constructor(w: number, h: number, context: CanvasRenderingContext2D) {

        this.width = w
        this.height = h

        this.context = context
        this.model = new Mesh(african_head)
        this.shader = new GouraudShader(this)

        this.vertexsBuffer = this.model.vertices
        this.trianglseBuffer = this.model.indices
        this.frameBuffer = new FrameBuffer(w, h)

        console.log(this.model)
    }


    public clear() {

        for (let byteOffset = 0; byteOffset < this.frameBuffer.frameData.data.length; byteOffset += 4) {
            const [rIdx, gIdx, bIdx, aIdx] = [byteOffset + 0, byteOffset + 1, byteOffset + 2, byteOffset + 3]
            this.frameBuffer.frameData.data[rIdx] = 0
            this.frameBuffer.frameData.data[gIdx] = 0
            this.frameBuffer.frameData.data[bIdx] = 0
            this.frameBuffer.frameData.data[aIdx] = 255
        }
    }


    public render() {
        this.clear()



        for (let i = 0; i < this.trianglseBuffer.length; i += 3) {

            // 顶点计算: 对每个顶点进行矩阵运算(MVP)，输出顶点的屏幕坐标，顶点着色阶段
            const idx1 = this.trianglseBuffer[0]
            const idx2 = this.trianglseBuffer[1]
            const idx3 = this.trianglseBuffer[2]
            const [x1, y1, z1] = [this.vertexsBuffer[idx1 + 0], this.vertexsBuffer[idx1 + 1], this.vertexsBuffer[idx1 + 2]]
            const [x2, y2, z2] = [this.vertexsBuffer[idx2 + 0], this.vertexsBuffer[idx2 + 1], this.vertexsBuffer[idx2 + 2]]
            const [x3, y3, z3] = [this.vertexsBuffer[idx3 + 0], this.vertexsBuffer[idx3 + 1], this.vertexsBuffer[idx3 + 2]]





            // 绘制三角形:通过三个顶点计算包含在三角形内的屏幕像素，并对包含像素上色，片元着色阶段
        }


        this.context.putImageData(this.frameBuffer.frameData, 0, 0)
    }
}

