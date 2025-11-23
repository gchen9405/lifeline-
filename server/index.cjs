// server/index.cjs
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) {
    console.warn("Missing GEMINI_API_KEY in .env");
}

// Normalize an ISO datetime from separate date/time strings if needed
function toISOMaybe(e) {
    if (e.start) {
        const t = new Date(e.start);
        if (!Number.isNaN(t.getTime())) return t.toISOString();
    }
    const date = e.date ?? "";
    const time = e.time ?? "";
    const combined = `${date} ${time}`.trim();
    if (combined) {
        const dt = new Date(combined);
        if (!Number.isNaN(dt.getTime())) return dt.toISOString();
    }
    return undefined;
}

app.post("/api/chat", async (req, res) => {
    try {
        const body = req.body ?? {};

        // Frontend sends { history, context }
        const history = Array.isArray(body.history) ? body.history : [];
        const entriesIn = Array.isArray(body.context) ? body.context : [];

        const lastMessage = history[history.length - 1];
        const question = lastMessage?.parts?.[0]?.text ?? "";

        // Simple text version of conversation
        const conversation = history
            .map((m) => {
                const role = m.role === "user" ? "User" : "Assistant";
                const text = m.parts?.[0]?.text ?? "";
                return `${role}: ${text}`;
            })
            .join("\n");

        // Compact entries for grounding
        const compact = entriesIn.map((e) => {
            const startISO = toISOMaybe(e);
            return {
                id: e.id,
                type: e.type,
                title: e.title,
                details: e.description,
                start: startISO,
                rawDate: e.date ?? null,
                rawTime: e.time ?? null,
                status: e.status,
                provider: e.provider ?? undefined,
                recurring: e.recurring ?? null,
                allDay: false,
            };
        });

        const safe = compact.slice(0, 200);
        const grounding = JSON.stringify(safe, null, 2);

        const SYSTEM_PROMPT = `
You are Leo, a warm, friendly, and empathetic AI health assistant inside the Lifeline- app
("Lifeline" with a dash at the end).

Your job:
- Help the user understand their schedule of medications, lab results, and appointments.
- Use the JSON entries under "ENTRIES_JSON" when talking about specific dates, times, or items.
- Prefer "rawDate" and "rawTime" when you mention dates/times.

Safety:
- Do NOT provide medical advice, diagnoses, or treatment plans.
- If the user asks for medical advice, gently decline and suggest they talk to a healthcare professional.

Style:
- The UI already introduces you, so do NOT start every answer with "Hi, I'm Leo" or similar unless the user asks who you are.
- Default to short answers: usually 1–3 sentences, unless the user clearly asks for more detail.
- Respond in plain text only: no markdown, no bullet characters (-, *, •), and no bold/italics.
- When listing multiple schedule items, use short sentences separated by new lines or by commas, e.g. "This morning you took X at 8:00 AM, and this evening you take Y at 6:00 PM."
- If the information truly is not present in the entries, say so naturally (for example: "I don't see that saved in your schedule yet.") and invite the user to add it.

Behavior:
- For questions about "today", focus on entries whose date matches today's date from TODAY_ISO (using either start, rawDate, or both).
- For broad questions like "what's up?" or "what's next?", summarize the next few relevant upcoming items from the entries.
    `.trim();

        const prompt = [
            SYSTEM_PROMPT,
            `TODAY_ISO: ${new Date().toISOString()}`,
            `ENTRIES_JSON:\n${grounding || "[]"}`,
            `CONVERSATION_SO_FAR:\n${conversation || "(no previous messages)"}`,
            `USER_QUESTION:\n${question}`,
            `Please answer as Leo, following the style rules above.`,
        ].join("\n\n");

        const MODEL = "gemini-2.5-flash-lite";
        const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;

        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 256,
                },
            }),
        });

        if (!resp.ok) {
            const txt = await resp.text();
            console.error("Gemini error", resp.status, txt);
            return res
                .status(502)
                .json({ reply: "Sorry, I'm having trouble talking right now." });
        }

        const data = await resp.json();
        const answer =
            data?.candidates?.[0]?.content?.parts
                ?.map((p) => p?.text || "")
                .join("")
                .trim() || "";

        if (!answer) {
            return res.json({
                reply:
                    "Hmm, I couldn't quite generate a response. Mind asking that again in a slightly different way?",
            });
        }

        return res.json({ reply: answer });
    } catch (e) {
        console.error("Server error in /api/chat", e);
        return res
            .status(500)
            .json({ reply: "Sorry, something went wrong while I was thinking." });
    }
});

app.post("/api/import", async (req, res) => {
    try {
        const { text, image } = req.body;

        if (!text && !image) {
            return res.status(400).json({ error: "No text or image provided" });
        }

        const SYSTEM_PROMPT = `
    You are an AI assistant that extracts structured timeline entries from unstructured text or images (like prescriptions, lab results, appointment emails).
    
    Extract a list of entries in this JSON format:
    [
      {
        "type": "medication" | "appointment" | "lab",
        "title": "Short title",
        "description": "Details, dosage, instructions",
        "date": "YYYY-MM-DD",
        "time": "HH:MM AM/PM",
        "provider": "Doctor or Hospital Name (optional)",
        "value": "98" (only for lab),
        "unit": "mg/dL" (only for lab),
        "referenceRange": "70-100" (only for lab)
      }
    ]
    
    Rules:
    - If date is missing, assume today (${new Date().toISOString().split('T')[0]}).
    - If time is missing, estimate a reasonable time (e.g. 9:00 AM for morning meds).
    - Return ONLY the JSON array. No markdown, no code blocks.
    `.trim();

        const parts = [{ text: SYSTEM_PROMPT }];
        if (text) parts.push({ text: `INPUT TEXT:\n${text}` });
        if (image) {
            // image is data:image/png;base64,...
            // Gemini expects base64 string without prefix in inlineData
            const base64Data = image.split(",")[1];
            const mimeType = image.split(";")[0].split(":")[1];
            parts.push({
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            });
        }

        const MODEL = "gemini-1.5-flash"; // Multimodal model
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;

        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                    temperature: 0.1,
                    responseMimeType: "application/json"
                },
            }),
        });

        if (!resp.ok) {
            const txt = await resp.text();
            console.error("Gemini import error", resp.status, txt);
            throw new Error("Gemini API error");
        }

        const data = await resp.json();
        const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!jsonText) throw new Error("No data generated");

        const entries = JSON.parse(jsonText);
        return res.json({ entries });

    } catch (e) {
        console.error("Server error in /api/import", e);
        return res.status(500).json({ error: "Failed to process import" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));