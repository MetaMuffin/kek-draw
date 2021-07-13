import { Database } from "sqlite3"
import { ID, ILayer, IPoint, IRect } from "../types";
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

    points_in_rect(rect: IRect): IPoint[] {
        throw new Error("unimplemented");
    }
    get_layer(id: ID): ILayer | undefined {
        throw new Error("unimplemented");
    }
    update_layer(l: ILayer) {
        log("warn", "database", "update_layer not implemented")
    }
    delete_layer(id: ID) {
        log("warn", "database", "delete_layer not implemented")
    }
    update_point(p: IPoint) {
        log("warn", "database", "update_point not implemented")
    }
    delete_point(id: ID) {
        log("warn", "database", "delete_point not implemented")
    }



}
