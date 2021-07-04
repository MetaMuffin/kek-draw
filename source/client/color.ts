
export class Color {
    protected _hue: number
    protected _saturation: number
    protected _lightness: number
    protected _alpha: number

    private string_cache?: string

    constructor(h?: number, s?: number, l?: number, a?: number) {
        this._hue = h ?? 0
        this._saturation = s ?? 1
        this._lightness = l ?? 0.5
        this._alpha = a ?? 1
    }

    get hue() { return this._hue }
    set hue(value: number) { this._hue = value; this.string_cache = undefined }

    get saturation() { return this._saturation }
    set saturation(value: number) { this._saturation = value; this.string_cache = undefined }

    get lightness() { return this._lightness }
    set lightness(value: number) { this._lightness = value; this.string_cache = undefined }

    get alpha() { return this._alpha }
    set alpha(value: number) { this._alpha = value; this.string_cache = undefined }

    get value(): string {
        if (this.string_cache) return this.string_cache
        return this.string_cache = `hsl(${this._hue * 255},${this._saturation * 100}%,${this._lightness * 100}%,${this._alpha})`
    }

    static WHITE() { return new Color(0, 0, 1) }
    static BLACK() { return new Color(0, 0, 0) }
    static TRANSPARENT() { return new Color(0, 0, 0, 0) }

}


