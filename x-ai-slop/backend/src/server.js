require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "32kb" }));

const PORT = process.env.PORT || 5000;

const JEV_URL = "https://api.typesafe.ai/v1/systemone";

app.post("/api/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        error: "Post text is required",
      });
    }

    if (text.length < 20) {
      return res.status(400).json({
        error: "Post is too short to analyze",
      });
    }

    const response = await fetch(JEV_URL, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${process.env.JEV_API_KEY}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        model: "jev-latest",

        state: {
          platform: "X",
          content: text,
          task: "Analyze whether this social media post appears to be AI-generated or low-effort AI slop."
        },

        questions: {
          ai_slop: {
            type: "noul",

            instructions:
              "Is this post likely to be AI-generated social media slop? Consider generic phrasing, excessive motivational language, repetitive structure, unnatural polish, empty claims, formulaic hooks, excessive emojis, artificial engagement bait, vague statements, and lack of specific firsthand information. Do not assume that polished writing or unusual punctuation alone proves AI generation.",

            criteria: {
              true: "Strong signals that the post is AI-generated or low-effort AI-assisted content.",
              false: "The post appears reasonably specific, natural, substantive, or personally authored."
            }
          },

          slop_score: {
            type: "score",

            instructions:
              "Score how strongly this post exhibits characteristics commonly associated with AI social-media slop.",

            criteria: [
              "0 - No meaningful slop signals",
              "1 - Very weak signals",
              "2 - Weak signals",
              "3 - Moderate signals",
              "4 - Strong signals",
              "5 - Very strong signals"
            ]
          },

          content_type: {
            type: "choice",

            instructions:
              "Classify the primary type of this X post.",

            criteria: {
              personal: "Personal experience, opinion, observation, or firsthand story.",
              informative: "Provides concrete information, facts, explanation, or useful knowledge.",
              promotional: "Promotes a product, service, company, project, or personal brand.",
              engagement_bait: "Primarily attempts to generate likes, replies, reposts, or attention.",
              ai_slop: "Primarily resembles generic AI-generated social media content.",
              other: "Does not clearly fit the other categories."
            }
          }
        }
      })
    });

    const data = await response.json();

    console.log("jev response is: ", data);

    if (!response.ok) {
      console.error("Jev error:", data);

      return res.status(response.status).json({
        error: data.message || "Jev API request failed",
        details: data,
      });
    }

    const answers = data.answers || data.data?.answers || {};

    res.json({
      success: true,
      result: answers,
      raw: data,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to analyze post",
    });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});