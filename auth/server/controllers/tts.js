import "dotenv/config";
import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


const TextToSpeech = async (req, res) => {
    try {
        const { text } = req.body ?? {};

        console.log("text is: ", text)

        if (!text?.trim()) {
            return res.status(400).json({ message: "Text is required", status: false });
        }
        const speechFile = path.resolve("./speech.mp3");

        const mp3 = await openai.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: "coral",
            input: text,
            instructions: "Speak in a cheerful and positive tone.",
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        // await fs.promises.writeFile(speechFile, buffer);

        return res
            .status(200)
            .set("Content-Type", "audio/mpeg")
            .send(buffer);;

    } catch (error) {
        console.log(error);
        return res.json({ message: "Internal Server error", status: false }, { status: 500 })
    }
}

export default TextToSpeech;