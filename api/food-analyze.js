module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Food description is required' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition expert. Extract all food items from the user\'s message and return ONLY a JSON object with no markdown, no explanation, just raw JSON in this exact format: { "items": [{ "name": string, "calories": number, "protein": number, "carbs": number, "fat": number, "sodium": number }], "totals": { "calories": number, "protein": number, "carbs": number, "fat": number, "sodium": number } }. Use accurate nutritional data.',
          },
          { role: 'user', content: text },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Groq API error');

    const raw = data.choices[0].message.content.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    const parsed = JSON.parse(raw);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('food-analyze error:', err);
    return res.status(500).json({ error: 'AI analysis failed', details: err.message });
  }
};
