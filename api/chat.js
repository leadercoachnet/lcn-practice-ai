import OpenAI from "openai";

export default async function handler(req, res) {
  // CORS (allow Squarespace + browsers)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Simple GET test so the function doesn't crash
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "LCN Practice AI API is live. Use POST to chat."
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is missing in Vercel environment variables"
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { mode = "client", messages = [] } = req.body || {};

    const COACH_SYSTEM = `
You are a leadership coaching AI used strictly for practice.

COACH defines the purpose of questions:
Connect → Outcome → Ask ↔ Create → Honor.

Rules:
- Ask exactly ONE question per turn
- Ask only ONE Connect question per session ("How are you doing today?")
- Ensure Outcome is clear before deeper exploration
- After Outcome, Ask and Create may flow freely
- Honor finalizes commitment
- Do not give advice or solutions

You may reflect listening, reframe as a question, celebrate, champion, or challenge sparingly.
Return only one question (optionally one short reflective sentence before it).
`.trim();

    const CLIENT_SYSTEM = `
You are simulating a real human client for coaching practice.

You may talk freely about everyday topics:
finances, homework, schedules, relationships, work, stress, values.

Respond naturally and honestly.
Reveal information gradually.
Do not coach yourself.
`.trim();

    const systemPrompt = mode === "coach" ? COACH_SYSTEM : CLIENT_SYSTEM;

    const response = await client.responses.create({
      model: "gpt-5",
      instructions: systemPrompt,
      input: messages,
    });

    return res.status(200).json({
      text: response.output_text ?? ""
    });

  } catch (err) {
    return res.status(500).json({
      error: err?.message || "Server error"
    });
  }
}
