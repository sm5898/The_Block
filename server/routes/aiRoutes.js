// ─── AI Routes ────────────────────────────────────────────────────────────────
// Three endpoints powered by the Groq API (llama-3.3-70b-versatile model):
//   POST /generate-listing — turn free-form input into a polished title + description
//   POST /smart-search     — rank listings by relevance to a natural language query
//   POST /chat             — conversational neighborhood assistant with app context
import express from "express";

// Log at startup to help debug missing API key issues early
console.log("GROQ_API_KEY loaded:", !!process.env.GROQ_API_KEY);

const router = express.Router();

// Groq API endpoint and model — centralised so they're easy to swap
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL    = "llama-3.3-70b-versatile";

// ── Helper: send a single-turn prompt to Groq and return the text reply ───────
async function callGroq(prompt) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    }),
  });
  const data = await res.json();
  console.log("Groq response:", JSON.stringify(data).slice(0, 300));

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("No text from Groq: " + JSON.stringify(data).slice(0, 200));
  return text;
}

// ── POST /api/ai/generate-listing ─────────────────────────────────────────────
// Accepts free-form user input and returns a structured { title, description }
// suitable for pre-filling the create-listing form.
router.post("/generate-listing", async (req, res) => {
  const { userInput } = req.body;
  if (!userInput) return res.status(400).json({ error: "userInput required" });

  const prompt = `You are helping someone create a neighborhood sharing app listing.
The user said: "${userInput}"
Generate a short punchy title (max 6 words) and a 2-3 sentence description that sounds friendly and helpful.
Respond in this exact JSON format with no markdown or extra text:
{"title": "...", "description": "..."}`;

  try {
    const text   = await callGroq(prompt);
    const parsed = JSON.parse(text.trim());
    res.json(parsed);
  } catch {
    res.status(500).json({ error: "Failed to generate listing content." });
  }
});

// ── POST /api/ai/smart-search ─────────────────────────────────────────────────
// Accepts a natural language query and the current listings array, returns an
// ordered array of listing IDs ranked by relevance (max 5).
router.post("/smart-search", async (req, res) => {
  const { query, listings } = req.body;
  if (!query || !listings) return res.status(400).json({ error: "query and listings required" });

  // Trim the listings payload to only the fields the model needs
  const simplifiedListings = listings.map((l) => ({
    id:          l._id,
    title:       l.title,
    description: l.description,
    type:        l.postType,
  }));

  const prompt = `A user on a neighborhood sharing app is looking for: "${query}"
Here are the available listings as JSON:
${JSON.stringify(simplifiedListings, null, 2)}

Return ONLY a JSON array of the IDs of listings that are relevant, most relevant first. Max 5 results. No markdown, just the array.
Example: ["id1", "id2"]`;

  try {
    const text = await callGroq(prompt);
    const ids  = JSON.parse(text.trim());
    res.json({ ids });
  } catch {
    res.status(500).json({ error: "Smart search failed." });
  }
});

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────
// Multi-turn conversational assistant. Accepts { message, history[] } where
// history is an array of { role: "user"|"assistant", text: string } objects.
router.post("/chat", async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: "message required" });

  // System prompt that grounds the assistant in the context of The Block
  const systemContext = `You are a friendly neighborhood assistant for "The Block" app — 
a platform where neighbors borrow tools and offer local services. 
Help users find things, post listings, or answer questions about the app.
Keep replies short and conversational (2-3 sentences max).`;

  // Build the full message array: system context + prior turns + new user message
  const messages = [
    { role: "system", content: systemContext },
    ...history.map((m) => ({
      role:    m.role === "user" ? "user" : "assistant",
      content: m.text,
    })),
    { role: "user", content: message },
  ];

  try {
    const res2 = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({ model: MODEL, messages, max_tokens: 300 }),
    });
    const data  = await res2.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) throw new Error("No reply from Groq");
    res.json({ reply });
  } catch {
    res.status(500).json({ error: "Chat failed." });
  }
});

export default router;
