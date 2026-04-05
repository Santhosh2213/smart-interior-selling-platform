/**
 * anthropicProxyController.js
 * Uses Google Gemini API (free tier) — gemini-2.5-flash model
 * Analyzes pencil sketches and returns interior design visualization data.
 *
 * Add to server/.env:
 *   GEMINI_API_KEY=AIzaSy-xxxxxxxxxxxxxxxx
 */

const generateVisualization = async (req, res) => {
  try {
    const { imageBase64, mediaType, prompt } = req.body;

    if (!imageBase64 || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'imageBase64 and prompt are required',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured in server .env',
      });
    }

    // gemini-2.5-flash — free tier, supports image input (vision)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${apiKey}`;
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mediaType || 'image/jpeg',
                  data: imageBase64,
                },
              },
              { text: prompt },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errData = await geminiResponse.json().catch(() => ({}));
      console.error('Gemini API error:', errData);
      return res.status(geminiResponse.status).json({
        success: false,
        error: errData.error?.message || `Gemini API error: ${geminiResponse.status}`,
      });
    }

    const data = await geminiResponse.json();

    const rawText = data.candidates?.[0]?.content?.parts
      ?.filter((p) => p.text)
      ?.map((p) => p.text)
      ?.join('') || '';

    if (!rawText) {
      return res.status(500).json({
        success: false,
        error: 'No response from Gemini. Please try again.',
      });
    }

    let parsed;
    try {
      const clean = rawText.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = {
        visualDescription: rawText,
        designHighlights: ['Design generated from sketch analysis'],
        colorPalette: [],
        materialList: [],
        furnitureRecommendations: [],
        lightingPlan: '',
        estimatedBudgetRange: 'To be determined',
        designerNotes: 'Sketch processed by NewaEC AI engine.',
        sketchAnalysis: 'Sketch analyzed and design parameters applied.',
        productionTips: 'Review with site team before fabrication.',
      };
    }

    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('generateVisualization error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Server error calling Gemini API',
    });
  }
};

module.exports = { generateVisualization };