import { Mesh } from "webgl-obj-loader";
import { FrameBuffer } from "../utils/frameBuffer";
import african_head from "../model/african_head";
import { Shader, GouraudShader, FlatShader } from "../core/shader";
import { Camera } from "./camera";
import { Vec3, Vec4 } from "../math/vector";
import { Matrix44 } from "../math/matrix"


export class Raster {

    private width: number
    private height: number

    private frameBuffer: FrameBuffer
    private vertexsBuffer: Array<number>
    private trianglseBuffer: Array<number>

    private model: Mesh
    private shader: Shader
    private camera: Camera



    public viewMatrix: Matrix44
    public viewPortMatrix: Matrix44
    public projectionMatrix: Matrix44

    private context: CanvasRenderingContext2D

    constructor(w: number, h: number, context: CanvasRenderingContext2D) {

        this.width = w
        this.height = h

        this.context = context
        this.model = new Mesh(african_head)
        this.shader = new FlatShader(this)
        this.camera = new Camera(45, w / h, 0.1, 1000)

        this.vertexsBuffer = this.model.vertices
        this.trianglseBuffer = this.model.indices
        this.frameBuffer = new FrameBuffer(w, h)

        this.viewMatrix = this.camera.lookAt(new Vec3(0, 0, 1000), new Vec3(0, 0, 0), new Vec3(0, 1, 0))
        // this.projectionMatrix = this.camera.projection(w, h, 45)
        this.viewPortMatrix = new Matrix44([
            [this.width / 2, 0, 0, this.width / 2],
            [0, -this.height / 2, 0, this.height / 2],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ])
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

            const screenCoords = []

            // 顶点计算: 对每个顶点进行矩阵运算(MVP)，输出顶点的屏幕坐标，顶点着色阶段
            for (let j = 0; j < 3; j++) {
                const idx = this.trianglseBuffer[i + j]
                const vertex = new Vec3(this.vertexsBuffer[idx + 0], this.vertexsBuffer[idx + 1], this.vertexsBuffer[idx + 2])
                const vertexScreen = this.shader.vertexShader(vertex)
                // screenCoords.push(this.shader.vertexShader(vertex))
                this.frameBuffer.setPixel(vertexScreen.x, vertexScreen.y, [255, 0, 0, 255])
            }
            // console.log(screenCoords)
            // // 绘制三角形:通过三个顶点计算包含在三角形内的屏幕像素，并对包含像素上色，片元着色阶段
            // this.triangle(screenCoords)

        }


        this.context.putImageData(this.frameBuffer.frameData, 0, 0)
    }

    public triangle(screenCoords: Array<Vec4>) {
        // 方式一：完整的遍历屏幕所有点，计算是否在三角形内，并进行着色
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                
                // const barycentric = this.barycentric(x, y, screenCoords)
            }
        }
    }

    public line(screenCoords: Array<Vec4>) {
    }
}

