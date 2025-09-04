#!/bin/bash
# ODIADEV TTS - Production Deployment Script
# Sets up the complete TTS API system according to requirements

set -euo pipefail

echo "🚀 ODIADEV TTS Production Deployment"
echo "===================================="

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    echo "❌ This script must be run as root (use sudo)"
    exit 1
fi

# Detect OS
if command -v apt &> /dev/null; then
    OS="ubuntu"
    PKG_MANAGER="apt"
    echo "📦 Detected Ubuntu - using apt package manager"
elif command -v dnf &> /dev/null; then
    OS="amazon"
    PKG_MANAGER="dnf"
    echo "📦 Detected Amazon Linux - using dnf package manager"
else
    echo "❌ Unsupported OS - only Ubuntu 22.04+ and Amazon Linux 2023+ supported"
    exit 1
fi

# Update system
echo "🔄 Updating system packages..."
if [[ "$OS" == "ubuntu" ]]; then
    apt update -y
    apt upgrade -y
    apt install -y curl wget git jq software-properties-common
    apt install -y nginx
    apt install -y certbot python3-certbot-nginx
else
    dnf update -y
    dnf install -y curl wget git jq
    dnf install -y nginx
    dnf install -y certbot python3-certbot-nginx
fi

# Install Python 3.10+
echo "🐍 Installing Python 3.10+..."
if [[ "$OS" == "ubuntu" ]]; then
    apt install -y python3 python3-venv python3-pip python3-dev
else
    dnf install -y python3 python3-pip python3-devel
fi

# Install Node.js 20.x (for backup/alternative)
echo "🟢 Installing Node.js 20.x..."
if [[ "$OS" == "ubuntu" ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    dnf install -y nodejs
fi

# Create application directory structure
echo "📁 Creating application directory structure..."
mkdir -p /opt/tts-api
cd /opt/tts-api

# Create Python virtual environment
echo "🐍 Setting up Python virtual environment..."
python3 -m venv venv
/opt/tts-api/venv/bin/pip install --upgrade pip
/opt/tts-api/venv/bin/pip install flask==3.0.0 flask-cors==4.0.0 gunicorn==21.2.0 requests==2.31.0 python-dotenv==1.0.0

# Copy application files
echo "📋 Copying application files..."
if [[ -f "/root/tts_api_server.py" ]]; then
    cp /root/tts_api_server.py /opt/tts-api/
elif [[ -f "./tts_api_server.py" ]]; then
    cp ./tts_api_server.py /opt/tts-api/
else
    echo "⚠️  tts_api_server.py not found - you'll need to copy it manually"
fi

# Create environment file
echo "🔧 Creating environment configuration..."
cat > /opt/tts-api/.env << 'EOF'
# ODIADEV TTS API - Production Configuration
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

# Rate limiting
RATE_LIMIT_REQUESTS=60
RATE_LIMIT_WINDOW=60
RATE_LIMIT_CHARS_PER_DAY=300000

# Admin (optional)
TTS_ADMIN_TOKEN=admin_change_me_12345

# Gunicorn listen (Nginx proxies public :80 to this)
PORT=8000
EOF

# Create keys file
echo "🔐 Creating API keys file..."
cat > /opt/tts-api/keys.txt << 'EOF'
# ODIADEV TTS API Keys
# Add your API keys here, one per line
# Format: tts_[32-hex-characters] or odiadev_[32-hex-characters]
# Example:
# tts_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
# odiadev_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb

# Replace this file with your actual keys after deployment
EOF

chmod 600 /opt/tts-api/keys.txt
chmod 640 /opt/tts-api/.env

# Create systemd service
echo "🔧 Creating systemd service..."
cat > /etc/systemd/system/tts-api.service << 'EOF'
[Unit]
Description=ODIADEV TTS API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/tts-api
EnvironmentFile=/opt/tts-api/.env
ExecStart=/opt/tts-api/venv/bin/gunicorn --bind 127.0.0.1:8000 --workers 4 --timeout 120 --access-logfile /opt/tts-api/access.log --error-logfile /opt/tts-api/error.log tts_api_server:app
Restart=always
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/conf.d/tts-api.conf << 'EOF'
server {
    listen 80 default_server;
    server_name _;

    # Universal CORS (allow every project)
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "x-api-key, Content-Type, Authorization, Range, X-Request-Id" always;
    add_header Timing-Allow-Origin "*" always;

    # Handle preflight requests
    if ($request_method = OPTIONS) {
        return 204;
    }

    # Security headers
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;

    # File upload limits
    client_max_body_size 25m;
    client_body_timeout 60s;
    client_header_timeout 60s;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        audio/mpeg
        audio/ogg
        audio/aac
        audio/flac
        application/json
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json;

    # Proxy to Flask app
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        
        # Handle large responses (audio files)
        proxy_max_temp_file_size 0;
    }

    # Health check endpoint (no auth required)
    location /v1/health {
        proxy_pass http://127.0.0.1:8000/v1/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        access_log off;
    }

    # Logging
    access_log /var/log/nginx/tts-api-access.log;
    error_log /var/log/nginx/tts-api-error.log;
}
EOF

# Remove default Nginx site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

# Enable and start services
echo "🚀 Enabling and starting services..."
systemctl daemon-reload
systemctl enable tts-api
systemctl enable nginx

# Start services
systemctl start nginx
systemctl start tts-api

# Wait for service to start
echo "⏳ Waiting for service to start..."
sleep 5

# Check service status
if systemctl is-active --quiet tts-api; then
    echo "✅ TTS API service is running"
else
    echo "❌ Service failed to start - checking logs..."
    journalctl -u tts-api -n 20
    exit 1
fi

# Get public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || curl -s ifconfig.me 2>/dev/null || echo "unknown")
if [[ "$PUBLIC_IP" == "unknown" ]]; then
    PUBLIC_IP=$(hostname -I | awk '{print $1}')
fi

# Test the service
echo "🧪 Testing service..."
if curl -s http://127.0.0.1/v1/health > /dev/null; then
    echo "✅ Service health check passed"
else
    echo "❌ Service health check failed"
    exit 1
fi

echo ""
echo "🎉 ODIADEV TTS Production Deployment Complete!"
echo "=============================================="
echo "📱 Service URL: http://$PUBLIC_IP"
echo "🔐 Environment file: /opt/tts-api/.env"
echo "🔑 API keys file: /opt/tts-api/keys.txt"
echo "📁 Application directory: /opt/tts-api"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Edit /opt/tts-api/.env with your real OpenAI API key"
echo "2. Add your API keys to /opt/tts-api/keys.txt (one per line)"
echo "3. Restart the service: systemctl restart tts-api"
echo ""
echo "🧪 Test with:"
echo "curl http://$PUBLIC_IP/v1/health"
echo "curl -X POST http://$PUBLIC_IP/v1/tts \\"
echo "  -H 'x-api-key: YOUR_API_KEY' -H 'Content-Type: application/json' \\"
echo "  -d '{\"text\":\"Hello Lagos\",\"voice_id\":\"naija_female_warm\",\"format\":\"mp3\"}' \\"
echo "  --output hello.mp3"
echo ""
echo "🔧 Management commands:"
echo "systemctl status tts-api"
echo "systemctl restart tts-api"
echo "journalctl -u tts-api -f"
echo "systemctl reload nginx"
