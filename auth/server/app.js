import dotenv from "dotenv";
import e from "express";
import cors from "cors";
import route from "./Route.js";
import DbConnect from "./libs/dbConnect.js";
import cookieParser from "cookie-parser";
import TokenBucketRateLimit from "./libs/tokenbucket.js";
import multer from "multer";
import fs from "fs";
import transcription from "./controllers/transcribe.js";
import TextToSpeech from "./controllers/tts.js";
import VoiceAgent from "./controllers/voiceagent.js";
dotenv.config();


const app = e();
app.use(e.json());
app.use(cookieParser());
app.use(e.json());

fs.mkdirSync("uploads", { recursive: true });

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}.webm`);
    }
})

const uploads = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 20
    }
})


app.use(cors({
    credentials: true,
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}))
app.use(TokenBucketRateLimit)

app.post("/tts", TextToSpeech)
app.post("/voiceagent", uploads.single("audio"), VoiceAgent)
app.use("/audio", uploads.single("audio"), transcription)
app.use("/", route)

DbConnect().then(() => {
    app.listen(3000, () => {
        console.log(`Server is listening at port 3000`)
    })
}).catch((error) => {
    console.log(error);
})
