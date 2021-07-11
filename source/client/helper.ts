import { canvas } from ".";


export function dist(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
}

export function get_mouse_pos(ev: MouseEvent): { x: number, y: number } {
    var rect = canvas.getBoundingClientRect();
    return {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top
    }
}



export function make_void_arg<T>(fn: (arg: T) => any): (arg: T) => void {
    return (arg) => {
        fn(arg)
        return
    }
}

export function make_void<T>(fn: () => any): () => void {
    return () => {
        fn()
        return
    }
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}
