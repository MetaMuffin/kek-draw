import { app_canvas, config } from ".";
import { MenuTree } from "./menu";


export const menu_tree: MenuTree = {
    label: "Root",
    subtree: () => [
        { label: "Global config.", subtree: m_global_config },
        { label: "Layer config.", subtree: m_layer_config },
    ]
}

function color_helper(action: (color: string) => void): MenuTree[] {
    const colors: [string, string][] = [["Green", "#00ff00"], ["Yellow", "#ffff00"], ["Red", "#ff0000"], ["Magenta", "#ff00ff"], ["Blue", "#0000ff"], ["Cyan", "#00ffff"]]
    return colors.map(([label, col]) => ({
        label, action: () => action(col), tint: col
    }))
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
                action: () => config.background = "black"
            }
        ]
    },
]



