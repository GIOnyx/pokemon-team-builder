// The Gemini API logic has been moved to the Vercel Serverless Function (api/chat.js)
// to ensure the API key is securely hidden from the public client-side bundle.

let chatHistory = [];

export const resetChat = () => {
  chatHistory = [];
};

export const startOrContinueChat = async (team, userMessage) => {
  // Format current team context
  const rosterStr = team.map((p, i) => {
    if (!p) return `Slot ${i + 1}: Empty`;
    let entry = `Slot ${i + 1}: ${p.name.toUpperCase()} (Types: ${p.types.join(', ')})`;
    if (p.isLockedMega) {
      entry += `\n   -> CRITICAL: This is a Mega Evolution. Its held_item MUST be strictly locked to "${p.held_item}". Do NOT change it.`;
    }
    return entry;
  }).join('\n');

  const teamContext = team.some(p => p !== null)
    ? `My current team is:\n${rosterStr}`
    : "My current team is empty.";

  const prompt = `${teamContext}\n\nUser Question/Request: ${userMessage}`;

  try {
    // Determine if we are in dev or prod to construct the URL correctly
    // In dev, the Vite proxy or absolute URL isn't explicitly needed if we just call '/api/chat' and run 'vercel dev'
    // BUT since we are using 'npm run dev' (Vite), '/api/chat' will 404 because Vite doesn't run Vercel functions natively.
    // However, if the user isn't using 'vercel dev', we might need to fallback to the client-side SDK for local development.
    // Let's check if the API is available.
    
    // For local dev, if Vercel CLI isn't running, this fetch will fail.
    // In production on Vercel, this will succeed.
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        history: chatHistory,
        prompt: prompt
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    
    // Push successful exchange to history for next time
    chatHistory.push({ role: 'user', parts: [{ text: prompt }] });
    chatHistory.push({ role: 'model', parts: [{ text: data.text }] });

    return data.text;
  } catch (error) {
    console.error("Error in chat proxy:", error);
    
    // FALLBACK FOR LOCAL DEVELOPMENT:
    // If the user runs `npm run dev` instead of `vercel dev`, the /api/chat endpoint won't exist.
    // We can fallback to doing a direct client-side call IF they have the VITE_GEMINI_API_KEY set locally.
    const localKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (localKey && (error.message.includes('404') || error.message.includes('Failed to fetch'))) {
      console.warn("Falling back to local client-side Gemini execution (Vercel proxy not found).");
      return fallbackLocalChat(prompt);
    }

    throw new Error("Failed to get response from Gemini. Please check your API key or try again later.");
  }
};

// --- Fallback for local Vite development without Vercel CLI ---
import { GoogleGenAI } from '@google/genai';
import { COBBLEMON_GEM_INSTRUCTIONS } from '../ai_gems/cobblemon_builder';

let localChatSession = null;
const fallbackLocalChat = async (prompt) => {
  const localKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!localKey) throw new Error("Missing VITE_GEMINI_API_KEY for local development.");
  
  if (!localChatSession) {
    const ai = new GoogleGenAI({ apiKey: localKey });
    
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

    localChatSession = ai.chats.create({
      model: 'gemini-3.1-flash-lite',
      config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.7 }
    });
  }

  const response = await localChatSession.sendMessage({ message: prompt });
  return response.text;
};
