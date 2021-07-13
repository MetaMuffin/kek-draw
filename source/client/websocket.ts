import { app_canvas } from "."
import { CPacket, SPacket } from "../types"
import { CanvasLayer } from "./canvas"

var ws: WebSocket
export function ws_connect(): Promise<void> {
    return new Promise((res, rej) => {
        ws = new WebSocket(`ws://${window.location.host}/api`)
        ws.onopen = () => {
            console.log("websocket opened")
            res()
        }
        ws.onclose = () => {
            document.body.innerHTML = "<p>websocket closed</p>"
            setTimeout(() => {
                window.location.reload()
            }, 1000)
        }
        ws.onmessage = ev => {
            const sev = ev.data.toString()
            const j = JSON.parse(sev)
            on_packet(j)
        }
    })
}

async function on_packet(packet: SPacket) {
    if (packet.type == "update-point") {
        let layer = app_canvas.layers.find(l => l.id == packet.data.layer)
        if (!layer) {
            layer = new CanvasLayer(app_canvas)
            layer.id = packet.data.layer
            
        }
    }
}

export function send_packet(packet: CPacket) {
    ws.send(JSON.stringify(packet))
}
