// server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Use the correct SDK
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in the environment variables.");
}

// Correct instantiation
const ai = new GoogleGenAI({ apiKey: API_KEY });

const app = express();
const port = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { messages, financialData } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'Messages are required' });
  }

  const userQuery = messages[0].content;

  const systemPrompt = `- All amounts should be displayed in Indian Rupees (₹) unless otherwise specified.
- Use Indian financial terminology and context.
- If the user asks a question about their personal finances (like spending, budgets, or goals), use the provided data to give a specific, data-driven answer.
- If the user asks a general financial question (like "What is a SIP?" or "How does a credit score work?"), provide a clear, general definition and explanation. Do not mention their personal data in this case.
- Always format currency as ₹X,XXX.XX (Indian Rupee format).
- If you don't know the answer to a question, respond with "I'm sorry, I don't have that information." Do not make up answers.

Here is the user's financial data for context:
Transactions: ${JSON.stringify(financialData.transactions)}
Budgets: ${JSON.stringify(financialData.budgets)}
Goals: ${JSON.stringify(financialData.goals)}
Current Date: ${new Date().toLocaleDateString()}`;

  try {
    // Use the correct API structure
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: `${systemPrompt}\n\nUser Query: ${userQuery}`,
    });

    res.json({ text: response.text });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to fetch response from AI assistant." });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running and listening at http://localhost:${port}`);
});