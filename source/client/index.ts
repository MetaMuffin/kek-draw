import { Color } from "../common/types"
import { Canvas } from "./canvas"
import { ColorHelper } from "../common/color"
import { draw_keyboard_menu, setup_menu, update_mouse_menu } from "./menu"
import { ws_connect } from "./websocket"


export var shift = false

export var canvas: HTMLCanvasElement
export var context: CanvasRenderingContext2D

export var config: { background: Color } = { background: ColorHelper.BLACK() }
export const app_canvas = new Canvas()

window.onload = async () => {
    document.body.innerHTML = "<p>connecting websocket</p>"
    await ws_connect()

    canvas = document.createElement("canvas")
    const s_context = canvas.getContext("2d")
    if (!s_context) throw new Error("sadfhasdjfkhl");
    context = s_context
    document.body.append(canvas)
    canvas.style.position = "absolute"
    canvas.style.top = "0px"
    canvas.style.left = "0px"
    canvas.style.width = "100vw"
    canvas.style.height = "100vh"

    document.addEventListener("keydown", ev => {
        if (ev.code == "ShiftLeft" || ev.code == "Space") shift = true
    })
    document.addEventListener("keyup", ev => {
        if (ev.code == "ShiftLeft" || ev.code == "Space") shift = false
    })

    function resize() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }
    window.addEventListener("resize", () => resize())
    app_canvas.setup()
    setup_menu()
    resize()
    redraw()
}

function redraw() {
    context.fillStyle = ColorHelper.to_string(config.background)
    context.fillRect(0, 0, canvas.width, canvas.height)

    app_canvas.update()
    update_mouse_menu()
    draw_keyboard_menu()

    requestAnimationFrame(redraw)
}

