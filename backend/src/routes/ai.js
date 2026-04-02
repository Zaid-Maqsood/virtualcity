const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

const SYSTEM_PROMPT = `You are an AI assistant for Virtual City School, a digital learning platform.
You help students with their studies, answer questions about courses, assignments, and school life.
You also assist teachers with lesson planning and admin staff with platform management.
Be concise, helpful, and friendly. Keep responses brief (2-4 sentences unless more detail is needed).
Do not make up specific course content or grades — refer users to their teachers for those details.`;

router.post('/chat', authenticate, async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'sk-ant-...') {
      return res.status(503).json({ error: 'AI assistant is not configured. Add ANTHROPIC_API_KEY to .env' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-10), // keep last 10 messages for context
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(502).json({ error: err?.error?.message || 'AI request failed' });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || '';

    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
