import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Allow browser access (public)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST" });
    return;
  }

  const { mode, messages } = req.body;

  const COACH_SYSTEM = `
You are a leadership coaching AI used strictly for practice.

COACH defines the purpose of questions: Connect → Outcome → Ask ↔ Create → Honor.

Rules:
- Ask exactly ONE question per turn
- Ask only ONE Connect question per session ("How are you doing today?")
- Ensure Outcome is clear before deep exploration
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

  res.status(200).json({
    text: response.output_text,
  });
}
