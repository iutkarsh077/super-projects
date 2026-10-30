import fs from "fs";
import { unlink } from "node:fs/promises";
import { OpenAI } from "openai";
import "dotenv/config";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


const messages = [];
const VoiceAgent = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            message: "Audio file is required",
        });
    }
    try {

        console.log("file: ", req.file.path)
        const result = await openai.audio.transcriptions.create({
            file: fs.createReadStream(req.file.path),
            model: "gpt-4o-transcribe",

        });

        if (!result.text) {
            throw new Error("No text from openai");
        }
        const response = await openai.responses.create({
            model: "gpt-5.4-mini",
            input: [
                ...messages,
                {
                    role: "user",
                    content: result.text
                }
            ],
            instructions: `
        Respond in the same language as the input text.
        Do not translate it into another language.
        Preserve the original meaning.
    `,
        });

        console.log(response.output_text)
        messages.push({
            role: "assistant",
            content: response.output_text
        });
        const mp3 = await openai.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: "coral",
            input: response.output_text,
            instructions: `Speak in a cheerful and positive tone.`,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        return res
            .status(200)
            .set("Content-Type", "audio/mpeg")
            .send(buffer);

    } catch (error) {
        console.log(error);
        return res.json({ message: "Internal Server error", status: false });
    }
}

export default VoiceAgent;