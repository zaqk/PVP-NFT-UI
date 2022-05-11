/*
 * embed webpack-dev-server
 */
let webpack, webpackDevMiddleware, webpackHotMiddleware, webpackConfig;
webpack = require("webpack");
webpackDevMiddleware = require("webpack-dev-middleware");
webpackConfig = require("../../webpack.config");
webpackHotMiddleware = require("webpack-hot-middleware");


import { Server } from "colyseus";
import http from "http";
import express from "express";
import path from "path";
import basicAuth from "express-basic-auth";
import { monitor } from "@colyseus/monitor";

import { ArenaRoom } from "./rooms/ArenaRoom";

export const port = Number(process.env.PORT || 8080);
export const endpoint = "localhost";

export let STATIC_DIR: string;

const app = express();
const gameServer = new Server({
  server: http.createServer(app),
  express: app
});

gameServer.define("arena", ArenaRoom);

const webpackCompiler = webpack(webpackConfig({}));
app.use(webpackDevMiddleware(webpackCompiler, {}));
app.use(webpackHotMiddleware(webpackCompiler));

STATIC_DIR = path.resolve(__dirname, "..", "..");

app.use("/", express.static(STATIC_DIR));

gameServer.listen(port);
console.log(`Listening on http://${endpoint}:${port}`);
