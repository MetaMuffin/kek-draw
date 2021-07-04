import { app_canvas, config } from ".";
import { CanvasLayer } from "./canvas";
import { Color } from "./color";
import { make_void } from "./helper";
import { MenuTree } from "./menu";


export function menu_root(): MenuTree[] {
    return [
        { label: "Config", select: m_global_config },
        { label: "This Layer", select: m_this_layer_config },
        { label: "Layers", select: m_layers_config },
        { label: "Tool", select: () => { throw new Error("Unimplemented") } }
    ]
}

function color_helper(select: (color: Color) => void): MenuTree[] {
    const colors: string[] = ["Red", "Orange", "Gr.-yel.", "Green", "Cyan", "Blue"]
    return colors.map((label, i) => {
        const col = new Color(i / colors.length)
        return { label, select: () => select(col), tint: col }
    })
}
function layer_select_helper(select: (layer: CanvasLayer) => void): MenuTree[] {
    return app_canvas.layers.map((l, i) => ({
        label: `L${i + 1}`,
        select: () => select(l)
    }))
}

const m_layers_config = (): MenuTree[] => [
    {
        label: "Add",
    },
    {
        label: "Remove",
    },
    {
        label: "Reorder",
    },
    {
        label: "Select",
    }
]

const m_this_layer_config = (): MenuTree[] => [
    {
        label: "Stroke",
        select: () => color_helper((col) => app_canvas.active_layer.stroke_color = col)
    },
    {
        label: "No Stroke",
        select: () => app_canvas.active_layer.stroke_color = undefined
    },
    {
        label: "Fill",
        select: () => color_helper((col) => app_canvas.active_layer.fill_color = col)
    }, {
        label: "No Fill",
        select: () => app_canvas.active_layer.fill_color = undefined
    }
]

const m_global_config = (): MenuTree[] => [
    {
        label: "Background",
        select: () => [
            {
                label: "Change color",
                select: () => color_helper((col) => config.background = col)
            },
            {
                label: "Clear color",
                select: make_void(() => config.background = Color.BLACK())
            }
        ]
    },
]



