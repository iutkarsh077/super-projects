import express from "express";
const app = express()
import fs from "fs";
import path from "path";


app.use(express.json())

const FILE_PATH = path.resolve("urls.json");

async function readDatabase() {
    try {
        const data = fs.readFileSync(FILE_PATH, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

async function writeDatabase(data) {
     fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

app.post("/short-url", async (req, res) => {
    try {
        const { url } = req.body;
        console.log("url is: ", url)

        const now = Date.now();

        const db = await readDatabase();
        db[now] = url;
        await writeDatabase(db);

        return res.status(200).json({ message: "Url shorten successfully", data: `http://localhost:3000/original-url/${now}`, status: true })
    } catch (error) {
        return res.status(500).json({ message: error.message, status: false })
    }
})

app.get("/health", (req, res) => {
    res.send("Hii there this is helath check")
})

app.get("/original-url/:timer", async (req, res) => {
    try {
        const { timer } = req.params;

        const db = await readDatabase();

        const ans = db[timer];

        if (!ans) {
            return res.status(404).json({ message: "URL not found", status: false });
        }
        return res.redirect(ans).status(200).json({ message: "Got original url successfully", data: ans, status: true })
    } catch (error) {
        return res.status(500).json({ message: error.message, status: false })
    }
})

app.listen(3000, () => {
    console.log(`Server is listening at port ${3000}`)
})