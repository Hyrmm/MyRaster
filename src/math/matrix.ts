import { Vec4 } from "./vector"


export class Matrix {
    public cols: number
    public rows: number
    protected data: number[][]
}
export class Matrix44 extends Matrix {

    constructor(data?: Array<number[]>) {
        super()
        if (data) {
            this.data = data
        } else {
            this.data = [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ]
        }

        this.cols = 4
        this.rows = 4

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

    public multiply(mat: Matrix44): Matrix44 {
        const result = new Matrix44()

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0
                for (let k = 0; k < 4; k++) {
                    sum += this.data[i][k] * mat.data[k][j]
                }
                result.data[i][j] = sum
            }


        }

        return result

    }

    public multiplyVec(vec: Vec4): Vec4 {
        const result: Array<number> = []

        for (let i = 0; i < 4; i++) {
            result.push(this.data[i][0] * vec.x + this.data[i][1] * vec.y + this.data[i][2] * vec.z + this.data[i][3] * vec.w)
        }

        return new Vec4(result[0], result[1], result[2], result[3])
    }

    public transpose(): Matrix44 {
        const result = new Matrix44()
        result.setRow(0, [this.data[0][0], this.data[1][0], this.data[2][0], -this.data[0][3]])
        result.setRow(1, [this.data[0][1], this.data[1][1], this.data[2][1], -this.data[1][3]])
        result.setRow(2, [this.data[0][2], this.data[1][2], this.data[2][2], -this.data[2][3]])
        result.setRow(3, [0, 0, 0, 1])
        return result
    }

    public translate(x: number, y: number, z: number): Matrix44 {
        const translateMat = new Matrix44()
        translateMat.setCol(3, [x, y, z, 1])
        this.data = translateMat.multiply(this).data
        return this
    }

    public rotateX(angle: number): Matrix44 {
        const rotateMat = new Matrix44()
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        rotateMat.setCol(1, [0, cos, -sin, 0])
        rotateMat.setCol(2, [0, sin, cos, 0])
        this.data = rotateMat.multiply(this).data
        return this
    }

    public rotateY(angle: number): Matrix44 {
        const rotateMat = new Matrix44()
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        rotateMat.setCol(0, [cos, 0, sin, 0])
        rotateMat.setCol(2, [-sin, 0, cos, 0])
        this.data = rotateMat.multiply(this).data
        return this
    }

    public rotateZ(angle: number): Matrix44 {
        const rotateMat = new Matrix44()
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        rotateMat.setCol(0, [cos, -sin, 0, 0])
        rotateMat.setCol(1, [sin, cos, 0, 0])
        this.data = rotateMat.multiply(this).data
        return this
    }

    public scale(x: number, y: number, z: number): Matrix44 {
        const scaleMat = new Matrix44()
        scaleMat.setCol(0, [x, 0, 0, 0])
        scaleMat.setCol(1, [0, y, 0, 0])
        scaleMat.setCol(2, [0, 0, z, 0])
        this.data = scaleMat.multiply(this).data
        return this
    }
}
