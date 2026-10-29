import fs from "fs";
import { unlink } from "node:fs/promises";
import { OpenAI } from "openai";
import "dotenv/config";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function transcription(req, res) {
    if (!req.file) {
        return res.status(400).json({
            message: "Audio file is required",
        });
    }

    try {
        const result = await openai.audio.transcriptions.create({
            file: fs.createReadStream(req.file.path),
            model: "gpt-4o-transcribe",
        });

        return res.json({ text: result.text });
    } catch (error) {
        console.error("Transcription error:", error);

        return res.status(500).json({
            message: "Audio transcription failed",
        });
    } finally {
        await unlink(req.file.path).catch(() => {});
    }
}

export default transcription;