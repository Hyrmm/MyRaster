import { Raster } from "./core/raster"
import { Matrix, Matrix44 } from "./math/matrix"
import { Vec4 } from "./math/vector"



class App {

    private static raster: Raster
    private static isMouseMoving: boolean = false

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

    public static onMouseUp(e: MouseEvent) { this.isMouseMoving = false }

    public static onMouseDown(e: MouseEvent) { this.isMouseMoving = true }

    public static onMouseMove(e: MouseEvent) {
        if (!this.isMouseMoving) return
        this.raster.camera.rotatedCamera(new Matrix44().rotateY(Math.sign(e.movementX) * 5 / 180 * Math.PI))
    }

    public static onKeyDown(e: KeyboardEvent) {

        
        switch (e.code) {
            case "KeyW": {
                this.raster.camera.translatedCamera(new Matrix44().translate(0, 0, -50))
                break;
            }
            case "KeyS": {
                this.raster.camera.translatedCamera(new Matrix44().translate(0, 0, 50))
                break;
            }
            case "KeyA": {
                this.raster.camera.translatedCamera(new Matrix44().translate(-10, 0, 0))
                break;
            }
            case "KeyD": {
                this.raster.camera.translatedCamera(new Matrix44().translate(10, 0, 0))
                break;
            }

        }

    }

    public static mainLoop() {
        this.raster.render()
    }
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement
window.onkeydown = App.onKeyDown.bind(App)
canvas.onmousedown = App.onMouseDown.bind(App)
canvas.onmouseup = App.onMouseUp.bind(App)
canvas.onmousemove = App.onMouseMove.bind(App)

App.init(canvas)
App.start()