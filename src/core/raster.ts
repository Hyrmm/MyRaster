import { Mesh } from "webgl-obj-loader";
import { FrameBuffer } from "../utils/frameBuffer";
import african_head from "../model/african_head";
import { Shader, GouraudShader, FlatShader } from "../core/shader";
import { Camera, ProjectType, CameraParam } from "./camera";
import { Vec3, Vec4 } from "../math/vector";
import { barycentric } from "../math/math"
import { Matrix44 } from "../math/matrix"


export class Raster {

    private width: number
    private height: number
    private fitType: string

    private frameBuffer: FrameBuffer
    private vertexsBuffer: Array<number>
    private trianglseBuffer: Array<number>

    private model: Mesh
    private shader: Shader
    private camera: Camera

    public viewMatrix: Matrix44
    public modelMatrix: Matrix44
    public viewPortMatrix: Matrix44
    public projectionMatrix: Matrix44

    private context: CanvasRenderingContext2D


    constructor(w: number, h: number, context: CanvasRenderingContext2D) {

        const defultCameraConfig: CameraParam = {
            fovY: 45, aspect: w / h,
            near: -0.1, far: -1024,
            projectType: ProjectType.Orthogonal,
            up: new Vec3(0, 1, 0), pos: new Vec3(0, 0, 1), lookAt: new Vec3(0, 0, 0),
            sceenHeight: h, sceenWidth: w
        }

        this.width = w
        this.height = h
        this.fitType = "height"

        this.context = context
        this.model = new Mesh(african_head)
        this.shader = new FlatShader(this)
        this.camera = new Camera(defultCameraConfig)

        this.vertexsBuffer = this.model.vertices
        this.trianglseBuffer = this.model.indices
        this.frameBuffer = new FrameBuffer(w, h)

        this.initMatrix()
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

            const screenCoords = []

            // 顶点计算: 对每个顶点进行矩阵运算(MVP)，输出顶点的屏幕坐标，顶点着色阶段
            for (let j = 0; j < 3; j++) {
                const idx = this.trianglseBuffer[i + j]
                const vertex = new Vec3(this.vertexsBuffer[idx * 3 + 0], this.vertexsBuffer[idx * 3 + 1], this.vertexsBuffer[idx * 3 + 2])
                const vertexScreen = this.shader.vertexShader(vertex)
                // screenCoords.push(this.shader.vertexShader(vertex))
                if (vertexScreen.z < -1 || vertexScreen.z > 1) continue
                this.frameBuffer.setPixel(vertexScreen.x, vertexScreen.y, [255, 0, 0, 255])
            }
            // console.log(screenCoords)
            // // 绘制三角形:通过三个顶点计算包含在三角形内的屏幕像素，并对包含像素上色，片元着色阶段
            // this.triangle(screenCoords)

        }

        this.context.putImageData(this.frameBuffer.frameData, 0, 0)
    }

    public triangle(screenCoords: Array<Vec4>) {
    }

    public initMatrix() {

        // 模型矩阵：对模型进行平移、旋转、缩放等操作，得到模型矩阵
        // 这里模型文件坐标系也是右手系，且顶点坐标范围在-1^3到1^3之间,所以模型需要缩放下
        // 对模型的Z坐标进行平移，使得模型在相机前方(我们定义的相机在z=1上，往-z方向看)
        this.modelMatrix = new Matrix44([
            [240, 0, 0, 0],
            [0, 240, 0, 0],
            [0, 0, 240, -400],
            [0, 0, 0, 1]
        ])

        // 视图矩阵：将世界坐标系转换到观察(相机)坐标系，得到视图矩阵
        this.viewMatrix = this.camera.getViewMat()

        // 投影矩阵：通过定义的观察空间范围(近平面、远平面、fov、aspset等参数定义)，将该空间坐标映射到-1^3到1^3的范围，得到投影矩阵
        // 值得注意的是，投影矩阵在经过视图矩阵变换后，坐标系的已经是观察坐标系，相机默认在原点上，且关于空间的定义也是基于这个坐标系
        // 这里可以很方便做空间裁剪，z坐标不在-1~1范围内的物体将被裁剪掉
        this.projectionMatrix = this.camera.getProjectMat()

        // 视口矩阵：将观察坐标系转换到屏幕坐标系，得到视口矩阵
        // 这里-this.height是因为canvas屏幕坐标系的原点在左上角，而模型坐标系的原点在中心,要进行坐标反转
        this.viewPortMatrix = new Matrix44([
            [this.width / 2, 0, 0, this.width / 2],
            [0, -this.height / 2, 0, this.height / 2],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ])
    }

}

