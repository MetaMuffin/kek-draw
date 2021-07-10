import { context, shift } from "."
import { Color } from "./color"
import { K_DRAW, K_PAN } from "./config"
import { get_mouse_pos } from "./helper"
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
                this.active_stroke = new Stroke()
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
    draw(do_stroke: boolean, do_fill: boolean) {
        context.beginPath()
        context.moveTo(...this.points[0])
        for (const p of this.points) {
            context.lineTo(...p)
        }
        if (do_fill) context.fill()
        if (do_stroke) context.stroke()
    }
    add_point(x: number, y: number) {
        this.points.push([x, y])
    }
}
