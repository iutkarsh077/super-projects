import 'dotenv/config';
import express from "express";
import DbConnect from "./helpers/dbConnect.js";
import route from './helpers/Routes.js';
import cors from "cors";
import cookieParser from 'cookie-parser';

const app = express();


const port = 3000;

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
    credentials: true
}))
app.use(cookieParser())
app.use('/api/v1', route);

DbConnect().then(() => {
    app.listen(port, () => {
        console.log(`Server is listening at port ${port}`);
    })
}).catch((error)=>{
    console.log(error)
})