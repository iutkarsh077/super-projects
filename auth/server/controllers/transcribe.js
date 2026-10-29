import "dotenv/config";
import { OpenAI } from "openai";
import fs from "fs";

const openai = new OpenAI();

async function transcription() {
  try {
    const filePath = "./freesound_community-speech-94649.mp3";

    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found: ${filePath}`);
    }

    const res = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "gpt-4o-transcribe-diarize",
      response_format: "diarized_json",
    });

    console.log("Transcript:", JSON.stringify(res.text));
  } catch (error) {
    console.error("Error:", error.message);
  }
}


transcription()