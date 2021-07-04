import { app_canvas, config } from ".";
import { CanvasLayer } from "./canvas";
import { Color } from "./color";
import { MenuTree } from "./menu";


export const menu_tree: MenuTree = {
    label: "Root",
    subtree: () => [
        { label: "Config", subtree: m_global_config },
        { label: "This Layer", subtree: m_this_layer_config },
        { label: "Layers", subtree: m_layers_config },
        { label: "Tool", subtree: () => { throw new Error("Unimplemented") } }
    ]
}

function color_helper(action: (color: Color) => void): MenuTree[] {
    const colors: string[] = ["Red", "Orange", "Gr.-yel.", "Green", "Cyan", "Blue"]
    return colors.map((label, i) => {
        const col = new Color(i / colors.length)
        return { label, action: () => action(col), tint: col }
    })
}
function layer_select_helper(action: (layer: CanvasLayer) => void): MenuTree[] {
    return app_canvas.layers.map((l, i) => ({
        label: `L${i + 1}`,
        action: () => action(l)
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
        subtree: () => color_helper((col) => app_canvas.active_layer.stroke_color = col)
    },
    {
        label: "No Stroke",
        action: () => app_canvas.active_layer.stroke_color = undefined
    },
    {
        label: "Fill",
        subtree: () => color_helper((col) => app_canvas.active_layer.fill_color = col)
    }, {
        label: "No Fill",
        action: () => app_canvas.active_layer.fill_color = undefined
    }
]

const m_global_config = (): MenuTree[] => [
    {
        label: "Background",
        subtree: () => [
            {
                label: "Change color",
                subtree: () => color_helper((col) => config.background = col)
            },
            {
                label: "Clear color",
                action: () => config.background = Color.BLACK()
            }
        ]
    },
]



