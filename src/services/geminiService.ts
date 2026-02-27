import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getAIResponse = async (prompt: string, history: any[] = [], context: string = "") => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: `Context of my recent activity: ${context}\n\nMy question: ${prompt}` }] }
      ],
      config: {
        systemInstruction: "You are Real Society AI, a highly intelligent personal assistant. You learn from the user's provided context to give personalized advice. You proactively suggest actions, write notes, and summarize data. If the user seems stuck, ask a smart clarifying question. Be professional yet approachable.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "I'm sorry, I'm having trouble connecting right now.";
  }
};

export const generateNoteFromPrompt = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: `Write a detailed, well-formatted note about: ${prompt}` }] }],
    });
    return response.text;
  } catch (error) {
    return "Failed to generate note.";
  }
};

export const summarizeContent = async (content: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: `Provide a concise summary and key takeaways for the following content: ${content}` }] }],
    });
    return response.text;
  } catch (error) {
    return "Summary generation failed.";
  }
};

export const getSmartSuggestions = async (userActivity: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: `Based on this user activity history, suggest 3 specific, actionable next steps or smart questions to ask the user: ${userActivity}` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "Type of suggestion: 'question' or 'action'" },
              text: { type: Type.STRING, description: "The suggestion text" },
              action: { type: Type.STRING, description: "The specific command to run if it's an action" }
            },
            required: ["type", "text"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};

export const speakText = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0)).buffer;
      
      // The Gemini TTS output is raw PCM 16-bit little-endian at 24kHz
      const audioBuffer = audioContext.createBuffer(1, audioData.byteLength / 2, 24000);
      const nowBuffering = audioBuffer.getChannelData(0);
      const dataView = new DataView(audioData);
      
      for (let i = 0; i < audioBuffer.length; i++) {
        nowBuffering[i] = dataView.getInt16(i * 2, true) / 32768;
      }

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
};
