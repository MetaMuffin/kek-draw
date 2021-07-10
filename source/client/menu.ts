import { canvas, context, shift } from "."
import { Color } from "./color"
import { K_MENU } from "./config"
import { dist } from "./helper"
import { menu_root } from "./menu_tree"



const SELECT_RADIUS = 100
const SELECT_RING_THICKNESS = 30

export interface MouseMenuState {
    current_menu: MenuTree[]
    last_sel_start: { x: number, y: number }
    first_sel_start: { x: number, y: number }
}
export interface KeyboardMenuState {
    current_menu: MenuTree[]
    path: string[]
}

export interface MenuTree {
    label: string
    select?: () => undefined | void | MenuTree[],
    keybind?: string
    tint?: Color
}

var mstate_mouse: MouseMenuState | undefined
var mstate_keyboard: KeyboardMenuState | undefined
var mouse: { x: number, y: number, pressed: boolean } = { x: 0, y: 0, pressed: false }

function default_keyboard_menu_state(): KeyboardMenuState { return { current_menu: menu_root(), path: ["root"] } }

export function setup_menu() {
    mstate_keyboard = default_keyboard_menu_state()
    document.addEventListener("mousemove", (ev) => {
        var rect = canvas.getBoundingClientRect();
        mouse.x = ev.clientX - rect.left
        mouse.y = ev.clientY - rect.top
    })
    document.addEventListener("contextmenu", (ev) => ev.preventDefault())
    document.addEventListener("mousedown", (ev) => {
        if (ev.button != K_MENU[0] || shift != K_MENU[1]) return
        ev.preventDefault()
        mouse.pressed = true
        mstate_mouse = { current_menu: menu_root(), first_sel_start: { x: mouse.x, y: mouse.y }, last_sel_start: { x: mouse.x, y: mouse.y } }
    })
    document.addEventListener("mouseup", (ev) => {
        if (ev.button != K_MENU[0] || shift != K_MENU[1]) return
        ev.preventDefault()
        mouse.pressed = false
        mstate_mouse = undefined
    })
    document.addEventListener("keydown", (ev) => {
        if (!mstate_keyboard) return
        if (ev.code == "Escape") {
            ev.preventDefault()
            mstate_keyboard = default_keyboard_menu_state()
        }
        for (const o of mstate_keyboard.current_menu) {
            if (o.keybind == ev.key) {
                ev.preventDefault()
                if (!o.select) return mstate_keyboard = default_keyboard_menu_state()
                const submenu = o.select()
                mstate_keyboard.path.push(o.label)
                if (submenu) mstate_keyboard.current_menu = submenu
                else mstate_keyboard = default_keyboard_menu_state()
            }
        }
    })
}

export function draw_keyboard_menu() {
    if (!mstate_keyboard) return
    context.font = "24px sans-serif"
    context.textAlign = "left"
    context.textBaseline = "bottom"
    var base = canvas.height - 24 * mstate_keyboard.current_menu.length
    for (const o of mstate_keyboard.current_menu) {
        context.fillStyle = "#ffc72b"
        if (o.keybind) context.fillText(o.keybind, 0, base)
        context.fillStyle = "white"
        context.fillText(o.label, 64, base)
        base += 24
    }
    context.fillStyle = "#3477eb"
    context.fillText(mstate_keyboard.path.join(" -> "), 0, base)
}

export function update_mouse_menu() {
    if (mstate_mouse) {
        const st = mstate_mouse.current_menu
        const seg_size = Math.PI * 2 / st.length
        for (let pass = 0; pass < 2; pass++) {
            for (let i = 0; i < st.length; i++) {
                const item = st[i];
                var r = i / st.length * Math.PI * 2
                const x = Math.sin(r) * SELECT_RADIUS + mstate_mouse.last_sel_start.x
                const y = Math.cos(r) * SELECT_RADIUS + mstate_mouse.last_sel_start.y

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
                    context.arc(mstate_mouse.last_sel_start.x, mstate_mouse.last_sel_start.y, SELECT_RADIUS, -r - seg_size / 2 + off, -r + seg_size / 2 + off)
                    context.arc(mstate_mouse.last_sel_start.x, mstate_mouse.last_sel_start.y, SELECT_RADIUS + SELECT_RING_THICKNESS, -r + seg_size / 2 + off, -r - seg_size / 2 + off, true)
                    context.fill()
                    context.stroke()
                }

            }
        }
        let d = dist(mouse.x, mouse.y, mstate_mouse.last_sel_start.x, mstate_mouse.last_sel_start.y)
        let a = Math.atan2(mouse.x - mstate_mouse.last_sel_start.x, mouse.y - mstate_mouse.last_sel_start.y)
        if (a < 0) a += Math.PI * 2
        if (d > SELECT_RADIUS) {
            const item_index = Math.floor(a * st.length / Math.PI / 2 + 0.5) % st.length
            mstate_mouse.last_sel_start.x = mouse.x
            mstate_mouse.last_sel_start.y = mouse.y
            const selection = st[item_index]
            if (selection.select) {
                const subtree = selection.select()
                if (!subtree) return mstate_mouse = undefined
                mstate_mouse.current_menu = subtree
            }
            else mstate_mouse = undefined
        }
    }
}
