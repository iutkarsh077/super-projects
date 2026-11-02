import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from 'socket.io';
import cors from "cors";


const app = express();

app.use(cors({
    methods: ["GET", "POST", "PUT"],
    origin: "http://localhost:3000"
}))

app.use(express.json());

const cachedData = [];

app.get("/health-check", async (req, res)=> {
    try {
        return res.json({message: "Server  is healthy", status: true})  
    } catch (error) {
        return res.json({message: "server has an issue", status: false})
    }
})

app.get("/users", async (req, res) => {
    try {
        throw new Error("Redirect error");
        if (cachedData.length > 0) {
            return res.json({ message: "Cached data", data: cachedData }, { status: true });
        }
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        const data = await response.json();
        cachedData.push(data);
        return res.json({ message: "Got the data successfully", data }, { status: true });
    } catch (error) {
        console.log(error);
        return res.redirect("http://localhost:4000/backup-server");
    }
})

app.get("/backup-server", async (req, res) => {
    try {
        if (cachedData.length > 0) {
            return res.json({ message: "Cached data", data: cachedData }, { status: true });
        }
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        const data = await response.json();
        cachedData.push(data);
        return res.json({ message: "Got the data successfully", data }, { status: true });
    } catch (error) {
        console.log(error);
    }
})


app.listen(4000, () => {
    console.log(`Server is listening at port ${4000}`);
})