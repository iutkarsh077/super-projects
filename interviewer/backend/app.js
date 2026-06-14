require("dotenv").config();

const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const { z } = require("zod");
const cors = require("cors")
const Interview = require("./models/Interview");
const InitSocket = require("./helpers/Socket");
require("./models/Message");

const app = express();
const port = process.env.PORT || 4000;
const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

app.use(cors({
  origin: frontendUrl,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

const checkGithubType = z.object({
  githubUrl: z.string().min(7, {
    message: "Min Length should be 7",
  }).max(40, {
    message: "Max length should be 40",
  }),
});

const sessionConfig = JSON.stringify({
  type: "realtime",
  model: "gpt-realtime-2",
  audio: { output: { voice: "marin" } },
});

app.use(express.json());
app.use(express.text({ type: "application/sdp" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/github", async (req, res) => {
  try {
    const parsed = checkGithubType.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid GitHub URL",
        details: parsed.error.flatten(),
      });
    }

    const githubUserName = parsed.data.githubUrl.split("/").filter(Boolean).pop();

    if (!githubUserName) {
      return res.status(400).json({ error: "Invalid GitHub URL" });
    }

    const githubResponse = await axios.get(
      `https://api.github.com/users/${githubUserName}/repos`
    );

    const githubInfo = githubResponse.data.map((item) => ({
      name: item.name,
      description: item.description,
      stars: item.stargazers_count,
    }));

    const saveData = await Interview.create({
      githubMetaData: githubInfo,
    });

    return res.status(201).json({
      message: "User created successfully",
      data: saveData._id.toString(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/session/:id", async (req, res) => {
  try {
    const sdpOffer = req.body;

    const gitData = await Interview.findById(req.params.id);

    const fd = new FormData();
    fd.set("sdp", sdpOffer);
    fd.set("session", sessionConfig);

    const realtimeResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Safety-Identifier": "hashed-user-id",
      },
      body: fd,
    });

    const sdp = await realtimeResponse.text();

    if (!realtimeResponse.ok) {
      return res.status(realtimeResponse.status).json({
        error: "OpenAI Realtime session failed",
        details: sdp,
      });
    }

    const location = realtimeResponse.headers.get("Location");
    const callId = location?.split("/").pop();

    console.log("Git data: ", gitData);
    console.log("call id: ", callId);
    InitSocket(callId, gitData.githubMetaData, req.params.id)

    return res.type("application/sdp").send(sdp);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  process.exit(0);
});

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  });
