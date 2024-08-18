export class Buffer {

    public data: Array<number>

    constructor(w: number, h: number) {
        this.data = new Array(w * h * 4)
    }
}