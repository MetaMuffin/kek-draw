import { canvas, context, shift } from "."
import { DEFAULT_STYLE, ID, ILayer, ILayerStyle, IPoint, IRect, NEW_ID } from "../common/types"
import { ColorHelper } from "../common/color"
import { K_DRAW, K_PAN, MAX_POINT_DENSITY_PER_WEIGHT } from "./config"
import { distance, get_mouse_pos, rect_includes_point } from "./helper"
import { Transform } from "./transform"
import { send_packet } from "./websocket"

export class Canvas {
    layers: CanvasLayer[]
    active_layer?: CanvasLayer
    active_stroke?: Stroke
    transform: Transform = new Transform()

    private pan_last: undefined | { x: number, y: number }
    private update_view_timeout?: any

    constructor() {
        this.layers = [new CanvasLayer(this)]
        this.layers[0].id = 0
        this.active_layer = this.layers[0]
    }

    setup() {
        this.update_view()
        document.addEventListener("mousedown", (ev) => {
            const { x: rx, y: ry } = get_mouse_pos(ev)
            const { x, y } = this.transform.untransform({ x: rx, y: ry })
            if (ev.button == K_PAN[0] && shift == K_PAN[1]) this.pan_last = { x: rx, y: ry }
            if (ev.button == K_DRAW[0] && shift == K_DRAW[1]) {
                if (!this.active_layer) return
                this.active_stroke = new Stroke(this.active_layer)
                this.active_layer.strokes.set(this.active_stroke.id, this.active_stroke)
                this.active_stroke.add_point(x, y)
            }
        })
        document.addEventListener("mouseup", (ev) => {
            if (ev.button == K_PAN[0] && shift == K_PAN[1]) this.pan_last = undefined
            if (ev.button == K_DRAW[0] && shift == K_DRAW[1]) {
                const { x: rx, y: ry } = get_mouse_pos(ev)
                const { x, y } = this.transform.untransform({ x: rx, y: ry })
                this.active_stroke = undefined
            }
        })
        document.addEventListener("mousemove", (ev) => {
            const { x: rx, y: ry } = get_mouse_pos(ev)
            const { x, y } = this.transform.untransform({ x: rx, y: ry })
            if (this.active_stroke) {
                this.active_stroke.add_point(x, y)
            }
            if (this.pan_last) {
                const [dx, dy] = [rx - this.pan_last.x, ry - this.pan_last.y]
                this.transform.off_x += dx
                this.transform.off_y += dy
                this.pan_last = { x: rx, y: ry }
                this.update_view()
            }
        })
        document.addEventListener("wheel", (ev) => {
            var signum = ev.deltaY / Math.abs(ev.deltaY)
            this.transform.scale_y *= 1 - (signum * 0.1)
            this.transform.scale_x *= 1 - (signum * 0.1)
        })
    }
    update_view() {
        const view_rect: IRect = {
            tl: this.transform.untransform({ x: 0, y: 0 }),
            br: this.transform.untransform({ x: canvas.width, y: canvas.height }),
        }
        if (!this.update_view_timeout) {
            this.update_view_timeout = setTimeout(() => {
                clearTimeout(this.update_view_timeout)
                this.update_view_timeout = undefined
                send_packet({
                    type: "fetch-point",
                    rect: view_rect
                })
                for (const l of this.layers) {
                    for (const [s_id, s] of l.strokes) {
                        s.points = s.points.filter(p =>
                            rect_includes_point(view_rect, p)
                        )
                    }
                }
            }, 100)
        }
    }

    update() {
        for (const l of this.layers) {
            l.draw()
        }
    }
}

export class CanvasLayer {
    id: number
    strokes: Map<ID, Stroke> = new Map()
    style: ILayerStyle = DEFAULT_STYLE()
    canvas: Canvas
    hidden: boolean = false

    constructor(canvas: Canvas) {
        this.id = NEW_ID()
        this.canvas = canvas
    }

    update() {
        send_packet({ type: "update-layer", data: { id: this.id, style: this.style } })
    }

    draw() {
        if (this.hidden) return
        context.save()
        context.transform(...this.canvas.transform.to_array())
        context.lineWidth = this.style.line_width
        if (this.style.fill_color) context.fillStyle = ColorHelper.to_string(this.style.fill_color)
        if (this.style.stroke_color) context.strokeStyle = ColorHelper.to_string(this.style.stroke_color)
        const do_fill = this.style.fill_color != undefined
        const do_stroke = this.style.stroke_color != undefined
        for (const [id, s] of this.strokes) {
            s.draw(do_stroke, do_fill)
        }
        context.restore()
    }
}

export class Stroke {
    id: number
    points: IPoint[] = []
    layer: CanvasLayer

    constructor(layer: CanvasLayer) {
        this.id = NEW_ID()
        this.layer = layer
    }

    draw(do_stroke: boolean, do_fill: boolean) {
        if (this.points.length == 0) this.draw_void()
        else if (this.points.length <= 1) this.draw_constant()
        else if (this.points.length <= 2) this.draw_linear()
        else this.draw_quadratic()
        if (do_fill) context.fill()
        if (do_stroke) context.stroke()
        context.closePath()
    }
    draw_void() { }
    draw_constant() {
        context.beginPath()
        context.moveTo(this.points[0].x - 1, this.points[0].y - 1)
        context.lineTo(this.points[0].x + 1, this.points[0].y - 1)
        context.lineTo(this.points[0].x + 1, this.points[0].y + 1)
        context.lineTo(this.points[0].x - 1, this.points[0].y + 1)
        context.lineTo(this.points[0].x - 1, this.points[0].y - 1)
    }
    draw_linear() {
        context.beginPath()
        context.moveTo(this.points[0].x, this.points[0].y);
        for (const p of this.points) {
            context.lineTo(p.x, p.y)
        }
    }
    draw_quadratic() {
        context.beginPath()
        context.moveTo(this.points[0].x, this.points[0].y);
        var i = 0;
        for (i = 1; i < this.points.length - 2; i++) {
            var xc = (this.points[i].x + this.points[i + 1].x) / 2;
            var yc = (this.points[i].y + this.points[i + 1].y) / 2;
            context.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
        }
        context.quadraticCurveTo(this.points[i].x, this.points[i].y, this.points[i + 1].x, this.points[i + 1].y);
    }
    add_point(x: number, y: number) {
        const { x: lx, y: ly } = this.points[this.points.length - 1] ?? { x: +Infinity, y: +Infinity }
        if (distance(x, y, lx, ly) > MAX_POINT_DENSITY_PER_WEIGHT * this.layer.style.line_width) {
            const np = {
                x, y,
                id: NEW_ID(),
                order: this.points.length,
                layer: this.layer.id,
                quad: 0,
                stroke: this.id
            }
            this.points.push(np)
            send_packet({ type: "update-point", data: np })
        }
    }
}
