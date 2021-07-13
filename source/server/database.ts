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
                id INT PRIMARY KEY,
                x REAL,
                y REAL,
                quad INT,
                sort REAL,
                layer INT
            )`)
            this.db.run(`CREATE TABLE IF NOT EXISTS layer (
                id INT PRIMARY KEY,
                style TEXT
            )`)
            this.db.run(`CREATE TABLE IF NOT EXISTS quad (
                id INT PRIMARY KEY,
                tl INT, tr INT, bl INT, br INT
            )`)
        });
    }

    async points_in_rect(rect: IRect): Promise<IPoint[]> {
        throw new Error("unimplemented");
    }
    async get_layer(id: ID): Promise<ILayer | undefined> {
        log("warn", "database", "get_layer not implemented")
        return { id, style: DEFAULT_STYLE() }
    }
    async update_layer(l: ILayer) {
        log("warn", "database", "update_layer not implemented")
    }
    async remove_layer(id: ID) {
        log("warn", "database", "remove_layer not implemented")
    }
    async update_point(p: IPoint) {
        log("warn", "database", "update_point not implemented")
    }
    async remove_point(id: ID) {
        log("warn", "database", "remove_point not implemented")
    }



}
