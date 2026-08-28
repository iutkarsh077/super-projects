import dotenv from "dotenv";
import e from "express";
import cors from "cors";
import route from "./Route.js";
import DbConnect from "./libs/dbConnect.js";
import cookieParser from "cookie-parser";
import TokenBucketRateLimit from "./libs/tokenbucket.js";
dotenv.config();


const app = e();
app.use(e.json());
app.use(cookieParser());

app.use(cors({
    credentials: true,
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}))
app.use(TokenBucketRateLimit)
app.use("/", route)

DbConnect().then(() => {
    app.listen(3000, () => {
        console.log(`Server is listening at port 3000`)
    })
}).catch((error) => {
    console.log(error);
})
