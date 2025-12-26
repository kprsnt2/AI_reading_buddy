export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  };

  try {
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await geminiResponse.json();

    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts.length > 0) {
      res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
      res.status(500).json({ error: 'Unexpected response from Gemini API' });
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to call Gemini API' });
  }
}
