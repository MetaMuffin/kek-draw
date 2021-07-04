import { config } from ".";
import { MenuTree } from "./menu";


export const menu_tree: MenuTree = {
    label: "Root",
    subtree: [
        {
            label: "A",
        },
        {
            label: "Background",
            subtree: [
                {
                    label: "Change color",
                    subtree: [
                        {
                            label: "Green",
                            action: () => config.background = "#005500",
                        },
                        {
                            label: "Red",
                            action: () => config.background = "#550000",
                        },
                        {
                            label: "Yellow",
                            action: () => config.background = "#555500",
                        },
                        {
                            label: "Blue",
                            action: () => config.background = "#000055",
                        },
                    ]
                },
                {
                    label: "Clear color",
                    action: () => config.background = "black"
                }
            ]
        },
        {
            label: "C",
        }
    ]
}