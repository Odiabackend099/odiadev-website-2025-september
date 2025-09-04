

import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import OpenAI from "openai";
import fs from "node:fs";
import crypto from "node:crypto";

// ============================================================================
// SECURITY CONFIGURATION & VALIDATION
// ============================================================================

// Validate critical environment variables
function validateEnvironment() {
  const required = ['OPENAI_API_KEY', 'ODIADEV_API_KEYS'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`[FATAL] Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  
  // Validate API key format
  if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
    console.error('[FATAL] Invalid OpenAI API key format');
    process.exit(1);
  }
  
  // Validate ODIADEV API keys
  const keys = parseKeys();
  if (keys.length === 0) {
    console.error('[FATAL] No valid ODIADEV API keys provided');
    process.exit(1);
  }
  
  console.log(`[SECURITY] Environment validation passed. ${keys.length} API keys loaded.`);
}

// Parse and validate API keys
function parseKeys() {
  const keys = (process.env.ODIADEV_API_KEYS || "").split(";").map(s => s.trim()).filter(Boolean);
  
  // Validate key format (should be 32+ characters)
  const validKeys = keys.filter(key => key.length >= 32);
  
  if (validKeys.length !== keys.length) {
    console.warn(`[SECURITY] ${keys.length - validKeys.length} invalid API keys filtered out`);
  }
  
  return validKeys;
}

// ============================================================================
// SECURITY UTILITIES
// ============================================================================

// Timing-safe comparison for security
function tsEqual(a, b) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// Input sanitization for text content
function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  
  // Remove potential script injection
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

// Rate limiting with enhanced security
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT || "120", 10),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  // Enhanced rate limiting
  keyGenerator: (req) => {
    // Use API key + IP for more granular rate limiting
    const apiKey = req.header("x-api-key") || req.ip;
    return `${apiKey}:${req.ip}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Rate limit exceeded",
      retryAfter: Math.ceil(15 * 60 / 1000), // 15 minutes in seconds
      message: "Too many requests from this source"
    });
  }
});

// ============================================================================
// APPLICATION CONFIGURATION
// ============================================================================

const PORT = process.env.PORT || 8080;
const MODEL = process.env.MODEL || "gpt-4o-mini-tts";
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const ALLOW = (process.env.ALLOWED_ORIGINS || "").split(";").map(s => s.trim()).filter(Boolean);
const FORMAT_DEFAULT = process.env.DEFAULT_AUDIO_FORMAT || "mp3";
const RATE = parseInt(process.env.RATE_LIMIT || "120", 10);

// Validate environment before starting
validateEnvironment();

const client = new OpenAI({ apiKey: OPENAI_KEY });
const app = express();

// Multi-key auth (compatible with EC2 User Data)
const SERVICE_KEYS = parseKeys();

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

function extractToken(req) {
  return (req.header("x-api-key") || "").trim() ||
         (req.header("authorization") || "").replace(/^Bearer /i, "").trim();
}

function requireServiceKey(req, res, next) {
  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({ 
      error: "Unauthorized",
      message: "API key required",
      code: "MISSING_API_KEY"
    });
  }
  
  if (!SERVICE_KEYS.some(key => tsEqual(key, token))) {
    // Log failed authentication attempts (without sensitive data)
    console.warn(`[SECURITY] Failed authentication attempt from ${req.ip}`);
    
    return res.status(401).json({ 
      error: "Unauthorized",
      message: "Invalid API key",
      code: "INVALID_API_KEY"
    });
  }
  
  next();
}

// ============================================================================
// MIDDLEWARE STACK
// ============================================================================

// Enhanced CORS with security - Allow file:// for local testing
app.use(cors({
  origin(o, cb) {
    // Allow null origin (file://) for local HTML testing
    if (!o) return cb(null, true);
    
    // Strict origin validation
    const ok = ALLOW.some(p => {
      if (p.includes("*")) {
        // Only allow wildcards for subdomains, not full wildcards
        if (p === "*") return false;
        const pattern = "^" + p.replace(/\./g,"\\.").replace(/\*/g,"[^.]+") + "$";
        return new RegExp(pattern).test(o);
      }
      return o === p;
    });
    
    if (!ok) {
      console.warn(`[SECURITY] CORS blocked origin: ${o}`);
    }
    
    cb(ok ? null : new Error("CORS blocked"), ok);
  },
  credentials: false, // Disable credentials for security
  methods: ['GET', 'POST', 'OPTIONS'], // Include OPTIONS for preflight
  allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'] // Include Authorization
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Request parsing with strict limits
app.use(express.json({ 
  limit: "1mb",
  strict: true,
  verify: (req, res, buf) => {
    // Additional JSON validation
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }
}));

// Logging with security considerations
app.use(morgan("combined", {
  skip: (req, res) => res.statusCode < 400, // Only log errors
  stream: {
    write: (message) => {
      // Sanitize log messages
      const sanitized = message.replace(/[^\w\s\-:]/g, '');
      console.log(sanitized);
    }
  }
}));

// Apply rate limiting
app.use(rateLimiter);

// ============================================================================
// DATA LOADING
// ============================================================================

// Load voices with error handling
let voices;
try {
  voices = JSON.parse(fs.readFileSync(new URL("../voices.json", import.meta.url)));
  if (!voices.profiles || !Array.isArray(voices.profiles)) {
    throw new Error('Invalid voices.json structure');
  }
} catch (error) {
  console.error('[FATAL] Failed to load voices.json:', error.message);
  process.exit(1);
}

// ============================================================================
// ROUTES
// ============================================================================

// Homepage (simple tester link)
app.get("/", (_q, res) => res.type("html").send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>ODIADEV TTS</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <h1>ODIADEV TTS</h1>
    <p>Health: <a href='/v1/health'>/v1/health</a></p>
    <p>Use <code>x-api-key</code> for /v1/voices and /v1/tts.</p>
    <hr>
    <h2>Quick Test</h2>
    <p>Use your API key with the <code>x-api-key</code> header</p>
    <p>Example: <code>curl -H "x-api-key: YOUR_API_KEY" http://localhost:8080/v1/voices</code></p>
  </body>
  </html>
`));

app.get("/v1/health", (_q, res) => res.json({ 
  status: "ok", 
  brand: "ODIADEV TTS", 
  model: MODEL, 
  voices: voices.profiles.length,
  timestamp: new Date().toISOString()
}));

app.get("/v1/voices", requireServiceKey, (_q, res) => res.json(voices));

// Enhanced TTS request validation
const TTSBody = z.object({
  text: z.string()
    .min(1, "Text must be at least 1 character")
    .max(5000, "Text must be at most 5000 characters")
    .refine(text => text.trim().length > 0, "Text cannot be empty"),
  voice_id: z.enum(["naija_male_deep", "naija_male_warm", "naija_female_warm", "naija_female_bold", "us_male_story", "us_female_clear"])
    .optional()
    .default("naija_female_warm"),
  format: z.enum(["mp3","wav","opus","aac","flac"])
    .optional()
    .default(FORMAT_DEFAULT),
  speed: z.number()
    .min(0.5, "Speed must be at least 0.5")
    .max(1.5, "Speed must be at most 1.5")
    .optional()
    .default(1.0),
  lang: z.string()
    .regex(/^[a-z]{2}-[A-Z]{2}$/, "Language must be in format: en-NG")
    .optional()
    .default("en-NG"),
  tone: z.enum(["neutral","friendly","bold","calm","sales","support","ads"])
    .optional()
    .default("neutral")
});

function buildPrompt(text, profile, tone) {
  // Sanitize input text
  const sanitizedText = sanitizeText(text);
  
  // Nigerian accent + tone hints based on voice profile
  let accentLead = "";
  
  if (profile.voice_id.includes("naija_female")) {
    accentLead = "Read as a NIGERIAN FEMALE voice with authentic Naija English cadence. ";
  } else if (profile.voice_id.includes("naija_male")) {
    accentLead = "Read as a NIGERIAN MALE voice with authentic Naija English cadence. ";
  }
  
  const toneHints = {
    friendly: "Make it warm, welcoming and friendly. Add light Pidgin where natural. ",
    bold: "Deliver with confidence and presence. ",
    calm: "Keep it calm and steady. ",
    sales: "Persuasive and upbeat for marketing. ",
    support: "Empathetic and reassuring. ",
    ads: "Catchy and punchy for short ads. "
  };
  
  return (accentLead + (toneHints[tone] || "") + sanitizedText).trim();
}

function mime(fmt) {
  const mimeTypes = {
    mp3: "audio/mpeg", 
    wav: "audio/wav", 
    opus: "audio/ogg", 
    aac: "audio/aac", 
    flac: "audio/flac"
  };
  return mimeTypes[fmt] || "application/octet-stream";
}

app.post("/v1/tts", requireServiceKey, async (req, res) => {
  let p;
  
  try {
    p = TTSBody.parse(req.body || {});
  } catch (error) {
    console.warn(`[VALIDATION] TTS request validation failed: ${error.message}`);
    return res.status(400).json({ 
      error: "Bad request", 
      message: "Invalid request parameters",
      details: error.errors || error.message
    });
  }
  
  // Find voice profile
  const profile = voices.profiles.find(v => v.voice_id === p.voice_id);
  if (!profile) {
    return res.status(400).json({ 
      error: "Bad request",
      message: "Unknown voice_id",
      code: "INVALID_VOICE_ID"
    });
  }
  
  try {
    const input = buildPrompt(p.text, profile, p.tone);
    
    // Log TTS request (without sensitive content)
    console.log(`[TTS] Generating speech for voice: ${p.voice_id}, tone: ${p.tone}, format: ${p.format}`);
    
    const speech = await client.audio.speech.create({
      model: MODEL,
      voice: profile.openai_voice,
      input: input,
      format: p.format,
      speed: p.speed
    });
    
    const b = Buffer.from(await speech.arrayBuffer());
    
    // Set security headers for audio response
    res.setHeader("Content-Type", mime(p.format));
    res.setHeader("Content-Length", b.length);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    
    res.send(b);
    
    console.log(`[TTS] Successfully generated ${b.length} bytes of audio`);
  } catch (e) {
    // Log error without exposing internal details
    console.error("[TTS ERROR]", e?.status || "", e?.message || "Unknown error");
    
    // Return generic error message for production
    res.status(500).json({ 
      error: "TTS generation failed",
      message: "Unable to generate speech at this time",
      code: "TTS_ERROR"
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "Endpoint not found",
    code: "ENDPOINT_NOT_FOUND"
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('[ERROR] Unhandled error:', error);
  
  res.status(500).json({
    error: "Internal server error",
    message: "An unexpected error occurred",
    code: "INTERNAL_ERROR"
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
  console.log(`[STARTUP] ODIADEV TTS listening on ${PORT}`);
  console.log(`[SECURITY] CORS origins: ${ALLOW.join(', ')}`);
  console.log(`[SECURITY] Rate limit: ${RATE} requests per 15 minutes`);
  console.log(`[SECURITY] ${SERVICE_KEYS.length} API keys loaded`);
  console.log(`[SECURITY] Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SHUTDOWN] Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[SHUTDOWN] Received SIGINT, shutting down gracefully');
  process.exit(0);
});
