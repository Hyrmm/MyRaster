import { Mesh } from "webgl-obj-loader";
import { FrameBuffer } from "../utils/frameBuffer";
import { DepthBuffer } from "../utils/depthBuffer";
import african_head from "../model/african_head";
import { Shader, GouraudShader, FlatShader, PhoneShader } from "../core/shader";
import { Camera, ProjectType, CameraParam } from "./camera";
import { Vec3, Vec4 } from "../math/vector";
import { barycentric } from "../math/math"
import { Matrix44 } from "../math/matrix"
import { Texture } from "../core/texture"


export class Raster {

    private width: number
    private height: number

    private frameBuffer: FrameBuffer
    private depthBuffer: DepthBuffer
    private vertexsBuffer: Array<number>
    private trianglseBuffer: Array<number>

    public model: Mesh
    public shader: Shader
    public camera: Camera
    public lightDir: Vec3

    public viewMatrix: Matrix44
    public modelMatrix: Matrix44
    public viewPortMatrix: Matrix44
    public projectionMatrix: Matrix44

    public textureNormal: Texture
    public textureDiffuse: Texture

    private context: CanvasRenderingContext2D

    constructor(w: number, h: number, context: CanvasRenderingContext2D) {

        const defultCameraConfig: CameraParam = {
            fovY: 60, aspect: w / h,
            near: -0.1, far: -400,
            projectType: ProjectType.Orthogonal,
            up: new Vec3(0, 1, 0), pos: new Vec3(0, 0, 2), lookAt: new Vec3(0, 0, -1),
            sceenHeight: h, sceenWidth: w
        }

        this.width = w
        this.height = h

        this.context = context
        this.model = new Mesh(african_head, { enableWTextureCoord: true })
        this.shader = new PhoneShader(this)
        this.camera = new Camera(defultCameraConfig)
        this.lightDir = new Vec3(0, 0, -1)

        this.vertexsBuffer = this.model.vertices
        this.trianglseBuffer = this.model.indices
        this.frameBuffer = new FrameBuffer(w, h)
        this.depthBuffer = new DepthBuffer(w, h)

        this.textureNormal = new Texture("african_head_nm.png")
        this.textureDiffuse = new Texture("african_head_diffuse.png")

        this.resetMatrix()
    }


    public clear() {

        for (let byteOffset = 0; byteOffset < this.frameBuffer.frameData.data.length; byteOffset += 4) {
            const [rIdx, gIdx, bIdx, aIdx] = [byteOffset + 0, byteOffset + 1, byteOffset + 2, byteOffset + 3]
            this.frameBuffer.frameData.data[rIdx] = 0
            this.frameBuffer.frameData.data[gIdx] = 0
            this.frameBuffer.frameData.data[bIdx] = 0
            this.frameBuffer.frameData.data[aIdx] = 255
        }

        this.depthBuffer = new DepthBuffer(this.width, this.height)
    }

    public render() {
        // 清理帧缓冲区
        this.clear()

        // 重置矩阵矩阵
        this.resetMatrix()

        for (let i = 0; i < this.trianglseBuffer.length; i += 3) {
            const screenCoords = []
            // 顶点计算: 对每个顶点进行矩阵运算(MVP)，输出顶点的屏幕坐标，顶点着色阶段
            for (let j = 0; j < 3; j++) {
                const idx = this.trianglseBuffer[i + j]
                const vertex = new Vec3(this.vertexsBuffer[idx * 3 + 0], this.vertexsBuffer[idx * 3 + 1], this.vertexsBuffer[idx * 3 + 2])
                screenCoords.push(this.shader.vertexShader(vertex, idx * 3))
            }
            // 绘制三角形:通过三个顶点计算包含在三角形内的屏幕像素，图元装配光栅化
            this.triangle(screenCoords)
            // this.line(screenCoords[0], screenCoords[1])
            // this.line(screenCoords[1], screenCoords[2])
            // this.line(screenCoords[2], screenCoords[0])

        }

        this.context.putImageData(this.frameBuffer.frameData, 0, 0)
    }

    public line(start: Vec3, end: Vec3) {
        const dx = end.x - start.x
        const dy = end.y - start.y
        const k = dy / dx

        if (Math.abs(dx) >= Math.abs(dy)) {
            const b = start.y - k * start.x
            for (let x = start.x; x <= end.x; x++) {
                const y = Math.round(k * x + b)
                this.frameBuffer.setPixel(x, y, [255, 255, 255, 255])
            }
        } else {
            const kInverse = 1 / k
            const b = start.x - kInverse * start.y
            for (let y = start.y; y <= end.y; y++) {
                const x = Math.round(kInverse * y + b)
                this.frameBuffer.setPixel(x, y, [255, 255, 255, 255])
            }
        }
    }

    public triangle(screenCoords: Array<Vec3>) {
        const minx = Math.floor(Math.min(screenCoords[0].x, Math.min(screenCoords[1].x, screenCoords[2].x)))
        const maxx = Math.ceil(Math.max(screenCoords[0].x, Math.max(screenCoords[1].x, screenCoords[2].x)))
        const miny = Math.floor(Math.min(screenCoords[0].y, Math.min(screenCoords[1].y, screenCoords[2].y)))
        const maxy = Math.ceil(Math.max(screenCoords[0].y, Math.max(screenCoords[1].y, screenCoords[2].y)))
        for (let w = minx; w <= maxx; w++) {
            for (let h = miny; h <= maxy; h++) {
                const bar = barycentric(screenCoords, new Vec3(w, h, 0))

                // 不在三角面内的像素点不进行着色
                if (bar.x < 0 || bar.y < 0 || bar.z < 0) continue

                // 计算插值后该像素的深度值,并进行深度测试
                const depth = this.depthBuffer.get(w, h)
                const interpolatedZ = bar.x * screenCoords[0].z + bar.y * screenCoords[1].z + bar.z * screenCoords[2].z
                if (interpolatedZ < -1 || interpolatedZ > 1 || interpolatedZ < depth) continue

                // 调用片元着色器，计算该像素的颜色
                const color = this.shader.fragmentShader(bar)

                this.depthBuffer.set(w, h, interpolatedZ)
                this.frameBuffer.setPixel(w, h, color)
            }
        }
    }

    public resetMatrix() {

        // 模型矩阵：对模型进行平移、旋转、缩放等操作，得到模型矩阵
        // 这里模型文件坐标系也是右手系，且顶点坐标范围在-1^3到1^3之间,所以模型需要缩放下
        // 对模型的Z坐标进行平移，使得模型在相机前方(我们定义的相机在z=1上，往-z方向看)
        this.modelMatrix = new Matrix44([
            [240, 0, 0, 0],
            [0, 240, 0, 0],
            [0, 0, 240, -240],
            [0, 0, 0, 1]
        ])

        // 视图矩阵：将世界坐标系转换到观察(相机)坐标系，得到视图矩阵
        this.viewMatrix = this.camera.getViewMat()

        // 投影矩阵：通过定义的观察空间范围(近平面、远平面、fov、aspset等参数定义)，将该空间坐标映射到-1^3到1^3的范围（NDC空间），得到投影矩阵
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

