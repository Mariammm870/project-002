// api/ask.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body ?? {};
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: query },
        ],
      }),
    });

    const data = await r.json();

    if (data.error) {
      return res
        .status(400)
        .json({ error: data.error.message || "OpenRouter error" });
    }

    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer)
      return res.status(500).json({ error: "No answer from OpenRouter" });

    return res.status(200).json({ answer });
  } catch (err) {
    console.error("server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
