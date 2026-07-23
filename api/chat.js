import { GoogleGenAI } from '@google/genai';
import { COBBLEMON_GEM_INSTRUCTIONS } from '../src/ai_gems/cobblemon_builder.js';

const SYSTEM_PROMPT = `
${COBBLEMON_GEM_INSTRUCTIONS}

CRITICAL INSTRUCTION FOR RECOMMENDATIONS:
Whenever you analyze a team or recommend Pokemon, you MUST output a JSON code block in this exact format alongside your conversational text. Do not hallucinate properties. 
The "proposed_team" array MUST contain exactly 6 objects (the user's current team members + your recommendations to fill the rest).

\`\`\`json
{
  "proposed_team": [
    {
      "name": "blastoise",
      "held_item": "Blastoisinite",
      "tera_type": "Dragon",
      "nature": "+Defense, -Attack",
      "moves": ["Scald", "Rapid Spin", "Toxic", "Protect"]
    }
  ],
  "strengths": ["Excellent physical bulk", "Great type coverage against Dragons"],
  "weaknesses": ["Vulnerable to fast Ground types", "Lacks speed control"],
  "strategy": "Lead with Blastoise to set up, use Metagross as a physical wall, and sweep with Garchomp."
}
\`\`\`
The application will intercept this JSON block and render beautiful visual components. Always include conversational reasoning around the JSON.
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API Key is not configured in Vercel.' });
  }

  const ai = new GoogleGenAI({ apiKey });
  const { history, prompt } = req.body;

  try {
    const contents = [...(history || [])];
    contents.push({ role: 'user', parts: [{ text: prompt }] });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: { 
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7
      }
    });

    return res.status(200).json({ text: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
