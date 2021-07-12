import { Database } from "sqlite3"
import { ID, ILayer, IPoint, IRect } from "../types";

var db = new Database(':memory:');

db.serialize(function () {
    db.run(`CREATE TABLE IF NOT EXISTS point (
        id INT PRIMARY KEY,
        x REAL,
        y REAL,
        quad INT,
        index INT,
        layer INT
    )`)
    db.run(`CREATE TABLE IF NOT EXISTS layer (
        id INT PRIMARY KEY,
        priority INT,
        style TEXT
    )`)
    db.run(`CREATE TABLE IF NOT EXISTS quad (
        id INT PRIMARY KEY,
        tl INT, tr INT, bl INT, br INT
    )`)


});

db.close()

export class DatabaseBackend {
    protected db: Database;

    constructor() {
        this.db = new Database(":memory:")
    }
    async init() { }


    points_in_rect(rect: IRect): IPoint[] {
        throw new Error("unimplemented");
    }
    get_layer(id: ID): ILayer | undefined {
        throw new Error("unimplemented");
    }
    


}
