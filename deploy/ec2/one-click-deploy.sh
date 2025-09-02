#!/usr/bin/env bash
set -euo pipefail

# ODIADEV TTS One-Click EC2 Deployment
# Works on Ubuntu 22.04 and Amazon Linux 2023
# Auto-detects OS, installs dependencies, and deploys TTS system

echo "🚀 ODIADEV TTS One-Click EC2 Deployment"
echo "=========================================="
echo "This script will deploy a complete TTS system on your EC2 instance"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    echo "❌ This script must be run as root (use sudo)"
    exit 1
fi

# Detect OS
if command -v apt &> /dev/null; then
    OS="ubuntu"
    echo "📦 Detected Ubuntu"
elif command -v dnf &> /dev/null; then
    OS="amazon"
    echo "📦 Detected Amazon Linux"
else
    echo "❌ Unsupported OS - only Ubuntu 22.04+ and Amazon Linux 2023+ supported"
    exit 1
fi

# Install git and curl if not present
echo "📦 Installing git and curl..."
if [[ "$OS" == "ubuntu" ]]; then
    apt update -y
    apt install -y git curl
else
    dnf install -y git curl
fi

# Check if we're in a git repository or need to clone
if [[ -d ".git" ]]; then
    echo "✅ Already in git repository, using current directory"
    PROJECT_DIR=$(pwd)
else
    echo "📥 Cloning ODIADEV TTS repository..."
    PROJECT_DIR="/tmp/odiadev-tts"
    git clone https://github.com/yourusername/odiadev-tts.git "$PROJECT_DIR" || {
        echo "⚠️  Could not clone repository, using current directory"
        PROJECT_DIR=$(pwd)
    }
fi

# Navigate to project directory
cd "$PROJECT_DIR"

# Check if bootstrap script exists
if [[ ! -f "deploy/ec2/bootstrap.sh" ]]; then
    echo "❌ Bootstrap script not found in $PROJECT_DIR"
    echo "Please ensure you're in the correct directory or clone the repository"
    exit 1
fi

# Make bootstrap script executable
chmod +x deploy/ec2/bootstrap.sh

# Run bootstrap script
echo "🚀 Running bootstrap script..."
./deploy/ec2/bootstrap.sh

# Get public IP for final output
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || curl -s ifconfig.me 2>/dev/null || echo "unknown")
if [[ "$PUBLIC_IP" == "unknown" ]]; then
    PUBLIC_IP=$(hostname -I | awk '{print $1}')
fi

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo "📱 Your ODIADEV TTS system is now running at:"
echo "   http://$PUBLIC_IP"
echo ""
echo "🔐 Next steps:"
echo "   1. Edit /etc/odiadev-tts/.env with your real API keys"
echo "   2. Restart the service: systemctl restart odiadev-tts"
echo "   3. Test the system: curl http://$PUBLIC_IP/v1/health"
echo ""
echo "🧪 Run smoke test:"
echo "   cd $PROJECT_DIR && ./scripts/smoke.sh http://$PUBLIC_IP"
echo ""
echo "📊 Service status:"
echo "   systemctl status odiadev-tts"
echo "   systemctl status nginx"
echo ""
echo "🚀 Welcome to ODIADEV Zone!"
