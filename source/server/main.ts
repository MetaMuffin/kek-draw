import { CPacket, Packet, SPacket } from "../types"

export interface EWS { send: (message: string) => void, onmessage: (ev: any) => void, onclose: (ev: any) => void, close: () => void }

var clients: Map<string, Client> = new Map()


export function connect_client(ws: EWS) {
}

export function broadcast(packet: SPacket) {
    clients.forEach(c => c.send_packet(packet))
}

export class Client {
    public id: string
    private initialized = false
    private ws: EWS

    constructor(ws: EWS) {
        this.id = Math.random().toString()
        this.ws = ws
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
        }

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
        } else if (p.type == "view-request") {

        } else { console.log("Some invalid packet type..."); }
    }


    on_close() {
        clients.delete(this.id)
    }
}
