import { app_canvas, config } from ".";
import { Color } from "./color";
import { MenuTree } from "./menu";


export const menu_tree: MenuTree = {
    label: "Root",
    subtree: () => [
        { label: "Global config.", subtree: m_global_config },
        { label: "Layer config.", subtree: m_layer_config },
    ]
}

function color_helper(action: (color: Color) => void): MenuTree[] {
    const colors: string[] = ["Red", "Yellow", "Green", "Cyan", "Blue", "Magenta"]
    return colors.map((label, i) => {
        const col = new Color(i / colors.length)
        return { label, action: () => action(col), tint: col }
    })
}

const m_layer_config = (): MenuTree[] => [
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



