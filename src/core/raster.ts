import { Buffer } from "../utils/buffer";
import { Mesh, initMeshBuffers } from "webgl-obj-loader";
import { FrameBuffer } from "../utils/frameBuff";
import african_head from "../model/african_head";


export class Raster {

    private context: CanvasRenderingContext2D

    private width: number
    private height: number

    private frameBuffer: FrameBuffer
    private vertexsBuffer: Array<number>
    private trianglseBuffer: Array<number>

    private african_head: Mesh

    constructor(w: number, h: number, context: CanvasRenderingContext2D) {

        this.width = w
        this.height = h

        this.vertexsBuffer = african_head.vertices
        this.trianglseBuffer = african_head.indices
        this.frameBuffer = new FrameBuffer(w, h)

        this.context = context



        console.log(this.african_head)
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


        this.context.putImageData(this.frameBuffer.frameData, 0, 0)
    }
}

