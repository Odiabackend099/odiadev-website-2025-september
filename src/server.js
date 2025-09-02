import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import OpenAI from "openai";
import fs from "node:fs";
import crypto from "node:crypto";

const PORT = process.env.PORT || 8080;
const MODEL = process.env.MODEL || "gpt-4o-mini-tts";
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const ALLOW = (process.env.ALLOWED_ORIGINS || "").split(";").map(s => s.trim()).filter(Boolean);
const FORMAT_DEFAULT = process.env.DEFAULT_AUDIO_FORMAT || "mp3";
const RATE = parseInt(process.env.RATE_LIMIT || "120", 10);

if (!OPENAI_KEY) { console.error("[FATAL] OPENAI_API_KEY missing"); process.exit(1); }

const client = new OpenAI({ apiKey: OPENAI_KEY });
const app = express();

// Multi-key auth (compatible with EC2 User Data)
function parseKeys() {
  return (process.env.ODIADEV_API_KEYS || "").split(";").map(s => s.trim()).filter(Boolean);
}

const SERVICE_KEYS = parseKeys();

// Timing-safe comparison for security
function tsEqual(a, b) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function extractToken(req) {
  return (req.header("x-api-key") || "").trim() || 
         (req.header("authorization") || "").replace(/^Bearer /i, "").trim();
}

function requireServiceKey(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  
  if (!SERVICE_KEYS.some(key => tsEqual(key, token))) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// CORS, logging, limits
app.use(cors({
  origin(o, cb) {
    if (!o) return cb(null, true);
    const ok = ALLOW.some(p => p.includes("*") 
      ? new RegExp("^" + p.replace(/\./g,"\\.").replace(/\*/g,".*") + "$").test(o) 
      : o === p);
    cb(ok ? null : new Error("CORS"), ok);
  }
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));
app.use(rateLimit({ windowMs: 15*60*1000, max: RATE, standardHeaders: true, legacyHeaders: false }));

// Load voices
const voices = JSON.parse(fs.readFileSync(new URL("../voices.json", import.meta.url)));

// Homepage (simple tester link)
app.get("/", (_q, res) => res.type("html").send(`
  <h1>ODIADEV TTS</h1>
  <p>Health: <a href='/v1/health'>/v1/health</a></p>
  <p>Use <code>x-api-key</code> for /v1/voices and /v1/tts.</p>
  <hr>
  <h2>Quick Test</h2>
  <p>API Key: <code>odiadev_10abb658e85c30550ed75b30e7f55836</code></p>
  <p>Test with: <code>curl -H "x-api-key: odiadev_10abb658e85c30550ed75b30e7f55836" http://localhost:8080/v1/voices</code></p>
`));

app.get("/v1/health", (_q, res) => res.json({ status: "ok", brand: "ODIADEV TTS", model: MODEL, voices: voices.profiles.length }));
app.get("/v1/voices", requireServiceKey, (_q, res) => res.json(voices));

const TTSBody = z.object({
  text: z.string().min(1).max(5000),
  voice_id: z.string().optional().default("naija_female_warm"),
  format: z.enum(["mp3","wav","opus","aac","flac"]).optional().default(FORMAT_DEFAULT),
  speed: z.number().min(0.5).max(1.5).optional().default(1.0),
  lang: z.string().optional().default("en-NG"),
  tone: z.enum(["neutral","friendly","bold","calm","sales","support","ads"]).optional().default("neutral")
});

function buildPrompt(text, tone) {
  const hints = {
    friendly: "Read with friendly Nigerian English vibe, add light Pidgin. ",
    bold: "Read confidently in Nigerian English. ",
    calm: "Read calmly with steady pacing. ",
    sales: "Read persuasive, upbeat. ",
    support: "Read empathetic, reassuring. ",
    ads: "Read catchy and punchy. "
  };
  return (hints[tone] || "") + text;
}

function mime(fmt) {
  return {mp3:"audio/mpeg", wav:"audio/wav", opus:"audio/ogg", aac:"audio/aac", flac:"audio/flac"}[fmt] || "application/octet-stream";
}

app.post("/v1/tts", requireServiceKey, async (req, res) => {
  let p;
  try {
    p = TTSBody.parse(req.body || {});
  } catch {
    return res.status(400).json({ error: "Bad request" });
  }
  
  const profile = voices.profiles.find(v => v.voice_id === p.voice_id);
  if (!profile) return res.status(400).json({ error: "Unknown voice_id" });
  
  try {
    const speech = await client.audio.speech.create({
      model: MODEL,
      voice: profile.openai_voice,
      input: buildPrompt(p.text, p.tone),
      format: p.format,
      speed: p.speed
    });
    
    const b = Buffer.from(await speech.arrayBuffer());
    res.setHeader("Content-Type", mime(p.format));
    res.send(b);
  } catch (e) {
    console.error("[TTS ERROR]", e?.status || "", e?.message || e);
    res.status(500).json({ error: "TTS failed" });
  }
});

app.listen(PORT, () => console.log(`ODIADEV TTS listening on ${PORT}`));
