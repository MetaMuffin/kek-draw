import { context } from "."
import { Color } from "./color"
import { get_mouse_pos } from "./helper"


export class Canvas {
    layers: CanvasLayer[]
    active_layer: CanvasLayer
    active_stroke?: Stroke

    constructor() {
        this.layers = [new CanvasLayer()]
        this.active_layer = this.layers[0]
    }
    setup() {
        document.addEventListener("mousedown", (ev) => {
            if (ev.button != 0) return
            const { x, y } = get_mouse_pos(ev)
            this.active_stroke = new Stroke()
            this.active_layer.strokes.push(this.active_stroke)
            this.active_stroke.add_point(x, y)
        })
        document.addEventListener("mouseup", (ev) => {
            if (ev.button != 0) return
            const { x, y } = get_mouse_pos(ev)
            this.active_stroke = undefined
        })
        document.addEventListener("mousemove", (ev) => {
            if (this.active_stroke) {
                const { x, y } = get_mouse_pos(ev)
                this.active_stroke.add_point(x, y)
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

    draw() {
        context.lineWidth = this.line_width
        if (this.fill_color) context.fillStyle = this.fill_color.value
        if (this.stroke_color) context.strokeStyle = this.stroke_color.value
        const do_fill = this.fill_color != undefined
        const do_stroke = this.stroke_color != undefined
        for (const s of this.strokes) {
            s.draw(do_stroke, do_fill)
        }
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
