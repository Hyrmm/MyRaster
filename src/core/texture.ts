export class Texture {

    private image: HTMLImageElement
    private loaded: boolean = false
    private textureData: ImageData

    constructor(src: string) {
        this.image = new Image()
        this.image.src = src

        this.image.onload = () => {

            const canvas = document.createElement('canvas')
            canvas.width = this.image.width
            canvas.height = this.image.height

            const context = canvas.getContext('2d')
            context.drawImage(this.image, 0, 0)

            this.textureData = context.getImageData(0, 0, canvas.width, canvas.height)
            this.loaded = true
        }
    }

    public sampling(u: number, v: number): [number, number, number, number] | null {
        if (!this.loaded) return null
        const x = Math.floor(u * (this.image.width - 1))
        const y = Math.floor((1 - v) * (this.image.height - 1))
        return this.getPixel(x, y)
    }

    public getPixel(x: number, y: number): [number, number, number, number] {
        const result: [number, number, number, number] = [0, 0, 0, 0]

        result[0] = this.textureData.data[((y * this.image.width + x) * 4) + 0]
        result[1] = this.textureData.data[((y * this.image.width + x) * 4) + 1]
        result[2] = this.textureData.data[((y * this.image.width + x) * 4) + 2]
        result[3] = this.textureData.data[((y * this.image.width + x) * 4) + 3]

        return result
    }

}