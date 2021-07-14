import { app_canvas, config } from ".";
import { Color } from "../common/types";
import { CanvasLayer } from "./canvas";
import { ColorHelper } from "../common/color";
import { make_void, make_void_arg } from "./helper";
import { MenuTree } from "./menu";
import { send_packet } from "./websocket";


export function menu_root(): MenuTree[] {
    return [
        { label: "config", keybind: "c", select: m_global_config },
        { label: "this layer", keybind: "l", select: m_this_layer_config },
        { label: "layers", keybind: "w", select: m_layers_config },
        { label: "tool", keybind: "t" },
        {
            label: "extra", keybind: "e", select: (): MenuTree[] => [

            ]
        }
    ]
}

function color_helper(select: (color: Color) => MenuTree[] | undefined | void): MenuTree[] {
    const colors: [string, string][] = [["red", "r"], ["orange", "o"], ["gr.-yel.", "y"], ["green", "g"], ["cyan", "c"], ["blue", "b"]]
    return colors.map(([label, keybind], i) => {
        const col = ColorHelper.hue(i / colors.length)
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
        select: () => number_helper(n => {
            if (!app_canvas.active_layer) return
            app_canvas.active_layer.style.priority = n
            app_canvas.layers.sort((a, b) => a.style.priority - b.style.priority)
        }),
        keybind: "p"
    }, {
        label: app_canvas.active_layer?.hidden ? "show" : "hide",
        select: make_void(() => {
            if (!app_canvas.active_layer) return
            app_canvas.active_layer.hidden = !app_canvas.active_layer.hidden
        }),
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
        select: () => color_helper((col) => {
            if (!app_canvas.active_layer) return
            app_canvas.active_layer.style.stroke_color = col
            app_canvas.active_layer.update()
        }),
        keybind: "s"
    }, {
        label: "no stroke",
        select: () => {
            if (!app_canvas.active_layer) return
            app_canvas.active_layer.style.stroke_color = undefined
            app_canvas.active_layer.update()
        },
        keybind: "S"
    }, {
        label: "fill",
        select: () => color_helper((col) => {
            if (!app_canvas.active_layer) return
            app_canvas.active_layer.style.fill_color = col
            app_canvas.active_layer.update()
        }),
        keybind: "f"
    }, {
        label: "no fill",
        select: () => {
            if (!app_canvas.active_layer) return
            app_canvas.active_layer.style.fill_color = undefined
            app_canvas.active_layer.update()
        },
        keybind: "F"
    }, {
        label: "stroke weight",
        select: () => stroke_weight_helper(w => {
            if (!app_canvas.active_layer) return
            app_canvas.active_layer.style.line_width = w
            app_canvas.active_layer.update()
        }),
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
                select: make_void(() => config.background = ColorHelper.BLACK()),
                keybind: "c"
            }
        ],
        keybind: "b"
    },
]



