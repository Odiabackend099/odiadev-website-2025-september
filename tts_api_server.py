#!/usr/bin/env python3
import os, sqlite3, uuid, json, time, requests
from datetime import datetime
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

# Config
PORT              = int(os.getenv("PORT","8000"))
DB_PATH           = os.getenv("TTS_DB_PATH","/opt/tts-api/tts_api.db")
ALLOWED_ORIGINS   = os.getenv("ALLOWED_ORIGINS","*")
MAX_TEXT_LEN      = int(os.getenv("MAX_TEXT_LEN","5000"))
DEFAULT_FORMAT    = os.getenv("DEFAULT_FORMAT","mp3").lower()
DEFAULT_LANG      = os.getenv("DEFAULT_LANG","en-NG")
DEFAULT_TONE      = os.getenv("DEFAULT_TONE","neutral")
DEFAULT_SPEED     = float(os.getenv("DEFAULT_SPEED","1.0"))
ALLOWED_KEYS_FILE = os.getenv("ALLOWED_KEYS_FILE","/opt/tts-api/keys.txt")

OPENAI_API_KEY    = os.getenv("OPENAI_API_KEY","")
OPENAI_MODEL      = os.getenv("OPENAI_MODEL","gpt-4o-mini-tts")
OPENAI_BASE_URL   = os.getenv("OPENAI_BASE_URL","https://api.openai.com/v1")

FORMATS = {"mp3":"audio/mpeg","wav":"audio/wav","opus":"audio/ogg","aac":"audio/aac","flac":"audio/flac"}
VOICES = [
  {"voice_id":"naija_male_deep","name":"Nigerian Male Deep","openai_voice":"onyx"},
  {"voice_id":"naija_male_warm","name":"Nigerian Male Warm","openai_voice":"verse"},
  {"voice_id":"naija_female_warm","name":"Nigerian Female Warm","openai_voice":"coral"},
  {"voice_id":"naija_female_bold","name":"Nigerian Female Bold","openai_voice":"alloy"},
  {"voice_id":"us_male_story","name":"US Male Story","openai_voice":"sage"},
  {"voice_id":"us_female_clear","name":"US Female Clear","openai_voice":"amber"},
]

def init_db():
  con = sqlite3.connect(DB_PATH); cur = con.cursor()
  cur.execute("""CREATE TABLE IF NOT EXISTS usage(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_key TEXT, endpoint TEXT, chars INTEGER, req_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )""")
  con.commit(); con.close()

def load_keys():
  try:
    with open(ALLOWED_KEYS_FILE,"r") as f:
      return set([ln.strip() for ln in f if ln.strip()])
  except FileNotFoundError:
    return set()

def find_openai_voice(voice_id:str)->str:
  for v in VOICES:
    if v["voice_id"] == voice_id:
      return v["openai_voice"]
  return "alloy"

init_db()
app = Flask(__name__)
CORS(app,
  origins="*" if ALLOWED_ORIGINS=="*" else [o.strip() for o in ALLOWED_ORIGINS.split(",")],
  allow_headers=["Content-Type","x-api-key","Authorization","Range","X-Request-Id"],
  supports_credentials=False, methods=["GET","POST","OPTIONS"]
)

def need_key(fn):
  def wrap(*a, **k):
    api_key = request.headers.get("x-api-key") or request.headers.get("X-API-Key")
    if not api_key or api_key not in load_keys():
      return jsonify({"error":"invalid_or_missing_api_key"}), 401
    request.user_key = api_key
    return fn(*a, **k)
  wrap.__name__ = fn.__name__
  return wrap

@app.after_request
def add_cors(r):
  if ALLOWED_ORIGINS == "*": r.headers["Access-Control-Allow-Origin"] = "*"
  r.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
  r.headers["Access-Control-Allow-Headers"] = "Content-Type,x-api-key,Authorization,Range,X-Request-Id"
  r.headers["Timing-Allow-Origin"] = "*"
  return r

@app.get("/v1/health")
def health():
  return jsonify({"ok":True,"service":"odiadev-tts-openai-proxy","time":datetime.utcnow().isoformat()+"Z","formats":list(FORMATS.keys())})

@app.get("/v1/voices")
@need_key
def voices():
  return jsonify({"voices":[{"voice_id":v["voice_id"],"name":v["name"]} for v in VOICES]})

def openai_tts(text:str, voice_id:str, fmt:str, speed:float)->bytes:
  if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY not configured")
  voice = find_openai_voice(voice_id)
  headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
  payload = {"model": OPENAI_MODEL, "voice": voice, "input": text, "response_format": fmt, "speed": speed}
  # 3-tier retry for NG networks
  for delay in (0.25, 0.5, 1.0, None):
    try:
      r = requests.post(f"{OPENAI_BASE_URL}/audio/speech", headers=headers, json=payload, timeout=45)
      if r.status_code == 200: return r.content
      err = RuntimeError(f"OpenAI {r.status_code}: {r.text[:200]}")
    except Exception as e:
      err = e
    if delay is None: raise err
    time.sleep(delay)

@app.route("/v1/tts", methods=["POST","OPTIONS"])
@need_key
def tts():
  if request.method == "OPTIONS": return ("",204)
  data  = request.get_json(silent=True) or {}
  text  = (data.get("text") or "").strip()
  voice = data.get("voice_id") or data.get("voiceId") or "naija_female_warm"
  fmt   = (data.get("format") or DEFAULT_FORMAT).lower()
  speed = float(data.get("speed") or DEFAULT_SPEED)
  # tone/lang accepted for forward-compat
  _tone = data.get("tone") or DEFAULT_TONE
  _lang = data.get("lang") or DEFAULT_LANG

  if not text: return jsonify({"error":"text required"}), 400
  if len(text) > MAX_TEXT_LEN: return jsonify({"error":f"text too long (max {MAX_TEXT_LEN})"}), 400
  if fmt not in FORMATS: fmt = DEFAULT_FORMAT

  audio = openai_tts(text, voice, fmt, speed)

  try:
    con = sqlite3.connect(DB_PATH); cur = con.cursor()
    cur.execute("INSERT INTO usage(user_key,endpoint,chars,req_id) VALUES(?,?,?,?)",
                (request.user_key, "/v1/tts", len(text), str(uuid.uuid4())))
    con.commit(); con.close()
  except: pass

  resp = make_response(audio)
  resp.headers["Content-Type"] = FORMATS[fmt]
  resp.headers["Cache-Control"] = "no-store"
  return resp

if __name__ == "__main__":
  app.run(host="0.0.0.0", port=PORT)