import 'dotenv/config';
import express from "express";
import DbConnect from "./helpers/dbConnect.js";
import route from './helpers/Routes.js';

const app = express();


const port = 3000;

app.use(express.json());

app.use('/api/v1', route);

DbConnect().then(() => {
    app.listen(port, () => {
        console.log(`Server is listening at port ${port}`);
    })
}).catch((error)=>{
    console.log(error)
})