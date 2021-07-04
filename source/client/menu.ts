import { canvas, context } from "."
import { Color } from "./color"
import { dist } from "./helper"
import { menu_root } from "./menu_tree"



const SELECT_RADIUS = 100
const SELECT_RING_THICKNESS = 30

export interface MenuState {
    current_menu: MenuTree[]
    last_sel_start: { x: number, y: number }
    first_sel_start: { x: number, y: number }
}

export interface MenuTree {
    label: string
    select?: () => undefined | void | MenuTree[]
    tint?: Color
}



var mstate: MenuState | undefined
var mouse: { x: number, y: number, pressed: boolean } = { x: 0, y: 0, pressed: false }

export function setup_menu() {
    document.addEventListener("mousemove", (ev) => {
        var rect = canvas.getBoundingClientRect();
        mouse.x = ev.clientX - rect.left
        mouse.y = ev.clientY - rect.top
    })
    document.addEventListener("contextmenu", (ev) => ev.preventDefault())
    document.addEventListener("mousedown", (ev) => {
        if (ev.button != 2) return
        ev.preventDefault()
        mouse.pressed = true
        mstate = { current_menu: menu_root(), first_sel_start: { x: mouse.x, y: mouse.y }, last_sel_start: { x: mouse.x, y: mouse.y } }
    })
    document.addEventListener("mouseup", (ev) => {
        if (ev.button != 2) return
        ev.preventDefault()
        mouse.pressed = false
        mstate = undefined
    })
}

export function update_menu() {
    if (mstate) {
        const st = mstate.current_menu
        const seg_size = Math.PI * 2 / st.length
        for (let pass = 0; pass < 2; pass++) {
            for (let i = 0; i < st.length; i++) {
                const item = st[i];
                var r = i / st.length * Math.PI * 2
                const x = Math.sin(r) * SELECT_RADIUS + mstate.last_sel_start.x
                const y = Math.cos(r) * SELECT_RADIUS + mstate.last_sel_start.y

                if (pass == 1) {
                    context.fillStyle = "white"
                    context.font = "32px sans-serif"
                    context.textAlign = "center"
                    context.textBaseline = "middle"
                    context.fillText(item.label, x, y)
                }
                if (pass == 0) {
                    if (item.tint) context.fillStyle = item.tint.with_alpha(0.3).value
                    else context.fillStyle = "rgba(255,255,255,0.2)"

                    context.strokeStyle = "black"
                    context.beginPath()
                    const off = 0
                    context.arc(mstate.last_sel_start.x, mstate.last_sel_start.y, SELECT_RADIUS, -r - seg_size / 2 + off, -r + seg_size / 2 + off)
                    context.arc(mstate.last_sel_start.x, mstate.last_sel_start.y, SELECT_RADIUS + SELECT_RING_THICKNESS, -r + seg_size / 2 + off, -r - seg_size / 2 + off, true)
                    context.fill()
                    context.stroke()
                }

            }
        }
        let d = dist(mouse.x, mouse.y, mstate.last_sel_start.x, mstate.last_sel_start.y)
        let a = Math.atan2(mouse.x - mstate.last_sel_start.x, mouse.y - mstate.last_sel_start.y)
        if (a < 0) a += Math.PI * 2
        if (d > SELECT_RADIUS) {
            const item_index = Math.floor(a * st.length / Math.PI / 2 + 0.5) % st.length
            mstate.last_sel_start.x = mouse.x
            mstate.last_sel_start.y = mouse.y
            const selection = st[item_index]
            if (selection.select) {
                const subtree = selection.select()
                if (!subtree) return mstate = undefined
                mstate.current_menu = subtree
            }
            else mstate = undefined
        }
    }
}
