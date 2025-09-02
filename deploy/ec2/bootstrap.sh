#!/usr/bin/env bash
set -euo pipefail

# ODIADEV TTS Bootstrap Script for EC2 t3.small
# Auto-detects Ubuntu 22.04 vs Amazon Linux 2023
# Creates production-ready TTS system with systemd + Nginx

echo "🚀 ODIADEV TTS Bootstrap Starting..."
echo "======================================"

# Detect OS and package manager
if command -v apt &> /dev/null; then
    OS="ubuntu"
    PKG_MANAGER="apt"
    NGINX_SITE_DIR="/etc/nginx/sites-available"
    NGINX_ENABLE_DIR="/etc/nginx/sites-enabled"
    echo "📦 Detected Ubuntu - using apt package manager"
elif command -v dnf &> /dev/null; then
    OS="amazon"
    PKG_MANAGER="dnf"
    NGINX_SITE_DIR="/etc/nginx/conf.d"
    NGINX_ENABLE_DIR="/etc/nginx/conf.d"
    echo "📦 Detected Amazon Linux - using dnf package manager"
else
    echo "❌ Unsupported OS - only Ubuntu 22.04+ and Amazon Linux 2023+ supported"
    exit 1
fi

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    echo "❌ This script must be run as root (use sudo)"
    exit 1
fi

# Update system packages
echo "🔄 Updating system packages..."
if [[ "$OS" == "ubuntu" ]]; then
    apt update -y
    apt upgrade -y
else
    dnf update -y
fi

# Install required packages
echo "📦 Installing required packages..."
if [[ "$OS" == "ubuntu" ]]; then
    apt install -y curl wget git jq software-properties-common
    apt install -y nginx
    apt install -y certbot python3-certbot-nginx
else
    dnf install -y curl wget git jq
    dnf install -y nginx
    dnf install -y certbot python3-certbot-nginx
fi

# Install Node.js 20.x
echo "🟢 Installing Node.js 20.x..."
if [[ "$OS" == "ubuntu" ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    dnf install -y nodejs
fi

# Verify Node.js installation
NODE_VERSION=$(node --version)
echo "✅ Node.js installed: $NODE_VERSION"

# Create application directory
APP_DIR="/opt/odiadev-tts"
echo "📁 Creating application directory: $APP_DIR"
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/src"
mkdir -p "$APP_DIR/public"
mkdir -p "$APP_DIR/deploy"

# Copy application files (assuming script is run from project root)
echo "📋 Copying application files..."
if [[ -f "package.json" ]]; then
    cp -r src/* "$APP_DIR/src/"
    cp -r public/* "$APP_DIR/public/"
    cp package.json voices.json "$APP_DIR/"
    echo "✅ Application files copied from current directory"
else
    echo "⚠️  No package.json found - you'll need to copy files manually to $APP_DIR"
fi

# Create environment directory
ENV_DIR="/etc/odiadev-tts"
echo "🔐 Creating environment directory: $ENV_DIR"
mkdir -p "$ENV_DIR"

# Create .env file if it doesn't exist
ENV_FILE="$ENV_DIR/.env"
if [[ ! -f "$ENV_FILE" ]]; then
    echo "🔧 Creating default .env file..."
    cat > "$ENV_FILE" << 'EOF'
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# ODIADEV Security
ODIADEV_API_KEY=your_odiadev_api_key_here

# TTS Settings
MODEL=gpt-4o-mini-tts
DEFAULT_AUDIO_FORMAT=mp3

# Server Configuration
PORT=8080
RATE_LIMIT=120

# CORS Origins (semicolon-separated)
ALLOWED_ORIGINS=https://*.odia.dev;https://*.odiadev.com;http://localhost:3000

# Optional: Domain for HTTPS (leave empty for HTTP only)
DOMAIN=
EOF
    echo "⚠️  IMPORTANT: Edit $ENV_FILE with your real API keys!"
else
    echo "✅ .env file already exists"
fi

# Check memory and create swapfile if needed
TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
if [[ $TOTAL_MEM -lt 3072 ]]; then
    echo "💾 Low memory detected (${TOTAL_MEM}MB) - creating swapfile..."
    if [[ ! -f /swapfile ]]; then
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        echo "✅ 2GB swapfile created and activated"
    else
        echo "✅ Swapfile already exists"
    fi
else
    echo "✅ Sufficient memory: ${TOTAL_MEM}MB"
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd "$APP_DIR"
npm install --production

# Create systemd service
echo "🔧 Creating systemd service..."
cat > /etc/systemd/system/odiadev-tts.service << 'EOF'
[Unit]
Description=ODIADEV TTS Service
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/opt/odiadev-tts
EnvironmentFile=/etc/odiadev-tts/.env
ExecStart=/usr/bin/node /opt/odiadev-tts/src/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=odiadev-tts

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx
echo "🌐 Configuring Nginx..."
NGINX_CONF="$NGINX_SITE_DIR/odiadev-tts"
if [[ "$OS" == "ubuntu" ]]; then
    cat > "$NGINX_CONF" << 'EOF'
server {
    listen 80;
    server_name _;
    
    client_max_body_size 2m;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF
    ln -sf "$NGINX_CONF" "$NGINX_ENABLE_DIR/"
else
    cat > "$NGINX_CONF" << 'EOF'
server {
    listen 80;
    server_name _;
    
    client_max_body_size 2m;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF
fi

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

# Enable and start services
echo "🚀 Enabling and starting services..."
systemctl daemon-reload
systemctl enable odiadev-tts
systemctl start odiadev-tts
systemctl enable nginx
systemctl start nginx

# Wait for service to start
echo "⏳ Waiting for service to start..."
sleep 5

# Check service status
if systemctl is-active --quiet odiadev-tts; then
    echo "✅ ODIADEV TTS service is running"
else
    echo "❌ Service failed to start - checking logs..."
    journalctl -u odiadev-tts -n 20
    exit 1
fi

# Get public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || curl -s ifconfig.me 2>/dev/null || echo "unknown")
if [[ "$PUBLIC_IP" == "unknown" ]]; then
    PUBLIC_IP=$(hostname -I | awk '{print $1}')
fi

# Check if DOMAIN is set for HTTPS
if [[ -f "$ENV_FILE" ]] && grep -q "DOMAIN=" "$ENV_FILE"; then
    DOMAIN=$(grep "^DOMAIN=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    if [[ -n "$DOMAIN" ]]; then
        echo "🔒 Setting up HTTPS for domain: $DOMAIN"
        certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN
        echo "✅ HTTPS certificate installed for $DOMAIN"
    fi
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
echo "🎉 ODIADEV TTS Bootstrap Complete!"
echo "======================================"
echo "📱 Service URL: http://$PUBLIC_IP"
if [[ -n "${DOMAIN:-}" ]]; then
    echo "🔒 HTTPS URL: https://$DOMAIN"
fi
echo "🔐 Environment file: $ENV_FILE"
echo "📁 Application directory: $APP_DIR"
echo "🔧 Service status: systemctl status odiadev-tts"
echo "📋 Nginx status: systemctl status nginx"
echo ""
echo "⚠️  IMPORTANT: Edit $ENV_FILE with your real API keys!"
echo "🧪 Test with: curl http://$PUBLIC_IP/v1/health"
echo ""
echo "🔄 To restart: systemctl restart odiadev-tts"
echo "📊 To view logs: journalctl -u odiadev-tts -f"
echo "🌐 To reload Nginx: systemctl reload nginx"
