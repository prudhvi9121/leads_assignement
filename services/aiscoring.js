// services/aiScoring.js
require('dotenv').config();
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'; // or your chosen Gemini model

async function aiScore({ lead, offer }) {
  // Fallback if no Gemini key
  if (!GEMINI_API_KEY) {
    console.log("⚠️ No Gemini API key, returning fallback AI score = 25");
    return {
      intent: 'Medium',
      reasoning: 'No Gemini API key provided; fallback to medium intent.',
      points: 30
    };
  }

  const prompt = `
You are a lead scoring assistant. Given a product/offer and a prospect profile,
classify the prospect's intent to buy as High / Medium / Low and provide a 1-2 sentence explanation.
Return only a JSON object with fields: intent (High|Medium|Low) and reasoning (string).

Offer: ${JSON.stringify(offer)}
Lead: ${JSON.stringify(lead)}

Consider role, industry, bio, and alignment with the offer's value propositions.
Answer:
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
    const body = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
      // you can add more parameters if needed, e.g. generationConfig
    };

    const resp = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      }
    });

    // Response handling: depends on Gemini’s shape
    // It might return `candidates` or `text` field etc.
    // Let's assume it returns something like resp.data.candidates[0].content.text
    let textOut = '';
    if (resp.data?.candidates && resp.data.candidates.length > 0) {
      // some Gemini responses return candidates
      textOut = resp.data.candidates[0].content?.parts?.[0]?.text || resp.data.candidates[0].content?.text || '';
    } else if (resp.data?.text) {
      textOut = resp.data.text;
    } else {
      textOut = JSON.stringify(resp.data);
    }

    textOut = textOut.trim();

    // parse intent
    let intent = 'Low';
    let reasoning = textOut;
    const m = textOut.match(/(High|Medium|Low)/i);
    if (m) {
      intent = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
    }

    // map to points
    const pointsMap = { High: 50, Medium: 30, Low: 10 };
    const points = pointsMap[intent] || 10;

    return { intent, reasoning, points };

  } catch (err) {
    console.error('Gemini API error:', err.response?.data || err.message || err);
    return {
      intent: 'Medium',
      reasoning: 'Gemini API call failed; defaulting to Medium intent.',
      points: 30
    };
  }
}

module.exports = { aiScore };
