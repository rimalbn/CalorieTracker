const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Food description is required' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a nutrition expert. Extract all food items from the user\'s message and return ONLY a JSON object with no markdown, no explanation, just raw JSON in this exact format: { "items": [{ "name": string, "calories": number, "protein": number, "carbs": number, "fat": number, "sodium": number }], "totals": { "calories": number, "protein": number, "carbs": number, "fat": number, "sodium": number } }. Use accurate nutritional data.',
        },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    });

    const raw = completion.choices[0].message.content.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    const parsed = JSON.parse(raw);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('food-analyze error:', err);
    return res.status(500).json({ error: 'AI analysis failed', details: err.message });
  }
};
