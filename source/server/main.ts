import { CPacket, DEFAULT_STYLE, Packet, SPacket } from "../common/types"
import { DatabaseBackend } from "./database"
import { log, Loglevel } from "./logger"

export interface EWS { send: (message: string) => void, onmessage: (ev: any) => void, onclose: (ev: any) => void, close: () => void }

var clients: Map<string, Client> = new Map()
export var database: DatabaseBackend = new DatabaseBackend()

export function connect_client(ws: EWS) {
    new Client(ws)
}

export function broadcast(packet: SPacket) {
    log("debug", "broadcast", packet)
    clients.forEach(c => c.send_packet(packet))
}

export class Client {
    public id: string
    private initialized = false
    private ws: EWS

    constructor(ws: EWS) {
        this.id = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart("0xFFFFFF".length, "0").substr(2)
        this.ws = ws
        clients.set(this.id, this)
        this.log("info", "connected")
        ws.onmessage = ev => {
            if (!this.initialized) this.init()
            const sev = ev.data.toString()
            let j;
            try { j = JSON.parse(sev) }
            catch (e) { console.log("invalid json. rip client. lol"); ws.close() }
            this.on_message(j)
        }
        ws.onclose = () => {
            this.on_close()
            this.log("info", "closed")
            clients.delete(this.id)
        }
    }
    log(level: Loglevel, ...data: any[]) {
        log(level, `client_${this.id}`, ...data)
    }
    send_packet(packet: SPacket) {
        this.log("debug", "send", packet)
        var s = JSON.stringify(packet)
        this.ws.send(s)
    }
    init() {
        clients.set(this.id, this)
    }

    async on_message(p: CPacket) {
        this.log("debug", "receive", p)
        if (!clients.get(this.id)) return console.log("a client was not disconnected correctly...");
        if (p.type == "remove-layer") {
            broadcast(p)
            database.remove_layer(p.id)
        } else if (p.type == "remove-point") {
            broadcast(p)
            database.remove_point(p.id)
        } else if (p.type == "update-layer") {
            broadcast(p)
            database.update_layer(p.data)
        } else if (p.type == "update-point") {
            broadcast(p)
            database.update_point(p.data)
        } else if (p.type == "fetch-point") {
            this.log("warn", "fetch-point not implemented")
        } else if (p.type == "fetch-layer") {
            let l = await database.get_layer(p.id)
            if (!l) this.send_packet({ type: "log", message: "layer not found" })
            else this.send_packet({ type: "update-layer", data: l })
        } else { console.log("Some invalid packet type..."); }
    }

    on_close() {
        clients.delete(this.id)
    }
}
