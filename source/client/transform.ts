import { app_canvas, context } from "."
import { IPoint } from "../common/types"


export class Transform {
    scale_x: number = 1
    scale_y: number = 1
    skew_x: number = 0
    skew_y: number = 0
    off_x: number = 0
    off_y: number = 0

    constructor() { }

    untransform(p: { x: number, y: number }): { x: number, y: number } {
        context.save()
        context.transform(...app_canvas.transform.to_array())
        var matrix = context.getTransform();
        var imatrix = matrix.invertSelf();
        context.restore()

        return {
            x: p.x * imatrix.a + p.y * imatrix.c + imatrix.e,
            y: p.x * imatrix.b + p.y * imatrix.d + imatrix.f
        }
    }
    transform(p: { x: number, y: number }): { x: number, y: number } {
        return {
            x: p.x * this.scale_x + p.y * this.skew_x + this.off_x,
            y: p.x * this.scale_y + p.y * this.skew_y + this.off_y
        }

    }

    // for canvas.tranform(a,b,c,d,e,f)
    to_array(): [number, number, number, number, number, number] {
        return [this.scale_x, this.skew_x, this.skew_y, this.scale_y, this.off_x, this.off_y]
    }
}