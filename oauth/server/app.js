import 'dotenv/config';
import e from "express";
import cors from "cors";
import router from './routes/route.js';
const app = e()

app.use(e.json())
app.use(cors({
    methods: ["GET", "POST", "PUT"],
    credentials: true,
    origin: ["*"]
}))

app.use("/", router)

app.listen(4000, ()=>{
    console.log(`Server is listening at port 4000`)
})