export class FrameBuffer {

    private data: ImageData

    constructor(width: number, height: number) {
        this.data = new ImageData(width, height)
    }

    public get frameData(): ImageData {
        return this.data
    }

    public setPixel(x: number, y: number, rgba: [number, number, number, number]): void {
        x = Math.floor(x)
        y = Math.floor(y)
        this.data.data[((y * this.data.width + x) * 4) + 0] = rgba[0]
        this.data.data[((y * this.data.width + x) * 4) + 1] = rgba[1]
        this.data.data[((y * this.data.width + x) * 4) + 2] = rgba[2]
        this.data.data[((y * this.data.width + x) * 4) + 3] = rgba[3]
    }

    public getPixel(x: number, y: number): [number, number, number, number] {

        const result: [number, number, number, number] = [0, 0, 0, 0]

        result[0] = this.data.data[((y * this.data.width + x) * 4) + 0]
        result[1] = this.data.data[((y * this.data.width + x) * 4) + 1]
        result[2] = this.data.data[((y * this.data.width + x) * 4) + 2]
        result[3] = this.data.data[((y * this.data.width + x) * 4) + 3]

        return result
    }
}
