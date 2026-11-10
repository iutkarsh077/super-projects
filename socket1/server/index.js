import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import redisClient from "./libs/redis.js";

const app = express();

const server = createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

io.on("connection", (socket)=>{
    console.log("connected: ", socket.id);

    socket.on("message", (data)=>{
        console.log(data);
        io.emit("server-message", data);
    })
})


const port = 4000;
server.listen(port, () => {
    redisClient.connect();
    console.log(`Server is listening at port ${port}`);
})