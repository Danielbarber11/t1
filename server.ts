import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Initialize Gemini AI Client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper for 100% Free Instant Google Translate Engine Fallback
async function translateWithGoogleFree(
  text: string,
  sourceLangCode: string = "auto",
  targetLangCode: string = "en"
) {
  const cleanSource = sourceLangCode === "auto" ? "auto" : sourceLangCode.toLowerCase().split("-")[0];
  const cleanTarget = (targetLangCode || "en").toLowerCase().split("-")[0];
  
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
    cleanSource
  )}&tl=${encodeURIComponent(cleanTarget)}&dt=t&dt=rm&q=${encodeURIComponent(text)}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Google Translate fetch failed with status ${response.status}`);
  const data = (await response.json()) as any;

  // data[0] contains [[translatedChunk, originalChunk, ...], ...]
  const translation = (data[0] || [])
    .map((item: any) => item[0])
    .filter(Boolean)
    .join("");

  // transliteration is often in data[0][...][3] or data[0][1][2]
  let transliteration = "";
  if (Array.isArray(data[0])) {
    const lastItem = data[0][data[0].length - 1];
    if (lastItem && typeof lastItem[3] === "string") {
      transliteration = lastItem[3];
    }
  }

  const detectedCode = data[2] || cleanSource;

  return {
    translation: translation || text,
    transliteration: transliteration || undefined,
    detectedLanguage: detectedCode,
    detectedLanguageCode: detectedCode,
    alternatives: [],
    definitions: [],
    grammarInsight: {
      formalityNote: "תרגום מהיר באמצעות חבילת שפות Google Translate",
      culturalNuance: "תרגום טבעי ומדויק",
      literalMeaning: text,
    },
  };
}

// 1. Text Translation & Deep Analysis Route
app.post("/api/translate", async (req, res) => {
  const { sourceLang, sourceLangCode, targetLang, targetLangCode, text, formality } = req.body;

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Text to translate is required." });
  }

  // 1. Try Gemini AI Model for smart contextual translation & breakdown
  try {
    const ai = getGeminiClient();

    const prompt = `You are Apple's official precision translation engine (Apple Translate with Apple Intelligence).
Translate the following input from source language "${sourceLang || 'auto'}" to target language "${targetLang}".

Input Text: "${text.trim()}"
Preferred Formality/Tone: ${formality || 'natural'}

Respond strictly with a JSON object matching this schema:
{
  "translation": "The primary, most accurate and natural translation",
  "transliteration": "Phonetic pronunciation guide or romanization/nikud (e.g., for Hebrew, Arabic, Japanese, Russian, Chinese, Hindi, Greek, etc. or null if Latin)",
  "detectedLanguage": "The language code or name detected if source was auto, else source language",
  "detectedLanguageCode": "2-letter ISO code e.g. en, he, es, fr, ja, ar, ru, zh, etc.",
  "alternatives": [
    {
      "text": "Alternative translation phrasing",
      "context": "When to use this version (e.g. Formal, Informal, Literary, Slang)"
    }
  ],
  "definitions": [
    {
      "word": "Key word from original text",
      "partOfSpeech": "noun/verb/adjective/phrase",
      "meaning": "Meaning in target language",
      "example": "Example sentence using this word"
    }
  ],
  "grammarInsight": {
    "formalityNote": "Brief explanation of the tone and social formality level",
    "culturalNuance": "Any cultural context, gender agreement note, or idiom explanation",
    "literalMeaning": "Word-by-word literal breakdown if idioms are used"
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translation: { type: Type.STRING },
            transliteration: { type: Type.STRING },
            detectedLanguage: { type: Type.STRING },
            detectedLanguageCode: { type: Type.STRING },
            alternatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  context: { type: Type.STRING },
                },
                required: ["text", "context"],
              },
            },
            definitions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  partOfSpeech: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  example: { type: Type.STRING },
                },
                required: ["word", "meaning"],
              },
            },
            grammarInsight: {
              type: Type.OBJECT,
              properties: {
                formalityNote: { type: Type.STRING },
                culturalNuance: { type: Type.STRING },
                literalMeaning: { type: Type.STRING },
              },
            },
          },
          required: ["translation"],
        },
      },
    });

    const jsonText = response.text ? response.text.trim() : "{}";
    const data = JSON.parse(jsonText);

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.warn("Gemini AI translation failed, falling back to Google Translate engine:", err?.message);

    // 2. Seamless Fallback: Free Google Translate Neural Engine
    try {
      const fallbackData = await translateWithGoogleFree(
        text,
        sourceLangCode || "auto",
        targetLangCode || (targetLang === "Hebrew" ? "he" : "en")
      );

      return res.json({
        success: true,
        data: fallbackData,
      });
    } catch (fallbackErr: any) {
      console.error("All translation engines failed:", fallbackErr);
      return res.status(500).json({
        success: false,
        error: fallbackErr.message || "Translation failed",
      });
    }
  }
});

// 2. Camera / Visual Image Translation Route
app.post("/api/translate-image", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", targetLang = "Hebrew" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Image base64 data is required." });
    }

    const ai = getGeminiClient();

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `Analyze this image for readable text in any language.
Extract all visible text segments, detect their source language, and translate them accurately into "${targetLang}".
Return bounding boxes for each text region (approximate percentages: ymin, xmin, ymax, xmax from 0 to 100) so they can be rendered as an Apple Live Text visual overlay.

Return strict JSON:
{
  "detectedFullText": "Full reconstructed text extracted from the image",
  "overallTranslation": "Full translated text in ${targetLang}",
  "sourceLanguage": "Language name detected in image",
  "blocks": [
    {
      "originalText": "Segment text",
      "translatedText": "Segment translation in ${targetLang}",
      "box": {
        "top": 10,
        "left": 15,
        "width": 60,
        "height": 12
      }
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        },
        { text: prompt },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedFullText: { type: Type.STRING },
            overallTranslation: { type: Type.STRING },
            sourceLanguage: { type: Type.STRING },
            blocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalText: { type: Type.STRING },
                  translatedText: { type: Type.STRING },
                  box: {
                    type: Type.OBJECT,
                    properties: {
                      top: { type: Type.NUMBER },
                      left: { type: Type.NUMBER },
                      width: { type: Type.NUMBER },
                      height: { type: Type.NUMBER },
                    },
                    required: ["top", "left", "width", "height"],
                  },
                },
                required: ["originalText", "translatedText", "box"],
              },
            },
          },
          required: ["detectedFullText", "overallTranslation"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("Image translation error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Image translation failed",
    });
  }
});

// 3. Conversation Turn Route (Face to Face mode)
app.post("/api/conversation-turn", async (req, res) => {
  try {
    const { speaker, text, userALang, userBLang } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required." });
    }

    const ai = getGeminiClient();

    const targetLang = speaker === "A" ? userBLang : userALang;
    const sourceLang = speaker === "A" ? userALang : userBLang;

    const prompt = `Translate this spoken dialogue sentence from ${sourceLang} to ${targetLang}.
Spoken text: "${text}"

Return strict JSON:
{
  "originalText": "${text}",
  "translatedText": "Natural translation in ${targetLang}",
  "phonetic": "Phonetic reading/transliteration for easy speaking",
  "speaker": "${speaker}",
  "targetLang": "${targetLang}"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalText: { type: Type.STRING },
            translatedText: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            speaker: { type: Type.STRING },
            targetLang: { type: Type.STRING },
          },
          required: ["originalText", "translatedText"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("Conversation error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Conversation processing failed",
    });
  }
});

// 4. Speech Synthesis Route using Gemini TTS
app.post("/api/tts", async (req, res) => {
  try {
    const { text, language = "en" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required for TTS." });
    }

    const ai = getGeminiClient();

    // Generate speech using gemini-3.1-flash-tts-preview
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Speak in ${language}: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      return res.json({ success: true, audioBase64: base64Audio, format: "pcm_24k" });
    } else {
      return res.json({ success: false, fallbackToWebSpeech: true });
    }
  } catch (err: any) {
    console.error("TTS error:", err);
    // Return graceful fallback indicator so browser SpeechSynthesis can take over seamlessly
    return res.json({ success: false, fallbackToWebSpeech: true, error: err.message });
  }
});

// Start Express and Vite dev server / static production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
