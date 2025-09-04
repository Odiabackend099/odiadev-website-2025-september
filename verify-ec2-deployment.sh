#!/bin/bash
# ODIADEV TTS - EC2 Deployment Verification Script
# Verifies that the EC2 User Data deployment meets all requirements

set -euo pipefail

echo "🔍 ODIADEV TTS EC2 Deployment Verification"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check functions
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

check_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running on EC2
if curl -s --max-time 2 http://169.254.169.254/latest/meta-data/instance-type > /dev/null 2>&1; then
    INSTANCE_TYPE=$(curl -s http://169.254.169.254/latest/meta-data/instance-type)
    check_pass "Running on EC2 instance: $INSTANCE_TYPE"
    
    # Check if t3.small or larger
    if [[ "$INSTANCE_TYPE" == "t3.small" ]] || [[ "$INSTANCE_TYPE" == "t3.medium" ]] || [[ "$INSTANCE_TYPE" == "t3.large" ]]; then
        check_pass "Instance type is t3.small or larger: $INSTANCE_TYPE"
    else
        check_warn "Instance type $INSTANCE_TYPE - consider upgrading to t3.small or larger"
    fi
else
    check_warn "Not running on EC2 - ensure you have t3.small+ with Elastic IP"
fi

# Get public IP
PUBLIC_IP=$(curl -s --max-time 5 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || curl -s --max-time 5 ifconfig.me 2>/dev/null || echo "")
if [[ -n "$PUBLIC_IP" ]]; then
    check_pass "Public IP accessible: $PUBLIC_IP"
    check_info "Your TTS API URL: http://$PUBLIC_IP"
else
    check_fail "No public IP detected - ensure Elastic IP is attached"
fi

echo ""
echo "📁 1. Directory Structure"
echo "------------------------"

# Check directory structure
if [[ -d "/opt/tts-api" ]]; then
    check_pass "/opt/tts-api directory exists"
else
    check_fail "/opt/tts-api directory missing"
fi

# Check required files
REQUIRED_FILES=("/opt/tts-api/tts_api_server.py" "/opt/tts-api/.env" "/opt/tts-api/keys.txt")
for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        check_pass "$file exists"
    else
        check_fail "$file missing"
    fi
done

echo ""
echo "🐍 2. Python Environment"
echo "------------------------"

# Check Python version
PYTHON_VERSION=$(python3 --version 2>/dev/null | cut -d' ' -f2 || echo "")
if [[ -n "$PYTHON_VERSION" ]]; then
    if python3 -c "import sys; exit(0 if sys.version_info >= (3, 10) else 1)" 2>/dev/null; then
        check_pass "Python 3.10+ available: $(python3 --version)"
    else
        check_fail "Python version too old: $(python3 --version) - need 3.10+"
    fi
else
    check_fail "Python 3 not found"
fi

# Check virtual environment
if [[ -d "/opt/tts-api/venv" ]]; then
    check_pass "Python virtual environment exists"
else
    check_fail "Python virtual environment missing"
fi

# Check required packages
REQUIRED_PACKAGES=("flask" "flask_cors" "gunicorn" "requests")
for package in "${REQUIRED_PACKAGES[@]}"; do
    if /opt/tts-api/venv/bin/python -c "import $package" 2>/dev/null; then
        check_pass "$package is installed"
    else
        check_fail "$package is not installed"
    fi
done

echo ""
echo "⚙️  3. Environment Configuration"
echo "-------------------------------"

# Check .env file
if [[ -f "/opt/tts-api/.env" ]]; then
    check_pass ".env file exists"
    
    # Check for required environment variables
    REQUIRED_ENV_VARS=("ALLOWED_ORIGINS" "MAX_TEXT_LEN" "DEFAULT_FORMAT" "DEFAULT_LANG" "DEFAULT_TONE" "DEFAULT_SPEED" "TTS_DB_PATH" "ALLOWED_KEYS_FILE" "OPENAI_API_KEY" "PORT")
    
    for var in "${REQUIRED_ENV_VARS[@]}"; do
        if grep -q "^$var=" /opt/tts-api/.env; then
            VALUE=$(grep "^$var=" /opt/tts-api/.env | cut -d'=' -f2)
            if [[ "$var" == "OPENAI_API_KEY" ]] && [[ "$VALUE" == "REPLACE_WITH_YOUR_OPENAI_KEY" ]]; then
                check_warn "$var is set but needs to be updated with real key"
            else
                check_pass "$var is configured"
            fi
        else
            check_fail "$var is missing from .env file"
        fi
    done
    
    # Check CORS setting
    if grep -q "^ALLOWED_ORIGINS=\*" /opt/tts-api/.env; then
        check_pass "CORS is set to universal access (*)"
    else
        check_warn "CORS may not be set for universal access"
    fi
else
    check_fail ".env file missing"
fi

echo ""
echo "🔑 4. API Keys Configuration"
echo "----------------------------"

# Check keys file
if [[ -f "/opt/tts-api/keys.txt" ]]; then
    check_pass "API keys file exists"
    
    # Check file permissions
    PERMS=$(stat -c "%a" /opt/tts-api/keys.txt 2>/dev/null || echo "unknown")
    if [[ "$PERMS" == "600" ]]; then
        check_pass "API keys file has correct permissions (600)"
    else
        check_warn "API keys file permissions: $PERMS (should be 600)"
    fi
    
    # Check if keys are configured
    KEY_COUNT=$(grep -v "^#" /opt/tts-api/keys.txt | grep -v "^$" | wc -l)
    if [[ $KEY_COUNT -gt 0 ]]; then
        check_pass "API keys file has $KEY_COUNT key(s) configured"
    else
        check_warn "API keys file exists but no keys are configured"
        check_info "Add your API keys to /opt/tts-api/keys.txt (one per line)"
    fi
else
    check_fail "API keys file missing"
fi

echo ""
echo "🎤 5. Voice Configuration"
echo "------------------------"

# Check voice IDs in the API
if [[ -f "/opt/tts-api/tts_api_server.py" ]]; then
    REQUIRED_VOICES=("naija_male_deep" "naija_male_warm" "naija_female_warm" "naija_female_bold" "us_male_story" "us_female_clear")
    for voice in "${REQUIRED_VOICES[@]}"; do
        if grep -q "\"$voice\"" /opt/tts-api/tts_api_server.py; then
            check_pass "Voice ID $voice is available"
        else
            check_fail "Voice ID $voice is missing"
        fi
    done
    
    # Check audio formats
    REQUIRED_FORMATS=("mp3" "wav" "opus" "aac" "flac")
    for format in "${REQUIRED_FORMATS[@]}"; do
        if grep -q "\"$format\"" /opt/tts-api/tts_api_server.py; then
            check_pass "Audio format $format is supported"
        else
            check_fail "Audio format $format is missing"
        fi
    done
fi

echo ""
echo "🌐 6. Nginx Configuration"
echo "------------------------"

# Check Nginx configuration
if [[ -f "/etc/nginx/conf.d/tts-api.conf" ]]; then
    check_pass "Nginx configuration exists"
    
    if nginx -t &> /dev/null; then
        check_pass "Nginx configuration is valid"
    else
        check_fail "Nginx configuration has errors"
    fi
    
    # Check CORS headers
    if grep -q "Access-Control-Allow-Origin.*\*" /etc/nginx/conf.d/tts-api.conf; then
        check_pass "Nginx has universal CORS headers"
    else
        check_fail "Nginx missing universal CORS headers"
    fi
    
    if grep -q "Access-Control-Allow-Methods.*GET, POST, OPTIONS" /etc/nginx/conf.d/tts-api.conf; then
        check_pass "Nginx has correct CORS methods"
    else
        check_fail "Nginx missing correct CORS methods"
    fi
    
    if grep -q "Access-Control-Allow-Headers.*x-api-key" /etc/nginx/conf.d/tts-api.conf; then
        check_pass "Nginx has x-api-key in CORS headers"
    else
        check_fail "Nginx missing x-api-key in CORS headers"
    fi
    
    # Check OPTIONS handling
    if grep -q "if (\$request_method = OPTIONS)" /etc/nginx/conf.d/tts-api.conf; then
        check_pass "Nginx handles OPTIONS preflight requests"
    else
        check_fail "Nginx missing OPTIONS preflight handling"
    fi
else
    check_fail "Nginx configuration missing"
fi

echo ""
echo "🔧 7. Service Management"
echo "------------------------"

# Check if services are running
if systemctl is-active --quiet tts-api; then
    check_pass "TTS API service is running"
else
    check_fail "TTS API service is not running"
fi

if systemctl is-active --quiet nginx; then
    check_pass "Nginx service is running"
else
    check_fail "Nginx service is not running"
fi

# Check if services are enabled for boot
if systemctl is-enabled --quiet tts-api; then
    check_pass "TTS API service is enabled for boot"
else
    check_fail "TTS API service is not enabled for boot"
fi

if systemctl is-enabled --quiet nginx; then
    check_pass "Nginx service is enabled for boot"
else
    check_fail "Nginx service is not enabled for boot"
fi

echo ""
echo "🔌 8. API Endpoints"
echo "-------------------"

# Test health endpoint
if curl -s --max-time 10 http://127.0.0.1/v1/health > /dev/null; then
    check_pass "Health endpoint is accessible locally"
else
    check_fail "Health endpoint is not accessible locally"
fi

# Test public health endpoint
if curl -s --max-time 10 http://localhost/v1/health > /dev/null; then
    check_pass "Public health endpoint is accessible"
else
    check_fail "Public health endpoint is not accessible"
fi

# Test external health endpoint if public IP is available
if [[ -n "$PUBLIC_IP" ]]; then
    if curl -s --max-time 10 http://$PUBLIC_IP/v1/health > /dev/null; then
        check_pass "External health endpoint is accessible"
    else
        check_warn "External health endpoint is not accessible - check security groups"
    fi
fi

echo ""
echo "📊 Summary"
echo "=========="

# Count checks
TOTAL_CHECKS=$(grep -c "✅\|❌\|⚠️" <<< "$(cat $0)" || echo "0")
PASS_CHECKS=$(grep -c "✅" <<< "$(cat $0)" || echo "0")
FAIL_CHECKS=$(grep -c "❌" <<< "$(cat $0)" || echo "0")
WARN_CHECKS=$(grep -c "⚠️" <<< "$(cat $0)" || echo "0")

echo "Total checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $PASS_CHECKS${NC}"
echo -e "${RED}Failed: $FAIL_CHECKS${NC}"
echo -e "${YELLOW}Warnings: $WARN_CHECKS${NC}"

if [[ $FAIL_CHECKS -eq 0 ]]; then
    echo ""
    echo -e "${GREEN}🎉 All requirements are met! Your TTS API is ready for universal access.${NC}"
    echo ""
    echo -e "${BLUE}🌐 Your TTS API is accessible at: http://$PUBLIC_IP${NC}"
    echo -e "${BLUE}📚 API Documentation: Check your SDK files for usage examples${NC}"
    echo ""
    echo -e "${GREEN}✅ Ready for:${NC}"
    echo "   - Lovable projects"
    echo "   - Vercel deployments"
    echo "   - Static websites"
    echo "   - Mobile applications"
    echo "   - Any project worldwide"
else
    echo ""
    echo -e "${RED}❌ Some requirements are not met. Please address the failed checks above.${NC}"
fi

echo ""
echo "🔧 Quick Commands:"
echo "systemctl status tts-api"
echo "systemctl restart tts-api"
echo "journalctl -u tts-api -f"
echo "systemctl reload nginx"
