import express from "express";
import cors from "cors";
import { PORT } from "./env";
import { Server } from "socket.io";
import http from "http";
import { setupSocket } from "./webSocket/socket";
const app = express();

app.use(cors());

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setupSocket(io);

server.listen(PORT, () => {
  console.log(`SERVER STARTED ON ${PORT}`);
});
