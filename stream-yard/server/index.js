import express from "express";
import http from "http";
import { Server } from "socket.io";
import { spawn } from 'child_process'

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

const options = [
    '-i',
    '-',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-r', `${25}`,
    '-g', `${25 * 2}`,
    '-keyint_min', 25,
    '-crf', '25',
    '-pix_fmt', 'yuv420p',
    '-sc_threshold', '0',
    '-profile:v', 'main',
    '-level', '3.1',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', 128000 / 4,
    '-f', 'flv',
    `rtmp://a.rtmp.youtube.com/live2/youtube_live_stream_key`,
];

const ffmpegProcess = spawn('ffmpeg', options);

io.on("connection", (socket)=>{
    console.log(`A user is connected: ${socket.id}`)

    socket.on("binaryStream", (stream)=>{
        console.log(stream);
         ffmpegProcess.stdin.write(stream, (err) => {
            console.log('Err', err)
        })
    })

    socket.on("disconnect", ()=>{
        console.log(`A user is disconnected: ${socket.id}`);
    })
})
server.listen(3000, ()=>{
    console.log(`Server is listening at port 3000`);
})