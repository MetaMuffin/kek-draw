import Express, { static as estatic, json } from "express";
import { join } from "path";
import Webpack from "webpack"
import WebpackDevMiddleware from "webpack-dev-middleware"
import { existsSync, readFile, readFileSync } from "fs";
import http from "http"
import https from "https"
import expressWs from "express-ws";
import { connect_client, database } from "./main";
import { log, logger_init } from "./logger";

async function main() {
    logger_init()
    log("info", "", "starting")
    const app = Express();
    const app_ws = expressWs(app).app

    const webpackConfig = require('../../webpack.config');
    const compiler = Webpack(webpackConfig)
    const devMiddleware = WebpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
    })
    app.use("/scripts", devMiddleware)

    app.disable("x-powered-by");
    app.use(json());

    app.get("/", (req, res) => {
        res.sendFile(join(__dirname, "../../public/index.html"));
    });

    app.use("/static", estatic(join(__dirname, "../../public")));

    app.get("/favicon.ico", (req, res) => {
        res.sendFile(join(__dirname, "../../public/favicon.ico"));
    });

    app_ws.ws("/api", (ws, req) => {
        connect_client(ws)
    })

    app.get("/close", (req, res) => {
        res.send("ok kek")
        database.db.close() // TODO this is evil
        setTimeout(() => { // TODO this aswell
            process.exit(0)
        }, 500) // TODO maybe dont use a timeout here
    })

    app.use((req, res, next) => {
        res.status(404);
        res.send("This is an error page");
    });

    await database.init()

    const port = parseInt(process.env.PORT ?? "8080")
    app_ws.listen(port, "127.0.0.1", () => {
        log("info", "http", `http bound to 127.0.0.1:${port}`);
    })
}

main();