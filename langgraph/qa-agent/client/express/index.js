import "dotenv/config";
import express from "express"
import cors from "cors"
import router from "./routers.js";
import cookieParser from "cookie-parser";
import DbConnect from "./helpers/dbConnect.js";
const app = express();

const frontend = process.env.FRONTEND_ORIGIN
app.use(cors({
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    origin: frontend || "http://localhost:5173",
    credentials: true,
}))


app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", router);
const port = process.env.PORT


const startServer = async () => {
    await DbConnect();
    app.listen(port || 3000, () => {
        console.log(`Server is running at port ${port || 3000}`)
    })
};

startServer().catch((error) => {
    console.error("Server failed to start", error.message);
    process.exit(1);
});
