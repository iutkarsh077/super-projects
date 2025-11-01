import "dotenv/config"
import express from "express";
import http from "http";
import { Server } from "socket.io"

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
         methods: ["GET", "POST"],
    },
    maxHttpBufferSize: 10 * 1024 *  1024
})

let counter = new Map();
io.on("connection", (socket)=>{
    console.log(`A new user is connected: ${socket.id}`);
    socket.on("welcome", ()=>{
        socket.emit("welcome-notification", `Welcome ${socket.id}`)
    })

    socket.on("send-message", ({roomId, message})=>{
        console.log(message)
        socket.to(roomId).emit("receive-message", message);
    })

    socket.on("editor-content-server", ({roomId, content})=>{
        console.log(roomId, content)
        socket.to(roomId).emit("editor-content-client", content);
    })

    socket.on("disconnect", ()=>{
        counter.delete(socket.id)
        console.log("User disconnected:", {id: socket.id, count: counter.size});
        io.emit("disconnect1", {id: socket.id, count: counter.size})
    })

    socket.on("typing-alert-server", ({roomId, socketId, text}) =>{
        socket.to(roomId).emit("typing-alert-client", {socket: socketId, message: `${socketId} is typing...`, text})
    })

    socket.on("stop-typing-alert-server", ({roomId, socketId, text}) =>{
        socket.to(roomId).emit("stop-typing-alert-client", {socket: socketId, message: `${socketId} is typing...`, text})
    })

    socket.on("join-room", ({roomId, socketId})=>{
        console.log(roomId, socketId)
        socket.join(roomId);
        counter.set(socket.id, 1);
        io.to(roomId).emit("join-room-notification", {message: `${socketId} joined the room ${roomId}`, count: counter.size});
    })

    socket.on("send-file", ({buffer, roomId, type})=>{
        console.log("file sended", buffer.byteLength, " bytes");
        socket.to(roomId).emit("receive-file",  {buffer, type: type});
    })

    socket.onAny((event, ...args)=>{
        console.log("Event name is: ", event)
    })
})

const port = process.env.PORT || 4000;
server.listen(port, ()=>{
    console.log(`Server is listening at port ${port}`);
})