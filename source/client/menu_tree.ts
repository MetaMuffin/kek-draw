import { app_canvas, config } from ".";
import { CanvasLayer } from "./canvas";
import { Color } from "./color";
import { make_void, make_void_arg } from "./helper";
import { MenuTree } from "./menu";


export function menu_root(): MenuTree[] {
    return [
        { label: "config", keybind: "c", select: m_global_config },
        { label: "this layer", keybind: "l", select: m_this_layer_config },
        { label: "layers", keybind: "w", select: m_layers_config },
        { label: "tool", keybind: "t" }
    ]
}

function color_helper(select: (color: Color) => MenuTree[] | undefined | void): MenuTree[] {
    const colors: [string, string][] = [["red", "r"], ["orange", "o"], ["gr.-yel.", "y"], ["green", "g"], ["cyan", "c"], ["blue", "b"]]
    return colors.map(([label, keybind], i) => {
        const col = new Color(i / colors.length)
        return { label, keybind, select: () => select(col), tint: col }
    })
}
function stroke_weight_helper(select: (w: number) => MenuTree[] | undefined | void): MenuTree[] {
    return [1, 2, 3, 5, 10, 20].map(w => ({
        label: `${w}px`,
        keybind: w.toString()[w.toString().length - 1],
        select: () => select(w)
    }))
}
function layer_select_helper(select: (layer: CanvasLayer) => MenuTree[] | undefined | void): MenuTree[] {
    return app_canvas.layers.map((l, i) => ({
        label: `L${i + 1}`,
        select: () => select(l),
        keybind: i.toString()
    }))
}
function number_helper(select: (n: number) => MenuTree[] | undefined | void): MenuTree[] {
    return [0, 1, 2, 3, 4, 5].map(i => ({
        label: i.toString(),
        select: () => select(i),
        keybind: i.toString()[i.toString().length - 1]
    }))
}

const m_layers_config = (): MenuTree[] => [
    {
        label: "add",
        select: () => {
            app_canvas.layers.push(new CanvasLayer(app_canvas))
        },
        keybind: "a"
    }, {
        label: "remove",
        select: () => layer_select_helper(make_void_arg(layer => {
            app_canvas.layers.splice(app_canvas.layers.findIndex(l => l == layer), 1)
        })),
        keybind: "r"
    }, {
        label: "set render priority",
        select: () => number_helper(make_void_arg(n => {
            app_canvas.active_layer.priority = n
            app_canvas.layers.sort((a, b) => a.priority - b.priority)
        })),
        keybind: "p"
    }, {
        label: app_canvas.active_layer.hidden ? "show" : "hide",
        select: make_void(() => app_canvas.active_layer.hidden = !app_canvas.active_layer.hidden),
        keybind: "h"
    }, {
        label: "select",
        select: () => layer_select_helper(make_void_arg(l => app_canvas.active_layer = l)),
        keybind: "s"
    }
]

const m_this_layer_config = (): MenuTree[] => [
    {
        label: "stroke",
        select: () => color_helper(make_void_arg((col) => app_canvas.active_layer.stroke_color = col)),
        keybind: "s"
    }, {
        label: "no stroke",
        select: () => app_canvas.active_layer.stroke_color = undefined,
        keybind: "S"
    }, {
        label: "fill",
        select: () => color_helper(make_void_arg((col) => app_canvas.active_layer.fill_color = col)),
        keybind: "f"
    }, {
        label: "no fill",
        select: () => app_canvas.active_layer.fill_color = undefined,
        keybind: "F"
    }, {
        label: "stroke weight",
        select: () => stroke_weight_helper(make_void_arg(w => app_canvas.active_layer.line_width = w)),
        keybind: "w"
    }
]

const m_global_config = (): MenuTree[] => [
    {
        label: "background",
        select: (): MenuTree[] => [
            {
                label: "change color",
                select: () => color_helper(make_void_arg((col) => config.background = col)),
                keybind: "s"
            },
            {
                label: "clear color",
                select: make_void(() => config.background = Color.BLACK()),
                keybind: "c"
            }
        ],
        keybind: "b"
    },
]



