import { Database } from "sqlite3"
import { DEFAULT_STYLE, ID, ILayer, IPoint, IRect } from "../common/types";
import { log } from "./logger";



export class DatabaseBackend {
    protected db: Database;

    constructor() {
        this.db = new Database(":memory:")
    }
    async init() {
        log("info", "database", "initializing database")
        // TODO do some stuff here
        this.db.serialize(() => {
            this.db.run(`CREATE TABLE IF NOT EXISTS point (
                not_id INT PRIMARY KEY UNIQUE,
                x REAL,
                y REAL,
                quad INT,
                sort REAL,
                layer INT,
                stroke INT
            )`)
            this.db.run(`CREATE TABLE IF NOT EXISTS layer (
                not_id INT PRIMARY KEY UNIQUE,
                style TEXT
            )`)
            this.db.run(`CREATE TABLE IF NOT EXISTS quad (
                not_id INT PRIMARY KEY UNIQUE,
                tl INT, tr INT, bl INT, br INT
            )`)
        });
    }

    points_in_rect(rect: IRect): Promise<IPoint[]> {
        return new Promise(res => {
            // TODO use a quad-tree to improve performance
            // TODO protect against sql injection
            this.db.all(`SELECT * FROM point WHERE x > ${rect.tl.x} AND x < ${rect.br.x} AND y > ${rect.tl.y} AND y < ${rect.br.y}`, (err, rows) => {
                res(rows.map(r => ({
                    id: r.not_id,
                    order: r.sort,
                    layer: r.layer,
                    x: r.x,
                    y: r.y,
                    quad: r.quad,
                    stroke: r.stroke
                })))
            })
        })
    }
    async get_layer(id: ID): Promise<ILayer | undefined> {
        log("warn", "database", "get_layer not implemented")
        return { id, style: DEFAULT_STYLE() }
    }
    async update_layer(l: ILayer) {
        // TODO protect against sql injection
        this.db.prepare(`
            INSERT INTO layer (not_id, style) 
            VALUES (?, ?)
            ON CONFLICT (not_id) DO UPDATE SET style=?
        `).run(l.id, l.style, l.style)
    }
    async remove_layer(id: ID) {
        log("warn", "database", "remove_layer not implemented")
    }
    async update_point(p: IPoint) {
        this.db.prepare(`
            INSERT INTO point (not_id, x, y, stroke, layer, sort) 
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT (not_id) DO UPDATE SET x=?,y=?,stroke=?,layer=?,sort=?
        `).run(p.id, p.x, p.y, p.stroke, p.layer, p.order, p.x, p.y, p.stroke, p.layer, p.order)
    }
    async remove_point(id: ID) {
        log("warn", "database", "remove_point not implemented")
    }
}
