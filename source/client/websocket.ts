import { app_canvas } from "."
import { CPacket, ID, ILayer, SPacket } from "../common/types"
import { CanvasLayer, Stroke } from "./canvas"

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

const packet_listeners: ((packet: SPacket) => void)[] = []

function fetch_layer(id: ID): Promise<ILayer | undefined> {
    return new Promise(res => {
        send_packet({ type: "fetch-layer", id })
        const fn = (p: SPacket) => {
            if (p.type != "update-layer") return
            if (p.data.id != id) return
            res(p.data)
            packet_listeners.splice(packet_listeners.findIndex(f => f == fn))
        }
        packet_listeners.push(fn)
    })
}

async function on_packet(packet: SPacket) {
    // console.log(packet);
    packet_listeners.forEach(l => l(packet))
    if (packet.type == "update-point") {
        let layer = app_canvas.layers.find(l => l.id == packet.data.layer)
        if (!layer) {
            layer = new CanvasLayer(app_canvas)
            layer.id = packet.data.layer
            const layer_data = await fetch_layer(layer.id)
            if (!layer_data) throw new Error("ashdajskdhf");
            layer.style = layer_data.style
            app_canvas.layers.push(layer)
        }
        let stroke = layer.strokes.get(packet.data.stroke)
        if (!stroke) {
            stroke = new Stroke(layer)
            stroke.id = packet.data.stroke
            layer.strokes.set(stroke.id, stroke)
        }
        const existing = stroke.points.find(p => p.id == packet.data.id)
        if (existing) {
            existing.x = packet.data.x
            existing.y = packet.data.y
            existing.layer = packet.data.layer
            existing.quad = packet.data.quad
            existing.stroke = packet.data.stroke
        } else {
            stroke.points.push(packet.data)
            stroke.points.sort((a, b) => a.order - b.order)
        }
    } else if (packet.type == "update-layer") {
        let layer = app_canvas.layers.find(l => l.id == packet.data.id)
        if (!layer) {
            layer = new CanvasLayer(app_canvas)
            layer.id = packet.data.id
            app_canvas.layers.push(layer)
        }
        layer.style = packet.data.style
    } else {
        throw new Error("nobody wanted to implement this yet");
    }
}

export function send_packet(packet: CPacket) {
    ws.send(JSON.stringify(packet))
}
