

export class Transform {
    scale_x: number = 1
    scale_y: number = 1
    skew_x: number = 0
    skew_y: number = 0
    off_x: number = 0
    off_y: number = 0

    constructor() { }

    // for canvas.tranform(a,b,c,d,e,f)
    to_array(): [number, number, number, number, number, number] {
        return [this.scale_x, this.skew_x, this.skew_y, this.scale_y, this.off_x, this.off_y]
    }
}