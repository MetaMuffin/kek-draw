import { Canvas } from "./canvas"
import { setup_menu, update_menu } from "./menu"


export var canvas: HTMLCanvasElement
export var context: CanvasRenderingContext2D

export var config: { background: string } = { background: "black" }
export const app_canvas = new Canvas()

window.onload = () => {
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
    context.fillStyle = config.background
    context.fillRect(0, 0, canvas.width, canvas.height)

    app_canvas.update()
    update_menu()

    requestAnimationFrame(redraw)
}

