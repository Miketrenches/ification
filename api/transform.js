export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const body = req.body;

    // Add responseModalities if missing
    if (body.generationConfig) {
      body.generationConfig.responseModalities = ['TEXT', 'IMAGE'];
    } else {
      body.generationConfig = { responseModalities: ['TEXT', 'IMAGE'] };
    }

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    // Log what came back so we can debug
    console.log('Gemini response:', JSON.stringify(data).slice(0, 500));

    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: err.message });
  }
}
