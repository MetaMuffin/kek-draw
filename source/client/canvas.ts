import { context, shift } from "."
import { Color } from "./color"
import { K_DRAW, K_PAN, MAX_POINT_DENSITY_PER_WEIGHT } from "./config"
import { distance, get_mouse_pos } from "./helper"
import { Transform } from "./transform"


export class Canvas {
    layers: CanvasLayer[]
    active_layer: CanvasLayer
    active_stroke?: Stroke
    transform: Transform = new Transform()

    private pan_last: undefined | { x: number, y: number }


    constructor() {
        this.layers = [new CanvasLayer(this)]
        this.active_layer = this.layers[0]
    }
    setup() {
        document.addEventListener("mousedown", (ev) => {
            const { x: rx, y: ry } = get_mouse_pos(ev)
            const { x, y } = this.transform.untransform(rx, ry)
            if (ev.button == K_PAN[0] && shift == K_PAN[1]) this.pan_last = { x: rx, y: ry }
            if (ev.button == K_DRAW[0] && shift == K_DRAW[1]) {
                this.active_stroke = new Stroke(this.active_layer)
                this.active_layer.strokes.push(this.active_stroke)
                this.active_stroke.add_point(x, y)
            }
        })
        document.addEventListener("mouseup", (ev) => {
            if (ev.button == K_PAN[0] && shift == K_PAN[1]) this.pan_last = undefined
            if (ev.button == K_DRAW[0] && shift == K_DRAW[1]) {
                const { x: rx, y: ry } = get_mouse_pos(ev)
                const { x, y } = this.transform.untransform(rx, ry)
                this.active_stroke = undefined
            }
        })
        document.addEventListener("mousemove", (ev) => {
            const { x: rx, y: ry } = get_mouse_pos(ev)
            const { x, y } = this.transform.untransform(rx, ry)
            if (this.active_stroke) {
                this.active_stroke.add_point(x, y)
            }
            if (this.pan_last) {
                const [dx, dy] = [rx - this.pan_last.x, ry - this.pan_last.y]
                this.transform.off_x += dx
                this.transform.off_y += dy
                this.pan_last = { x: rx, y: ry }
            }
        })
        document.addEventListener("wheel", (ev) => {
            var signum = ev.deltaY / Math.abs(ev.deltaY)
            this.transform.scale_y *= 1 - (signum * 0.1)
            this.transform.scale_x *= 1 - (signum * 0.1)
        })
    }
    update() {
        for (const l of this.layers) {
            l.draw()
        }
    }
}

export class CanvasLayer {
    strokes: Stroke[] = []
    fill_color?: Color
    stroke_color?: Color = Color.WHITE()
    line_width: number = 3
    canvas: Canvas
    priority: number = 0
    hidden: boolean = false

    constructor(canvas: Canvas) { this.canvas = canvas }

    draw() {
        if (this.hidden) return
        context.save()
        context.transform(...this.canvas.transform.to_array())
        context.lineWidth = this.line_width
        if (this.fill_color) context.fillStyle = this.fill_color.value
        if (this.stroke_color) context.strokeStyle = this.stroke_color.value
        const do_fill = this.fill_color != undefined
        const do_stroke = this.stroke_color != undefined
        for (const s of this.strokes) {
            s.draw(do_stroke, do_fill)
        }
        context.restore()
    }
}

export class Stroke {
    points: [number, number][] = []
    layer: CanvasLayer
    constructor(layer: CanvasLayer) {
        this.layer = layer
    }
    draw(do_stroke: boolean, do_fill: boolean) {
        if (this.points.length <= 1) this.draw_constant()
        else if (this.points.length <= 2) this.draw_linear()
        else this.draw_quadratic()
        if (do_fill) context.fill()
        if (do_stroke) context.stroke()
        context.closePath()
    }
    draw_constant() {
        context.beginPath()
        context.moveTo(this.points[0][0]-1, this.points[0][1]-1)
        context.lineTo(this.points[0][0]+1, this.points[0][1]-1)
        context.lineTo(this.points[0][0]+1, this.points[0][1]+1)
        context.lineTo(this.points[0][0]-1, this.points[0][1]+1)
        context.lineTo(this.points[0][0]-1, this.points[0][1]-1)
    }
    draw_linear() {
        context.beginPath()
        context.moveTo(this.points[0][0], this.points[0][1]);
        for (const p of this.points) {
            context.lineTo(...p)
        }
    }
    draw_quadratic() {
        context.beginPath()
        context.moveTo(this.points[0][0], this.points[0][1]);
        var i = 0;
        for (i = 1; i < this.points.length - 2; i++) {
            var xc = (this.points[i][0] + this.points[i + 1][0]) / 2;
            var yc = (this.points[i][1] + this.points[i + 1][1]) / 2;
            context.quadraticCurveTo(this.points[i][0], this.points[i][1], xc, yc);
        }
        context.quadraticCurveTo(this.points[i][0], this.points[i][1], this.points[i + 1][0], this.points[i + 1][1]);
    }
    add_point(x: number, y: number) {
        const [lx, ly] = this.points[this.points.length - 1] ?? [+Infinity, +Infinity]
        if (distance(x, y, lx, ly) > MAX_POINT_DENSITY_PER_WEIGHT * this.layer.line_width) {
            this.points.push([x, y])
        }
    }
}
