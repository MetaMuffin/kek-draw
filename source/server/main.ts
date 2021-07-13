import { CPacket, Packet, SPacket } from "../types"
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
        this.log("info", "connected")
        ws.onmessage = ev => {
            if (!this.initialized) this.init()
            const sev = ev.data.toString()
            let j;
            try { j = JSON.parse(sev) }
            catch (e) { console.log("invalid json. rip client. lol"); ws.close() }
            this.log("debug", "packet", j)
            this.on_message(j)
        }
        ws.onclose = () => {
            this.on_close()
            this.log("info", "closed")
        }
    }
    log(level: Loglevel, ...data: any[]) {
        log(level, `client_${this.id}`, ...data)
    }
    send_packet(packet: SPacket) {
        var s = JSON.stringify(packet)
        this.ws.send(s)
    }
    init() {
        clients.set(this.id, this)
    }

    on_message(p: CPacket) {
        if (!clients.get(this.id)) return console.log("a client was not disconnected correctly...");
        if (p.type == "remove-layer") {
            broadcast(p)
        } else if (p.type == "remove-point") {
            broadcast(p)
        } else if (p.type == "update-layer") {
            broadcast(p)
        } else if (p.type == "update-point") {
            broadcast(p)
        } else if (p.type == "fetch-point") {

        } else if (p.type == "fetch-layer") {

        } else { console.log("Some invalid packet type..."); }
    }


    on_close() {
        clients.delete(this.id)
    }
}
