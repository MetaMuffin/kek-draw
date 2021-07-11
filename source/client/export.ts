import { app_canvas } from ".";
import { CanvasLayer, Stroke } from "./canvas";
import { Color } from "./color";

export interface CanvasExport {
    active_layer: number
    layers: LayerExport[]
    transform: [number, number, number, number, number, number]
}
export interface LayerExport {
    strokes: StrokeExport[]
    fill_color?: [number, number, number, number]
    stroke_color?: [number, number, number, number]
    line_width: number
    hidden: boolean
    priority: number
}
export interface StrokeExport {
    points: [number, number][]
}

function s_export(): CanvasExport {
    const s_color = (c: Color | undefined): [number, number, number, number] | undefined => c ? [c.hue, c.saturation, c.lightness, c.alpha] : undefined
    return {
        active_layer: app_canvas.layers.findIndex(l => l == app_canvas.active_layer),
        layers: app_canvas.layers.map(layer => ({
            hidden: layer.hidden,
            line_width: layer.line_width,
            fill_color: s_color(layer.fill_color),
            stroke_color: s_color(layer.stroke_color),
            strokes: layer.strokes.map(stroke => ({
                points: stroke.points
            })),
            priority: layer.priority
        })),
        transform: app_canvas.transform.to_array()
    }
}

function s_import(i: CanvasExport) {
    app_canvas.layers = i.layers.map(l => {
        const layer = new CanvasLayer(app_canvas)
        layer.hidden = l.hidden,
            layer.fill_color = l.fill_color ? new Color(...l.fill_color) : undefined
        layer.stroke_color = l.stroke_color ? new Color(...l.stroke_color) : undefined
        layer.priority = l.priority
        layer.line_width = l.line_width
        layer.strokes = l.strokes.map(s => {
            const stroke = new Stroke(layer)
            stroke.points = s.points
            return stroke
        })
        return layer
    })
    app_canvas.active_layer = app_canvas.layers[i.active_layer]
}


export function file_export() {
    alert(JSON.stringify(s_export()))
}

export function file_import() {
    s_import(JSON.parse(prompt("paste your stuff here") ?? ""))
}

