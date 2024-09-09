export class DepthBuffer {

    private data: Map<string, number>

    constructor(width: number, height: number) {
        this.data = new Map()
    }

    public get(x: number, y: number): number {
        x = Math.floor(x)
        y = Math.floor(y)
        return this.data.get(`${x},${y}`) || Number.MIN_SAFE_INTEGER
    }

    public set(x: number, y: number, depth: number): void {
        x = Math.floor(x)
        y = Math.floor(y)
        this.data.set(`${x},${y}`, depth)
    }
}
