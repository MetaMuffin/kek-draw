
export class Color {
    hue: number = 0
    saturation: number = 0
    lightness: number = 0.5
    alpha: number = 1

    string_cache?: string

    constructor() {

    }

    

    get value(): string {
        if (this.string_cache) return this.string_cache
        return this.string_cache = `hsl(${this.hue * 255},${this.saturation * 100}%,${this.lightness * 100}%,${this.alpha})`
    }

}
