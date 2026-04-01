import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Gemini API Initialization
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // API Routes
  app.post("/api/chat", async (req, res) => {
    const { message, history } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const model = "gemini-3.1-flash-lite-preview";
        
        const systemInstruction = `You are an Agriculture Assistant Chatbot. 
        Your goal is to help farmers with:
        - Crop suggestions based on soil and climate.
        - Weather-based advice for farming activities.
        - Fertilizer recommendations.
        - Pest and disease control strategies.
        
        Keep your responses helpful, practical, and easy to understand for farmers. 
        Use bullet points for lists and keep advice concise. 
        If you don't know something specific about a local region, suggest consulting a local agricultural officer.`;

        const chat = genAI.chats.create({
          model: model,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            topP: 0.95,
          },
          history: history || [],
        });

        const result = await chat.sendMessage({ message });
        return res.json({ response: result.text });

      } catch (error: any) {
        attempt++;
        console.error(`Attempt ${attempt} failed:`, error.message);

        // If it's a 503 error and we have retries left, wait and try again
        if (error.status === 503 && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff (2s, 4s...)
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // If we've exhausted retries or it's a different error
        return res.status(error.status || 500).json({ 
          error: attempt >= maxRetries 
            ? "The AI server is currently very busy. Please try again in a few minutes." 
            : "Failed to get response from AI." 
        });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
