import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || ""
});

export default async function askAi({ prompt, duration = "short" }) {
  const noteLimits = {
    short: "maximum of 20 notes, roughly 5-10 seconds",
    medium: "maximum of 40 notes, roughly 15-20 seconds",
    long: "maximum of 60 notes, roughly 25-35 seconds"
  };

  const systemPrompt = `
You are a legendary, world-class music composer AI. 
The user will describe a specific scene, emotion, or situation to you. 
Your job is to smartly translate their imagination into a stunning, evocative musical composition.

Return ONLY valid JSON. Absolutely no markdown wrappers (like \`\`\`json) and no conversational text.

Format:
{
  "tempo": 120,
  "notes": [
    { "note": "C4", "duration": "0.5", "time": 0.0 },
    { "note": "Eb4", "duration": "0.5", "time": 0.5 },
    { "note": "G4", "duration": "1.0", "time": 1.0 }
  ]
}

Rules:
- Generate an epic, expressive melody or chord progression that perfectly captures the user's situation.
- The user requested a ${duration} composition. Target length: ${noteLimits[duration]}.
- 'time' is the absolute start time in seconds (e.g., 0.0, 0.5, 1.25).
- 'duration' is the note length in seconds (e.g., "0.5" or 0.5).
- 'note' must be standard scientific pitch notation (e.g., "C4", "F#4", "Bb3").
- Vary note lengths, rhythms, and dynamics to make the tune emotionally resonant!
- Output ONLY the raw JSON object.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      temperature: 0.85
    }
  });

  let text = response.text;
  text = text.replace(/```json|```/g, "").trim();

  try {
    const json = JSON.parse(text);
    return json;
  } catch (err) {
    console.error("Invalid JSON from AI:", text);
    return null;
  }
}