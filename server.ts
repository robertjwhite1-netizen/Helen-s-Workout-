import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Secure Backend-Only backup affirmations storage
const BACKEND_AFFIRMATIONS = [
  "You are stronger than you think.",
  "Small steps still move you forward.",
  "Show up for yourself today.",
  "Progress, not perfection.",
  "You only need to win today.",
  "Your future self will thank you.",
  "Strong, calm, capable.",
  "One workout at a time.",
  "You are building confidence.",
  "Keep going, you’re doing better than you think.",
  "You deserve to feel good in your body.",
  "Gentle progress is still progress.",
  "You are becoming stronger every week.",
  "Confidence grows through consistency.",
  "Today is enough.",
  "Believe in your own power.",
  "Every repetition is a commitment to yourself.",
  "You are sculpting a healthier, happier you.",
  "Celebrate what your body can do.",
  "Focus on your breath, find your focus, feel your strength.",
  "Your consistency is your superpower."
];

let ai: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// Secure server API route for dynamic limitless affirmations
app.get("/api/affirmation", async (req, res) => {
  try {
    const client = getGeminiClient();
    if (client) {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Generate a short, calming, elegant, and modern fitness/wellness affirmation for a minimalist workout tracker. It should be supportive, warm, and brief (around 10-15 words). Provide ONLY the raw text of the affirmation without quotes, prefix, suffix, or markdown. NEVER include any person's name (such as Helen) or any personal names under any circumstances.",
        config: {
          temperature: 0.85
        }
      });
      let text = response.text?.trim() || "";
      // Strip outer quotes if any
      if (text.startsWith('"') && text.endsWith('"')) {
        text = text.slice(1, -1).trim();
      }
      if (text.startsWith('“') && text.endsWith('”')) {
        text = text.slice(1, -1).trim();
      }
      if (text) {
        return res.json({ affirmation: text });
      }
    }
  } catch (err) {
    console.error("Gemini API error generating affirmation:", err);
  }

  // Fallback to random selection from backend storage if Gemini is unavailable
  const randomIndex = Math.floor(Math.random() * BACKEND_AFFIRMATIONS.length);
  const text = BACKEND_AFFIRMATIONS[randomIndex];
  res.json({ affirmation: text });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
