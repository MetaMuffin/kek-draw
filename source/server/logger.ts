
export type Loglevel = "log" | "info" | "debug" | "warn" | "error"
export const level_colors: { [key in Loglevel]: string } = {
    log: "\x1b[38;2;100;100;100m",
    debug: "\x1b[38;2;100;100;100m",
    info: "\x1b[38;2;255;255;255m",
    warn: "\x1b[38;2;255;255;0m",
    error: "\x1b[38;2;255;0;0m",
}


export function logger_init() {
    console.log = (...d: any[]) => {
        log("debug", "1", ...d)
    }
    console.warn = (...d: any[]) => {
        log("warn", "1", d.join(","))
    }
    console.error = (...d: any[]) => {
        log("error", "1", d.join(","))
    }
}

export function log(level: Loglevel, tag: string, ...data: any[]) {
    const color = level_colors[level]
    const now = new Date(Date.now())
    const message = data.map(s => {
        if (typeof s == "string") return s
        else return JSON.stringify(s)
    }).join(" ")
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`
    process.stdout.write(`${color}[${time}] [${level}] [${tag}] ${message}\n`)
}
