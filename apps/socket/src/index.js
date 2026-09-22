"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
var express_1 = require("express");
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var jsonwebtoken_1 = require("jsonwebtoken");
var dotenv_1 = require("dotenv");
var redis_1 = require("@repo/redis");
//  Load environment variables (important because this server is in a separate folder)
dotenv_1.default.config();
var app = (0, express_1.default)();
var server = (0, http_1.createServer)(app);
//  Initialize Socket.io with CORS so your frontend can connect
exports.io = new socket_io_1.Server(server, {
    // path: "/socket", // we are doing this to sockit.io calls in this url "BASE_URL + PATH + "/?EIO=4&transport=websocket" but nginx must be bypasss so we need to set the path
    cors: {
        origin: process.env.SOCKET_CLIENT_ORIGIN,
        methods: ["GET", "POST"],
    },
});
// Helath check of redis
redis_1.default.set("health", "ok");
var value = await redis_1.default.get("health");
console.log("Redis Health " + JSON.stringify(value));
// Basic test route
app.get("/", function (_, res) {
    res.send("\n    <h1>Socket Healthy</h1>\n    <span>Redis:".concat(value, "</span>\n    "));
});
//  The SAME secret used in your HTTP server (access token)
var SOCKET_SECRET = process.env.SOCKET_SECRET;
if (!SOCKET_SECRET) {
    throw new Error("Missing SOCKET_SECRET in .env");
}
/*
=====================================================================
MIDDLEWARE: AUTHENTICATE EVERY SOCKET CONNECTION
=====================================================================

Socket.io lets you run middleware BEFORE a client connects.
This ensures that every WebSocket connection has a valid token.

- The client must send `auth: { token: "JWT_TOKEN" }`
- We verify the token using the SAME secret as HTTP
- If valid → attach user to socket.data
- If invalid → block connection

This lets us attach movements and events to REAL logged-in users.
*/
exports.io.use(function (socket, next) {
    var _a;
    var token = (_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.token;
    if (!token)
        return next(new Error("No socket token provided"));
    try {
        var user = jsonwebtoken_1.default.verify(token, SOCKET_SECRET);
        socket.data.user = user; //  Best practice: store user info here
        next();
    }
    catch (err) {
        next(new Error("Invalid socket token"));
    }
});
/*
=====================================================================
SOCKET EVENT: USER CONNECTS
=====================================================================

Every time a client connects successfully:
- socket.id = unique ID for this websocket session
- socket.data.user = authenticated user (from JWT)
*/
exports.io.on("connection", function (socket) { return __awaiter(void 0, void 0, void 0, function () {
    var user, date, lastPostion;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user = socket.data.user;
                date = new Date(Date.now());
                // console.log(
                //   "A new user connected:",
                //   "socketId =",
                //   socket.id,
                //   "| userId =",
                //   user.id,
                //   "| time =",
                //   date.toISOString()
                // );
                /*
                =====================================================================
                 EVENT: USER MOVES THEIR AVATAR
                =====================================================================
              
                - The frontend emits `move-avatar` whenever the player moves.
                - The data contains the new coordinates + direction.
                - We attach userId to the movement (so others know WHO moved).
                - `socket.broadcast.emit` sends the update to all OTHER players.
                */
                socket.on("move-avatar", function (data) { return __awaiter(void 0, void 0, void 0, function () {
                    var id, username, x, y, direction;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                id = data.id, username = data.username, x = data.x, y = data.y, direction = data.direction;
                                if (!direction) return [3 /*break*/, 2];
                                return [4 /*yield*/, redis_1.default.hset("user:".concat(id, ":position"), {
                                        id: id,
                                        username: username,
                                        x: String(x),
                                        y: String(y),
                                        direction: direction,
                                    })];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2:
                                socket.broadcast.emit("other-avatar-move", data);
                                return [2 /*return*/];
                        }
                    });
                }); });
                socket.on("chat-message", function (data) {
                    socket.broadcast.emit("chat-message", data);
                });
                socket.on("voice-offer", function (_a) {
                    var offer = _a.offer, userId = _a.userId;
                    socket.broadcast.emit("voice-offer", { offer: offer, userId: userId });
                });
                socket.on("voice-ice", function (_a) {
                    var candidate = _a.candidate, userId = _a.userId;
                    socket.broadcast.emit("voice-ice", { candidate: candidate, userId: userId });
                });
                socket.on("voice-answer", function (_a) {
                    var answer = _a.answer, userId = _a.userId;
                    socket.broadcast.emit("voice-answer", { answer: answer, userId: userId });
                });
                socket.on("voice-call-offer", function (_a) {
                    var userId = _a.userId;
                    socket.broadcast.emit("voice-call-offer", { userId: userId });
                });
                return [4 /*yield*/, redis_1.default.hgetall("user:".concat(user.id, ":position"))];
            case 1:
                lastPostion = _a.sent();
                // console.log(JSON.stringify(lastPostion));
                if (Object.keys(lastPostion).length > 0) {
                    console.log("last pos sent");
                    socket.emit("last-position", lastPostion);
                }
                /*
                =====================================================================
                 EVENT: USER DISCONNECTS
                =====================================================================
              
                This fires when:
                - user closes browser
                - loses connection
                - refreshes page
                */
                socket.on("disconnect", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        console.log("User disconnected:", user.id);
                        socket.broadcast.emit("user-disconnected", user.id);
                        return [2 /*return*/];
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); });
// Start WebSocket server
server.listen(5000, function () {
    console.log("Socket server running on port 5000");
});
// ----------------------------- OLD CODE ------------------------------
// import express from "express";
// const app = express();
// import { createServer } from "http";
// import { Server } from "socket.io";
// const server = createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//   },
// });
// app.get("/", (req, res) => {
//   res.send("<h1>Hello World</h1>");
// });
// //This sets up an event listener for when any client connects to the Socket.io server.
// //Each connected client gets a unique socket.
// io.on("connection", (socket) => {
//   let date = new Date(Date.now());
//   console.log("A new user connected", socket.id, date.toISOString());
//   //Listens for a "move-avatar" event sent from this client. The event includes some data — typically the avatar's position or state.
//   socket.on("move-avatar", (data) => {
//     socket.broadcast.emit("other-avatar-move", data); //Takes the received data and sends an "avatar-move" event to all other clients except the one who sent the original event.
//   });
// });
// server.listen(5000, () => {
//   console.log("server runnig on 5000");
// });
