import { Color } from "./types"


export class ColorHelper {
    static to_string(c: Color): string {
        return `hsl(${c[0] * 255},${c[1] * 100}%,${c[2] * 100}%,${c[3]})`
    }
    static hue(hue: number): Color {
        return [hue, 1, 0.5, 1]
    }

    static WHITE(): Color { return [0, 0, 1, 1] }
    static BLACK(): Color { return [0, 0, 0, 1] }
    static TRANSPARENT(): Color { return [0, 0, 0, 0] }

}


