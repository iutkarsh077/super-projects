import express from "express";

const app = express();

const mp = new Map();
app.use(express.json());

function GenerateShortUrl() {
    const BASE62_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let shortUrl = "";
    for (let i = 0; i < 5; i++) {
        const randomItem = Math.floor(Math.random() * BASE62_CHARS.length);
        shortUrl += BASE62_CHARS[randomItem];
    }

    return shortUrl;
}

app.get("/get-url/:url", async (req, res) => {
    try {
        const { url } = req.params;

        console.log("url is: ", url);

        if(!mp.get(url)){
            throw new Error("Url does not exist");
        }

        console.log(mp.get(url))

        return res.redirect(mp.get(url));
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message, status: false });
    }
})

app.post("/short-url", async (req, res) => {
    try {
        const { url } = req.body;

        console.log(url);
        const answer = GenerateShortUrl();
        mp.set(answer, url);

        return res.status(200).json({ message: "Success", data: answer, status: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server error", status: false });
    }
})

app.listen(3000, () => {
    console.log(`server is running at port 3000`);
})