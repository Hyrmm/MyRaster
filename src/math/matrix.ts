export class Matrix4 {

    private data: number[][]

    constructor() {
        this.data = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
    }


    public setCol(col: number, val: [number, number, number, number]) {
        if (val.length != 4) throw new Error("Invalid input length")
        this.data[0][col] = val[0]
        this.data[1][col] = val[1]
        this.data[2][col] = val[2]
        this.data[3][col] = val[3]
    }


    public setRow(row: number, val: [number, number, number, number]) {
        if (val.length != 4) throw new Error("Invalid input length")
        this.data[row][0] = val[0]
        this.data[row][1] = val[1]
        this.data[row][2] = val[2]
        this.data[row][3] = val[3]
    }

}