const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Food description is required' });
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system:
        'You are a nutrition expert. Extract all food items from the user\'s message and return ONLY a JSON object with no markdown, no explanation, just raw JSON in this exact format: { "items": [{ "name": string, "calories": number, "protein": number, "carbs": number, "fat": number, "sodium": number }], "totals": { "calories": number, "protein": number, "carbs": number, "fat": number, "sodium": number } }. Use accurate nutritional data.',
      messages: [{ role: 'user', content: text }],
    });

    const raw = message.content[0].text.trim();
    const parsed = JSON.parse(raw);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('food-analyze error:', err);
    return res.status(500).json({ error: 'AI analysis failed', details: err.message });
  }
};
