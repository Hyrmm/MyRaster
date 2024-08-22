import { Raster } from "./core/raster"
import { Matrix, Matrix44 } from "./math/matrix"
import { Vec4 } from "./math/vector"

class App {

    private static raster: Raster

    public static init(canvas: HTMLCanvasElement) {
        const context = canvas.getContext("2d") as CanvasRenderingContext2D
        this.raster = new Raster(canvas.width, canvas.height, context)
    }

    public static start() {

        let last = 0

        const loop = (timestamp: number) => {
            const delt = timestamp - last
            document.getElementById("fps")!.innerText = `FPS:${(1000 / delt).toFixed(0)}`
            this.mainLoop()
            last = timestamp
            requestAnimationFrame(loop)
        }

        loop(0)
    }


    public static mainLoop() {
        this.raster.render()
    }
}

App.init(document.getElementById("canvas") as HTMLCanvasElement)
App.start()