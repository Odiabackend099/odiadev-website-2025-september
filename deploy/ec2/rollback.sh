#!/usr/bin/env bash
set -euo pipefail

# ODIADEV TTS Rollback Script
# Stops services, removes configurations, and cleans up

echo "🔄 ODIADEV TTS Rollback Starting..."
echo "====================================="

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    echo "❌ This script must be run as root (use sudo)"
    exit 1
fi

# Configuration
SERVICE_NAME="odiadev-tts"
APP_DIR="/opt/odiadev-tts"
ENV_DIR="/etc/odiadev-tts"
NGINX_SITE="/etc/nginx/sites-available/odiadev-tts"
NGINX_ENABLED="/etc/nginx/sites-enabled/odiadev-tts"
NGINX_CONF_D="/etc/nginx/conf.d/odiadev-tts"

echo "⚠️  This will completely remove the ODIADEV TTS system"
echo "📋 Changes to be made:"
echo "   • Stop and disable TTS service"
echo "   • Remove Nginx configuration"
echo "   • Remove application files"
echo "   • Remove environment configuration"
echo "   • Optionally remove swapfile (if created by bootstrap)"
echo ""

read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Rollback cancelled"
    exit 0
fi

echo "🔄 Starting rollback process..."

# 1. Stop and disable TTS service
echo "🛑 Stopping TTS service..."
if systemctl is-active --quiet "$SERVICE_NAME"; then
    systemctl stop "$SERVICE_NAME"
    echo "✅ Service stopped"
else
    echo "ℹ️  Service was not running"
fi

if systemctl is-enabled --quiet "$SERVICE_NAME"; then
    systemctl disable "$SERVICE_NAME"
    echo "✅ Service disabled"
else
    echo "ℹ️  Service was not enabled"
fi

# Remove systemd service file
if [[ -f "/etc/systemd/system/$SERVICE_NAME.service" ]]; then
    rm -f "/etc/systemd/system/$SERVICE_NAME.service"
    systemctl daemon-reload
    echo "✅ Systemd service file removed"
fi

# 2. Remove Nginx configuration
echo "🌐 Removing Nginx configuration..."

# Ubuntu-style sites-available/sites-enabled
if [[ -f "$NGINX_SITE" ]]; then
    rm -f "$NGINX_SITE"
    echo "✅ Nginx site configuration removed"
fi

if [[ -L "$NGINX_ENABLED" ]]; then
    rm -f "$NGINX_ENABLED"
    echo "✅ Nginx enabled site link removed"
fi

# Amazon Linux-style conf.d
if [[ -f "$NGINX_CONF_D" ]]; then
    rm -f "$NGINX_CONF_D"
    echo "✅ Nginx conf.d configuration removed"
fi

# Test Nginx configuration
if command -v nginx &> /dev/null; then
    echo "🧪 Testing Nginx configuration..."
    if nginx -t; then
        echo "✅ Nginx configuration is valid"
        echo "🔄 Reloading Nginx..."
        systemctl reload nginx
    else
        echo "⚠️  Nginx configuration test failed"
    fi
fi

# 3. Remove application files
echo "📁 Removing application files..."
if [[ -d "$APP_DIR" ]]; then
    rm -rf "$APP_DIR"
    echo "✅ Application directory removed: $APP_DIR"
else
    echo "ℹ️  Application directory not found: $APP_DIR"
fi

# 4. Remove environment configuration
echo "🔐 Removing environment configuration..."
if [[ -d "$ENV_DIR" ]]; then
    rm -rf "$ENV_DIR"
    echo "✅ Environment directory removed: $ENV_DIR"
else
    echo "ℹ️  Environment directory not found: $ENV_DIR"
fi

# 5. Check for swapfile (only remove if created by bootstrap)
echo "💾 Checking for swapfile..."
if [[ -f "/swapfile" ]]; then
    echo "⚠️  Swapfile found at /swapfile"
    echo "   This may have been created by the bootstrap script"
    read -p "Remove swapfile? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        swapoff /swapfile
        rm -f /swapfile
        # Remove from fstab if it was added by bootstrap
        sed -i '/\/swapfile none swap sw 0 0/d' /etc/fstab
        echo "✅ Swapfile removed"
    else
        echo "ℹ️  Swapfile kept (manual removal required if needed)"
    fi
fi

# 6. Clean up any remaining files
echo "🧹 Cleaning up remaining files..."

# Remove any log files
if [[ -d "/var/log/odiadev-tts" ]]; then
    rm -rf "/var/log/odiadev-tts"
    echo "✅ Log directory removed"
fi

# Remove any temporary files
if [[ -d "/tmp/odiadev-tts" ]]; then
    rm -rf "/tmp/odiadev-tts"
    echo "✅ Temporary directory removed"
fi

# 7. Final status check
echo ""
echo "🔍 Final Status Check:"
echo "======================"

# Check if service is gone
if ! systemctl list-unit-files | grep -q "$SERVICE_NAME"; then
    echo "✅ TTS service completely removed"
else
    echo "⚠️  TTS service still exists in systemd"
fi

# Check if app directory is gone
if [[ ! -d "$APP_DIR" ]]; then
    echo "✅ Application directory removed"
else
    echo "⚠️  Application directory still exists"
fi

# Check if env directory is gone
if [[ ! -d "$ENV_DIR" ]]; then
    echo "✅ Environment directory removed"
else
    echo "⚠️  Environment directory still exists"
fi

# Check if Nginx configs are gone
if [[ ! -f "$NGINX_SITE" ]] && [[ ! -f "$NGINX_CONF_D" ]]; then
    echo "✅ Nginx configurations removed"
else
    echo "⚠️  Some Nginx configurations still exist"
fi

echo ""
echo "🎉 Rollback Complete!"
echo "===================="
echo "📋 Summary of changes:"
echo "   • TTS service stopped and removed"
echo "   • Nginx configuration cleaned up"
echo "   • Application files removed"
echo "   • Environment configuration removed"
echo "   • System cleaned up"
echo ""
echo "⚠️  Note: This rollback does NOT remove:"
echo "   • Node.js (if you want to remove: apt remove nodejs || dnf remove nodejs)"
echo "   • Nginx (if you want to remove: apt remove nginx || dnf remove nginx)"
echo "   • Other packages installed by bootstrap"
echo ""
echo "🔄 To reinstall, run the bootstrap script again"
echo "🚀 Thank you for trying ODIADEV TTS!"
