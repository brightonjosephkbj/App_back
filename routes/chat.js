const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Reuses your existing Groq/Cerebras/OpenRouter routing pattern from joyback
const GROQ_API_KEY = process.env.GROQ_API_KEY;

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are Joy, a warm and helpful companion inside the Beats app.' },
          { role: 'user', content: message },
        ],
      }),
    });
    const data = await r.json();
    res.json({ reply: data.choices?.[0]?.message?.content || "I'm here, just thinking..." });
  } catch (e) {
    res.status(500).json({ error: 'Joy chat failed', detail: e.message });
  }
});

module.exports = router;
