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
    // If caller already sent ISO in e.start, just use it
    if (e.start) {
        const t = new Date(e.start);
        if (!Number.isNaN(t.getTime())) return t.toISOString();
    }
    // Otherwise try to combine e.date + e.time from your TimelineEntryData
    const date = e.date ?? "";
    const time = e.time ?? "";
    const combined = `${date} ${time}`.trim();
    if (combined) {
        const dt = new Date(combined);
        if (!Number.isNaN(dt.getTime())) return dt.toISOString();
    }
    return undefined;
}

// Stricter greeting detection for "hi", "hello", "hey" with optional punctuation.
function isPureGreeting(s = "") {
    const trimmed = s.trim().toLowerCase();
    // "hi", "hello", "hey" with optional punctuation only
    return /^(hi|hello|hey)[!\.,\s]*$/.test(trimmed);
}

app.post("/api/chat", async (req, res) => {
    try {
        // Accept BOTH shapes:
        const body = req.body || {};
        const question = body.message ?? ""; // Frontend sends `message`
        const entriesIn = body.context ?? []; // Frontend sends `context`

        // 🔎 Debug: what did we receive?
        console.log("POST /api/chat ► received", {
            question: question,
            entriesInCount: Array.isArray(entriesIn) ? entriesIn.length : 0,
            firstEntry: Array.isArray(entriesIn) ? entriesIn[0] : null,
        });

        // map into compact shape, preserve raw date/time too
        const compact = (Array.isArray(entriesIn) ? entriesIn : []).map((e) => {
            const startISO = toISOMaybe(e); // your normalizer
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
                recurring: !!e.recurring,
                allDay: false,
            };
        });

        // Keep all entries for the model to decide, as it can use raw fields.
        const safe = compact.slice(0, 500);

        console.log("POST /api/chat ► after parse", {
            compactCount: compact.length,
            safeCount: safe.length,
            firstSafe: safe[0] ?? null,
        });

        if (isPureGreeting(question)) {
            return res.json({ reply: "Hi there! How can I help you with your health schedule today?" });
        }
        if (safe.length === 0) {
            return res.json({ reply: "I don’t see any entries I can use yet. Try adding an appointment or medication first." });
        }

        const SYSTEM_RULES = `
You are Lifeline's on-device health schedule assistant.
- Answer ONLY using the supplied JSON "entries".
- If an entry has no "start" ISO time, you MUST use its "rawDate" and "rawTime" fields as the source of truth.
- If the information isn't in the entries, say: "I don’t have that yet."
- Be concise. When giving times, use the format from "rawTime" (e.g., "08:00 AM").
- If the user asks a broad question like "what's up?" or "what's next?", summarize the next 5 upcoming items based on the current time.
`.trim();

        const grounding = JSON.stringify(safe, null, 2);
        const prompt = [
            SYSTEM_RULES,
            `TODAY_ISO: ${new Date().toISOString()}`,
            `ENTRIES (JSON):\n${grounding}`,
            `QUESTION: ${question}`,
        ].join("\n\n");

        // Use v1beta for gemini-1.5-flash and newer models
        const MODEL = "gemini-2.5-flash-lite";
        const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;

        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            }),
        });

        if (!resp.ok) {
            const txt = await resp.text();
            console.error("Gemini error", resp.status, txt);
            return res.status(502).json({ reply: "Sorry, I'm having trouble right now." });
        }

        const data = await resp.json();
        const answer =
            data?.candidates?.[0]?.content?.parts
                ?.map((p) => p?.text)
                .filter(Boolean)
                .join("") || "I don’t have that yet.";

        return res.json({ reply: answer });
    } catch (e) {
        console.error("Server error", e);
        return res.status(500).json({ reply: "Sorry, I'm having trouble right now." });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));