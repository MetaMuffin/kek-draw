

export var canvas: HTMLCanvasElement
export var context: CanvasRenderingContext2D

export var config: { background: string } = { background: "black" }

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

    resize()
    redraw()
}

function redraw() {
    context.fillStyle = config.background
    context.fillRect(0, 0, canvas.width, canvas.height)
    
    requestAnimationFrame(redraw)
}

