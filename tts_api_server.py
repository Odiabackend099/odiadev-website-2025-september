#!/usr/bin/env python3
"""
ODIADEV TTS API Server - Production Ready
=========================================

A comprehensive Flask-based REST API for Text-to-Speech services.
Features:
- API key authentication
- User management
- Voice management
- Usage tracking
- CORS support for all clients
- Rate limiting
- Error handling with retries
- Production-ready logging

Endpoints:
- GET  /v1/health                    - Health check
- POST /v1/admin/users               - Issue API keys (admin)
- GET  /v1/voices                    - List available voices
- POST /v1/voices                    - Create custom voice
- POST /v1/tts                       - Generate speech
- GET  /v1/usage                     - Usage statistics

Usage:
    python tts_api_server.py
    # or with gunicorn:
    gunicorn --bind 0.0.0.0:8000 --workers 4 tts_api_server:app
"""

import os
import sqlite3
import uuid
import hashlib
import tempfile
import time
import logging
import json
import requests
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS
import threading
from collections import defaultdict

# ============================================================================
# CONFIGURATION
# ============================================================================

# Database and file paths
DB_PATH = os.getenv("TTS_DB_PATH", "/opt/tts-api/tts_api.db")
ADMIN_TOKEN = os.getenv("TTS_ADMIN_TOKEN", "admin_change_me_12345")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")  # "*" = allow all
MAX_TEXT_LEN = int(os.getenv("MAX_TEXT_LEN", "5000"))
ENGINE_FORMATS = {
    "mp3": "audio/mpeg",
    "wav": "audio/wav", 
    "opus": "audio/ogg",
    "aac": "audio/aac",
    "flac": "audio/flac"
}
DEFAULT_FORMAT = os.getenv("DEFAULT_FORMAT", "mp3")
DEFAULT_LANG = os.getenv("DEFAULT_LANG", "en-NG")
DEFAULT_TONE = os.getenv("DEFAULT_TONE", "neutral")
DEFAULT_SPEED = float(os.getenv("DEFAULT_SPEED", "1.0"))
REQUEST_TIMEOUT_MS = 120000

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini-tts")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")

# Rate limiting
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "60"))
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))  # seconds
RATE_LIMIT_CHARS_PER_DAY = int(os.getenv("RATE_LIMIT_CHARS_PER_DAY", "300000"))

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("/opt/tts-api/tts_api.log")
    ]
)
log = logging.getLogger("odiadev-tts-api")

# ============================================================================
# FLASK APP SETUP
# ============================================================================

app = Flask(__name__)

# CORS configuration - allow all origins for maximum compatibility
if ALLOWED_ORIGINS == "*":
    CORS(app, origins="*", allow_headers=["Content-Type", "x-api-key", "Authorization", "Range", "X-Request-Id"], 
         supports_credentials=False, methods=["GET", "POST", "OPTIONS"])
else:
    origins = [o.strip() for o in ALLOWED_ORIGINS.split(",")]
    CORS(app, origins=origins, allow_headers=["Content-Type", "x-api-key", "Authorization", "Range", "X-Request-Id"], 
         supports_credentials=False, methods=["GET", "POST", "OPTIONS"])

# ============================================================================
# DATABASE SETUP
# ============================================================================

def get_db():
    """Get database connection"""
    return sqlite3.connect(DB_PATH)

def init_db():
    """Initialize database tables"""
    con = get_db()
    cur = con.cursor()
    
    # Users table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            api_key TEXT UNIQUE,
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_used TEXT
        )
    """)
    
    # Voices table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS voices(
            id TEXT PRIMARY KEY,
            user_id TEXT,
            name TEXT,
            config TEXT,
            is_public INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)
    
    # Usage tracking table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS usage(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            endpoint TEXT,
            chars INTEGER,
            req_id TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)
    
    # Rate limiting table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS rate_limits(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            endpoint TEXT,
            request_count INTEGER DEFAULT 1,
            window_start TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)
    
    con.commit()
    con.close()
    
    # Insert default voices if they don't exist
    insert_default_voices()

def insert_default_voices():
    """Insert default voice profiles"""
    con = get_db()
    cur = con.cursor()
    
    # Check if default voices exist
    cur.execute("SELECT COUNT(*) FROM voices WHERE is_public = 1")
    count = cur.fetchone()[0]
    
    if count == 0:
        default_voices = [
            {
                "id": "naija_male_deep",
                "name": "Nigerian Male Deep",
                "config": json.dumps({
                    "openai_voice": "onyx",
                    "description": "Nigerian male, deep & calm authority; announcements/news/support.",
                    "language": "en-NG",
                    "accent": "nigerian"
                })
            },
            {
                "id": "naija_female_warm", 
                "name": "Nigerian Female Warm",
                "config": json.dumps({
                    "openai_voice": "coral",
                    "description": "Nigerian female, warm & lively; onboarding/conversational.",
                    "language": "en-NG",
                    "accent": "nigerian"
                })
            },
            {
                "id": "naija_female_bold",
                "name": "Nigerian Female Bold", 
                "config": json.dumps({
                    "openai_voice": "verse",
                    "description": "Nigerian female, bold & confident; ads & announcements.",
                    "language": "en-NG",
                    "accent": "nigerian"
                })
            },
            {
                "id": "us_male_story",
                "name": "US Male Storyteller",
                "config": json.dumps({
                    "openai_voice": "sage", 
                    "description": "US male, calm storyteller; explainer videos & narration.",
                    "language": "en-US",
                    "accent": "american"
                })
            }
        ]
        
        for voice in default_voices:
            cur.execute("""
                INSERT INTO voices(id, user_id, name, config, is_public)
                VALUES(?, ?, ?, ?, 1)
            """, (voice["id"], "system", voice["name"], voice["config"]))
    
    con.commit()
    con.close()

# Initialize database
init_db()

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def make_api_key(email: str) -> str:
    """Generate a stable, unique API key"""
    seed = f"{email}-{uuid.uuid4()}".encode()
    return "tts_" + hashlib.sha256(seed).hexdigest()[:32]

def find_user_by_key(api_key: str):
    """Find user by API key"""
    con = get_db()
    cur = con.cursor()
    cur.execute("SELECT id, email, is_active FROM users WHERE api_key=?", (api_key,))
    row = cur.fetchone()
    con.close()
    
    if not row or row[2] != 1:
        return None
    return {"id": row[0], "email": row[1]}

def check_rate_limit(user_id: str, endpoint: str, chars: int = 0) -> dict:
    """Check rate limits for user"""
    now = datetime.utcnow()
    window_start = now - timedelta(seconds=RATE_LIMIT_WINDOW)
    
    con = get_db()
    cur = con.cursor()
    
    # Check request rate limit
    cur.execute("""
        SELECT COUNT(*) FROM usage 
        WHERE user_id = ? AND endpoint = ? AND created_at > ?
    """, (user_id, endpoint, window_start.isoformat()))
    
    request_count = cur.fetchone()[0]
    
    # Check daily character limit
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    cur.execute("""
        SELECT SUM(chars) FROM usage 
        WHERE user_id = ? AND created_at > ?
    """, (user_id, today_start.isoformat()))
    
    daily_chars = cur.fetchone()[0] or 0
    
    con.close()
    
    if request_count >= RATE_LIMIT_REQUESTS:
        return {"ok": False, "error": "rate_limited", "message": "Too many requests per minute"}
    
    if daily_chars + chars > RATE_LIMIT_CHARS_PER_DAY:
        return {"ok": False, "error": "quota_exceeded", "message": "Daily character quota exceeded"}
    
    return {"ok": True}

def log_usage(user_id: str, endpoint: str, chars: int, req_id: str):
    """Log API usage"""
    con = get_db()
    cur = con.cursor()
    cur.execute("""
        INSERT INTO usage(user_id, endpoint, chars, req_id)
        VALUES(?, ?, ?, ?)
    """, (user_id, endpoint, chars, req_id))
    con.commit()
    con.close()

def generate_request_id() -> str:
    """Generate unique request ID"""
    return str(uuid.uuid4())

# ============================================================================
# AUTHENTICATION DECORATORS
# ============================================================================

def auth_required(fn):
    """Require valid API key"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        api_key = request.headers.get("x-api-key") or request.headers.get("X-API-Key")
        if not api_key:
            return jsonify({"error": "API key required"}), 401
        
        user = find_user_by_key(api_key)
        if not user:
            return jsonify({"error": "Invalid API key"}), 401
        
        request.user = user
        return fn(*args, **kwargs)
    return wrapper

def admin_required(fn):
    """Require admin token"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = request.headers.get("X-Admin-Token", "")
        if not ADMIN_TOKEN or token != ADMIN_TOKEN:
            return jsonify({"error": "admin token required"}), 401
        return fn(*args, **kwargs)
    return wrapper

# ============================================================================
# TTS ENGINE INTEGRATION
# ============================================================================

def synthesize_with_openai(text: str, voice_config: dict, format: str, speed: float = 1.0) -> bytes:
    """Generate speech using OpenAI API"""
    if not OPENAI_API_KEY:
        raise Exception("OpenAI API key not configured")
    
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": OPENAI_MODEL,
        "voice": voice_config.get("openai_voice", "alloy"),
        "input": text,
        "response_format": format,
        "speed": speed
    }
    
    response = requests.post(
        f"{OPENAI_BASE_URL}/audio/speech",
        headers=headers,
        json=data,
        timeout=30
    )
    
    if response.status_code != 200:
        raise Exception(f"OpenAI API error: {response.status_code} - {response.text}")
    
    return response.content

def synthesize_with_retries(text: str, voice_config: dict, format: str, speed: float = 1.0, retries=(0.5, 1.0, 2.0)):
    """Generate speech with retry logic"""
    last_err = None
    for i, delay in enumerate(retries):
        try:
            return synthesize_with_openai(text, voice_config, format, speed)
        except Exception as e:
            last_err = e
            log.warning(f"TTS attempt {i+1} failed: {e}")
            if i < len(retries) - 1:
                time.sleep(delay)
    
    raise last_err or RuntimeError("TTS generation failed after retries")

# ============================================================================
# ROUTES
# ============================================================================

@app.after_request
def add_cors_headers(response):
    """Add CORS headers to all responses"""
    if ALLOWED_ORIGINS == "*":
        response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,x-api-key,Authorization,Range,X-Request-Id"
    response.headers["Timing-Allow-Origin"] = "*"
    return response

@app.route("/v1/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "ok": True,
        "service": "odiadev-tts-api",
        "time": datetime.utcnow().isoformat() + "Z",
        "formats": list(ENGINE_FORMATS.keys()),
        "version": "1.0.0"
    })

@app.route("/v1/admin/users", methods=["POST"])
@admin_required
def admin_issue_key():
    """Issue API key for user (admin only)"""
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    
    if not email:
        return jsonify({"error": "email required"}), 400
    
    api_key = make_api_key(email)
    con = get_db()
    cur = con.cursor()
    
    try:
        cur.execute("""
            INSERT INTO users(id, email, api_key, is_active)
            VALUES(?, ?, ?, 1)
        """, (str(uuid.uuid4()), email, api_key))
        con.commit()
        return jsonify({"email": email, "api_key": api_key})
    except sqlite3.IntegrityError:
        # User already exists, return existing key
        cur.execute("SELECT api_key FROM users WHERE email=?", (email,))
        row = cur.fetchone()
        con.close()
        return jsonify({"email": email, "api_key": row[0]}), 200

@app.route("/v1/voices", methods=["GET"])
@auth_required
def list_voices():
    """List available voices"""
    con = get_db()
    cur = con.cursor()
    
    # Get public voices and user's custom voices
    cur.execute("""
        SELECT id, name, config, is_public, created_at 
        FROM voices 
        WHERE is_public = 1 OR user_id = ?
        ORDER BY is_public DESC, created_at DESC
    """, (request.user["id"],))
    
    rows = cur.fetchall()
    con.close()
    
    voices = []
    for row in rows:
        voice_id, name, config, is_public, created_at = row
        voice_config = json.loads(config) if config else {}
        
        voices.append({
            "voice_id": voice_id,
            "name": name,
            "description": voice_config.get("description", ""),
            "language": voice_config.get("language", "en-NG"),
            "accent": voice_config.get("accent", "nigerian"),
            "is_public": bool(is_public),
            "created_at": created_at
        })
    
    return jsonify({"voices": voices})

@app.route("/v1/voices", methods=["POST"])
@auth_required
def create_voice():
    """Create custom voice"""
    data = request.get_json() or {}
    name = (data.get("name") or data.get("voice_name") or "Custom Voice").strip()
    config = data.get("config") or {}
    
    # Validate config
    if not config.get("openai_voice"):
        return jsonify({"error": "openai_voice required in config"}), 400
    
    voice_id = "voice_" + uuid.uuid4().hex[:16]
    con = get_db()
    cur = con.cursor()
    
    cur.execute("""
        INSERT INTO voices(id, user_id, name, config)
        VALUES(?, ?, ?, ?)
    """, (voice_id, request.user["id"], name, json.dumps(config)))
    
    con.commit()
    con.close()
    
    return jsonify({"voice_id": voice_id, "name": name})

@app.route("/v1/tts", methods=["POST", "OPTIONS"])
@auth_required
def tts():
    """Generate speech from text"""
    req_id = request.headers.get("X-Request-Id", generate_request_id())
    
    if request.method == "OPTIONS":
        return make_response("", 204)
    
    started = time.time()
    data = request.get_json() or {}
    
    # Parse request parameters
    text = (data.get("text") or "").strip()
    voice_id = data.get("voice_id") or data.get("voiceId") or "naija_female_warm"
    format = (data.get("format") or DEFAULT_FORMAT).lower()
    speed = float(data.get("speed") or DEFAULT_SPEED)
    tone = data.get("tone") or DEFAULT_TONE
    lang = data.get("lang") or DEFAULT_LANG
    
    # Validation
    if not text:
        return jsonify({"error": "text required"}), 400
    
    if len(text) > MAX_TEXT_LEN:
        return jsonify({"error": f"text too long (max {MAX_TEXT_LEN})"}), 400
    
    if format not in ENGINE_FORMATS:
        format = DEFAULT_FORMAT
    
    # Check rate limits
    rate_check = check_rate_limit(request.user["id"], "/v1/tts", len(text))
    if not rate_check["ok"]:
        return jsonify(rate_check), 429
    
    # Load voice configuration
    con = get_db()
    cur = con.cursor()
    cur.execute("""
        SELECT config FROM voices 
        WHERE id = ? AND (is_public = 1 OR user_id = ?)
    """, (voice_id, request.user["id"]))
    
    row = cur.fetchone()
    con.close()
    
    if not row:
        return jsonify({"error": "voice_id not found"}), 404
    
    voice_config = json.loads(row[0])
    
    # Build enhanced text with tone and accent
    enhanced_text = build_enhanced_text(text, voice_config, tone, lang)
    
    try:
        # Generate speech with retries
        audio = synthesize_with_retries(enhanced_text, voice_config, format, speed)
        
        # Log usage
        log_usage(request.user["id"], "/v1/tts", len(text), req_id)
        
        # Update last used timestamp
        con = get_db()
        cur = con.cursor()
        cur.execute("UPDATE users SET last_used = CURRENT_TIMESTAMP WHERE id = ?", (request.user["id"],))
        con.commit()
        con.close()
        
        # Return audio response
        duration_ms = int((time.time() - started) * 1000)
        response = make_response(audio)
        response.headers["Content-Type"] = ENGINE_FORMATS[format]
        response.headers["X-Request-Id"] = req_id
        response.headers["X-Gen-Duration"] = str(duration_ms)
        response.headers["Cache-Control"] = "no-store"
        
        return response
        
    except Exception as e:
        log.error(f"TTS generation failed: {e}")
        return jsonify({"error": "TTS generation failed", "message": str(e)}), 500

@app.route("/v1/usage", methods=["GET"])
@auth_required
def get_usage():
    """Get usage statistics for user"""
    con = get_db()
    cur = con.cursor()
    
    # Get today's usage
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    cur.execute("""
        SELECT SUM(chars), COUNT(*) FROM usage 
        WHERE user_id = ? AND created_at > ?
    """, (request.user["id"], today.isoformat()))
    
    today_chars, today_requests = cur.fetchone()
    
    # Get total usage
    cur.execute("""
        SELECT SUM(chars), COUNT(*) FROM usage 
        WHERE user_id = ?
    """, (request.user["id"],))
    
    total_chars, total_requests = cur.fetchone()
    
    con.close()
    
    return jsonify({
        "today": {
            "characters": today_chars or 0,
            "requests": today_requests or 0
        },
        "total": {
            "characters": total_chars or 0,
            "requests": total_requests or 0
        },
        "limits": {
            "daily_chars": RATE_LIMIT_CHARS_PER_DAY,
            "requests_per_minute": RATE_LIMIT_REQUESTS
        }
    })

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def build_enhanced_text(text: str, voice_config: dict, tone: str, lang: str) -> str:
    """Build enhanced text with tone and accent instructions"""
    accent = voice_config.get("accent", "nigerian")
    description = voice_config.get("description", "")
    
    # Build accent instruction
    accent_instruction = ""
    if accent == "nigerian":
        if "female" in description.lower():
            accent_instruction = "Read as a NIGERIAN FEMALE voice with authentic Naija English cadence. "
        elif "male" in description.lower():
            accent_instruction = "Read as a NIGERIAN MALE voice with authentic Naija English cadence. "
        else:
            accent_instruction = "Read with authentic NIGERIAN English accent and cadence. "
    elif accent == "american":
        accent_instruction = "Read with clear AMERICAN English pronunciation. "
    
    # Build tone instruction
    tone_instructions = {
        "friendly": "Make it warm, welcoming and friendly. Add light Pidgin where natural. ",
        "bold": "Deliver with confidence and presence. ",
        "calm": "Keep it calm and steady. ",
        "sales": "Persuasive and upbeat for marketing. ",
        "support": "Empathetic and reassuring. ",
        "ads": "Catchy and punchy for short ads. ",
        "neutral": ""
    }
    
    tone_instruction = tone_instructions.get(tone, "")
    
    # Combine all instructions
    enhanced = (accent_instruction + tone_instruction + text).strip()
    
    return enhanced

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found", "message": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    log.error(f"Internal server error: {error}")
    return jsonify({"error": "Internal server error", "message": "An unexpected error occurred"}), 500

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    log.info("Starting ODIADEV TTS API Server")
    log.info(f"Database: {DB_PATH}")
    log.info(f"CORS Origins: {ALLOWED_ORIGINS}")
    log.info(f"Rate Limit: {RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_WINDOW} seconds")
    
    app.run(host="0.0.0.0", port=8000, debug=False)
