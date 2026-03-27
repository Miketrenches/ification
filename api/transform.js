module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const body = req.body;
    body.generationConfig = { responseModalities: ['TEXT', 'IMAGE'], temperature: 1 };

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      const id = part.inlineData || part.inline_data;
      if (id) {
        const mime = id.mimeType || id.mime_type || '';
        if (mime.startsWith('image/')) {
          return res.status(200).json({ imageData: id.data, mimeType: mime });
        }
      }
    }

    return res.status(200).json({ error: 'No image returned by Gemini' });

  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: err.message });
  }
}
