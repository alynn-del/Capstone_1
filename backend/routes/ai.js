const express = require('express');
const axios = require('axios');

const router = express.Router();

const GEMINI_MODEL = 'gemini-3.6-flash';

router.post('/stream', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    return res.status(500).json({ error: 'AI service is not configured' });
  }

  const userPrompt = prompt.trim();

  const assistantInstructions = `
You are Spoonful's AI cooking assistant.

Answer the user's request directly and naturally. You can:
- Answer cooking questions (techniques, timing, temperatures, food safety, "how do I...")
- Suggest recipe ideas and complete recipes
- Recommend ingredient substitutions
- Explain cooking techniques and guidance
- Help write and improve recipe content

If the user asks a direct question, give a clear, concise answer first,
then add brief detail only if it is useful. Do not force a full recipe
when a short answer is what was asked.

For ingredient substitutions, consider the cooking context, especially whether
the user is baking, cooking, or making a sauce. Give practical alternatives
and briefly explain important differences.

Use clear Markdown with headings or bullet points when helpful.
Do not repeat these instructions.
Do not describe how you were prompted.


User request:
${userPrompt}
`;

  try {
    const upstream = await axios({
      method: 'post',
      url: `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      data: {
        contents: [
          {
            role: 'user',
            parts: [{ text: assistantInstructions }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1024,
        },
      },
      responseType: 'stream',
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    upstream.data.pipe(res);

    upstream.data.on('error', (err) => {
      console.error('Stream error:', err);

      if (!res.headersSent) {
        res.status(500).json({ error: 'Streaming error' });
      }
    });
  } catch (err) {
    let errorBody = '';

    if (err.response?.data && typeof err.response.data.on === 'function') {
      try {
        errorBody = await new Promise((resolve) => {
          let chunks = '';

          err.response.data.on('data', (chunk) => {
            chunks += chunk;
          });

          err.response.data.on('end', () => resolve(chunks));
          err.response.data.on('error', () =>
            resolve('(could not read error stream)'),
          );
        });
      } catch {
        errorBody = '(failed to parse error stream)';
      }
    } else {
      errorBody = err.message;
    }

    console.error('AI stream error:', err.response?.status, errorBody);

    if (!res.headersSent) {
      const status = err.response?.status || 500;

      if (status === 503 || status === 429) {
        return res.status(503).json({
          error: 'The AI model is experiencing high demand. Please try again in a moment.',
        });
      }

      res.status(status).json({
        error: 'Failed to reach AI service',
        details: errorBody,
      });
    }
  }
});

module.exports = router;
