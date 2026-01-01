import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import redisClient from "@repo/redis";

//  Load environment variables (important because this server is in a separate folder)
dotenv.config();

const app = express();
const server = createServer(app);

//  Initialize Socket.io with CORS so your frontend can connect
export const io = new Server(server, {
  // path: "/socket", // we are doing this to sockit.io calls in this url "BASE_URL + PATH + "/?EIO=4&transport=websocket" but nginx must be bypasss so we need to set the path
  cors: {
    origin: process.env.SOCKET_CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// Helath check of redis
redisClient.set("health", "ok");
const value = await redisClient.get("health");
console.log("Redis Health " + JSON.stringify(value));

// Basic test route
app.get("/", (_, res) => {
  res.send(`
    <h1>Socket Healthy</h1>
    <span>Redis:${value}</span>
    `);
});

//  The SAME secret used in your HTTP server (access token)
const SOCKET_SECRET = process.env.SOCKET_SECRET;
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
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) return next(new Error("No socket token provided"));

  try {
    const user = jwt.verify(token, SOCKET_SECRET);
    socket.data.user = user; //  Best practice: store user info here
    next();
  } catch (err) {
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
io.on("connection", async (socket) => {
  const user = socket.data.user;
  // console.log(user);
  // redisClient.set(`user:${user.id}:profile`, String(user.id));
  let date = new Date(Date.now());
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
  socket.on("move-avatar", async (data) => {
    // data.userId = user.id; // attach real user ID from the token
    // console.log("Data" + JSON.stringify(data)); // keys:id,username,x,y,direction,avatar
    const { id, username, x, y, direction } = data;
    if (direction) {
      await redisClient.hset(`user:${id}:position`, {
        id,
        username,
        x: String(x),
        y: String(y),
        direction,
      });
    }
    socket.broadcast.emit("other-avatar-move", data);
  });

  socket.on("chat-message", (data) => {
    socket.broadcast.emit("chat-message", data);
  });

  const lastPostion = await redisClient.hgetall(`user:${user.id}:position`);
  // console.log(JSON.stringify(lastPostion));
  if (Object.keys(lastPostion).length > 0){
      console.log("last pos sent")
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
  socket.on("disconnect", async () => {
    console.log("User disconnected:", user.id);
    socket.broadcast.emit("user-disconnected", user.id);
    // await redisClient.del(`user:${user.id}:position`);
  });
});

// Start WebSocket server
server.listen(5000, () => {
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
