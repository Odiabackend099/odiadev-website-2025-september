#!/bin/bash
# ODIADEV TTS — EC2 User Data (Ubuntu 22.04 LTS)
# Engine: OpenAI TTS (gpt-4o-mini-tts) via Flask + Gunicorn behind Nginx
# Auth: Your own ODIADEV keys in /opt/tts-api/keys.txt (one per line)
# CORS: Universal (*) so ANY project can call it worldwide
set -euxo pipefail

echo "[1/7] System update & packages"
apt-get update -y
apt-get upgrade -y
apt-get install -y python3 python3-venv python3-pip nginx sqlite3 curl ca-certificates

# Optional: small swap helps t3.small stability
if ! swapon --show | grep -q "swapfile"; then
  fallocate -l 1G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=1024
  chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo "/swapfile none swap sw 0 0" >> /etc/fstab
fi

echo "[2/7] App layout"
mkdir -p /opt/tts-api
cd /opt/tts-api
python3 -m venv venv
/opt/tts-api/venv/bin/pip install --upgrade pip
/opt/tts-api/venv/bin/pip install flask==3.0.0 flask-cors==4.0.0 gunicorn==21.2.0 requests==2.31.0

# Your ODIADEV API keys (replace after boot with your real keys; one per line)
touch /opt/tts-api/keys.txt
chmod 600 /opt/tts-api/keys.txt

# Environment file (systemd reads this)
cat >/opt/tts-api/.env <<'ENV'
# ==== ODIADEV TTS API (.env) ====
# Universal CORS so any project can call this API
ALLOWED_ORIGINS=*
MAX_TEXT_LEN=5000

# Defaults for TTS
DEFAULT_FORMAT=mp3
DEFAULT_LANG=en-NG
DEFAULT_TONE=neutral
DEFAULT_SPEED=1.0

# Data & auth
TTS_DB_PATH=/opt/tts-api/tts_api.db
ALLOWED_KEYS_FILE=/opt/tts-api/keys.txt

# OpenAI TTS (required)
OPENAI_API_KEY=REPLACE_WITH_YOUR_OPENAI_KEY
OPENAI_MODEL=gpt-4o-mini-tts
OPENAI_BASE_URL=https://api.openai.com/v1

# Gunicorn listen (Nginx proxies public :80 to this)
PORT=8000
ENV
chmod 640 /opt/tts-api/.env

echo "[3/7] API server (Flask)"
cat >/opt/tts-api/tts_api_server.py <<'PY'
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
  # Public, static list aligned with frontends
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
PY
chmod +x /opt/tts-api/tts_api_server.py

echo "[4/7] systemd service"
cat >/etc/systemd/system/tts-api.service <<'UNIT'
[Unit]
Description=ODIADEV TTS (OpenAI Proxy)
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/tts-api
EnvironmentFile=/opt/tts-api/.env
ExecStart=/opt/tts-api/venv/bin/gunicorn --bind 127.0.0.1:8000 --workers 4 --timeout 120 tts_api_server:app
Restart=always
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable tts-api

echo "[5/7] Nginx (universal CORS, proxy to gunicorn)"
cat >/etc/nginx/conf.d/tts-api.conf <<'NG'
server {
  listen 80 default_server;
  server_name _;

  add_header Access-Control-Allow-Origin "*" always;
  add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
  add_header Access-Control-Allow-Headers "x-api-key, Content-Type, Authorization, Range, X-Request-Id" always;
  add_header Timing-Allow-Origin "*" always;

  if ($request_method = OPTIONS) { return 204; }

  client_max_body_size 25m;
  gzip on;
  gzip_types audio/mpeg audio/ogg audio/aac audio/flac application/json text/plain;

  location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 300s;
    proxy_send_timeout 300s;
  }

  access_log /var/log/nginx/tts-api-access.log;
  error_log  /var/log/nginx/tts-api-error.log;
}
NG

rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx

echo "[6/7] Start API + health"
systemctl restart tts-api
sleep 3
curl -fsS http://127.0.0.1/v1/health || true

echo "[7/7] READY"
echo "Update /opt/tts-api/.env with your OPENAI_API_KEY, put your keys in /opt/tts-api/keys.txt, then: sudo systemctl restart tts-api"

