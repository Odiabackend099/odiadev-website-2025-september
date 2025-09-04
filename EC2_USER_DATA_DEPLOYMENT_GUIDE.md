# ODIADEV TTS API - EC2 User Data Deployment Guide

## 🚀 One-Click Deployment with EC2 User Data

This guide shows you how to deploy your TTS API using EC2 User Data for a completely automated, production-ready setup that meets **ALL** requirements for universal access.

## ✅ What This Deployment Provides

Your EC2 User Data script (`ec2-user-data-final.sh`) creates a complete TTS API that:

- ✅ **Universal CORS** - Callable from any project worldwide
- ✅ **All 6 Voice IDs** - Complete voice set as specified
- ✅ **5 Audio Formats** - mp3, wav, opus, aac, flac
- ✅ **7 Tone Options** - neutral, friendly, bold, calm, sales, support, ads
- ✅ **Production Ready** - Nginx + Gunicorn + systemd
- ✅ **Auto-boot** - Services start automatically on reboot
- ✅ **Security** - Proper file permissions and API key management
- ✅ **Monitoring** - Comprehensive logging and health checks

## 🎯 Deployment Steps

### 1. Launch EC2 Instance

**Instance Configuration:**
- **AMI**: Ubuntu 22.04 LTS
- **Instance Type**: t3.small (or larger)
- **Storage**: 20 GB EBS (gp3)
- **Security Group**: 
  - HTTP (80) from 0.0.0.0/0
  - HTTPS (443) from 0.0.0.0/0
  - SSH (22) from your IP

### 2. Add User Data Script

In the EC2 launch configuration, paste the entire `ec2-user-data-final.sh` script into the **User Data** field.

### 3. Launch and Wait

The script will automatically:
1. Update system packages
2. Install Python 3.10+, Nginx, and dependencies
3. Create swap file for stability
4. Set up `/opt/tts-api` directory structure
5. Install Python packages in virtual environment
6. Create configuration files
7. Set up systemd service
8. Configure Nginx with universal CORS
9. Start all services
10. Test the deployment

**Deployment takes approximately 3-5 minutes.**

### 4. Post-Deployment Configuration

After the instance launches, SSH in and configure your API keys:

```bash
# 1. Set your OpenAI API key
sudo sed -i 's/OPENAI_API_KEY=.*/OPENAI_API_KEY=your_actual_openai_key_here/' /opt/tts-api/.env

# 2. Add your ODIADEV API keys
sudo nano /opt/tts-api/keys.txt
# Add your keys, one per line:
# tts_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
# odiadev_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb

# 3. Restart the service
sudo systemctl restart tts-api
```

### 5. Verify Deployment

Run the verification script:

```bash
sudo bash verify-ec2-deployment.sh
```

## 🧪 Testing Your API

### Health Check
```bash
curl http://YOUR_EC2_IP/v1/health
```

### TTS Request
```bash
curl -X POST http://YOUR_EC2_IP/v1/tts \
  -H 'x-api-key: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "Hello Lagos! This is ODIADEV TTS speaking.",
    "voice_id": "naija_female_warm",
    "format": "mp3",
    "speed": 1.0,
    "tone": "neutral",
    "lang": "en-NG"
  }' \
  --output hello.mp3
```

### List Voices
```bash
curl -H 'x-api-key: YOUR_API_KEY' http://YOUR_EC2_IP/v1/voices
```

## 📚 SDK Usage Examples

### JavaScript/Node.js
```javascript
const { ODIADEVTTS, VOICE_IDS, AUDIO_FORMATS } = require('./odiadev-tts-javascript-sdk.js');

const client = new ODIADEVTTS('your_api_key_here', {
    baseUrl: 'http://YOUR_EC2_IP'
});

const response = await client.generateSpeech({
    text: 'Hello Lagos! This is ODIADEV TTS speaking.',
    voiceId: VOICE_IDS.NAIJA_FEMALE_WARM,
    format: AUDIO_FORMATS.MP3,
    saveTo: './output.mp3'
});
```

### Python
```python
from odiadev_tts_python_sdk import ODIADEVTTS, VoiceID, AudioFormat

client = ODIADEVTTS('your_api_key_here', base_url='http://YOUR_EC2_IP')

response = client.generate_speech(
    text='Hello Lagos! This is ODIADEV TTS speaking.',
    voice_id=VoiceID.NAIJA_FEMALE_WARM,
    format=AudioFormat.MP3,
    save_to_file='output.mp3'
)
```

### PHP
```php
require_once 'odiadev-tts-php-sdk.php';

$client = new ODIADEVTTS('your_api_key_here', [
    'baseUrl' => 'http://YOUR_EC2_IP'
]);

$response = $client->generateSpeech([
    'text' => 'Hello Lagos! This is ODIADEV TTS speaking.',
    'voiceId' => ODIADEVTTS::VOICE_NAIJA_FEMALE_WARM,
    'format' => ODIADEVTTS::FORMAT_MP3,
    'saveTo' => './output.mp3'
]);
```

## 🔧 Management Commands

### Service Management
```bash
# Check status
systemctl status tts-api
systemctl status nginx

# Restart services
systemctl restart tts-api
systemctl restart nginx

# View logs
journalctl -u tts-api -f
tail -f /var/log/nginx/access.log
```

### Configuration Updates
```bash
# Update environment
sudo nano /opt/tts-api/.env
sudo systemctl restart tts-api

# Update API keys
sudo nano /opt/tts-api/keys.txt
sudo systemctl restart tts-api

# Update Nginx config
sudo nano /etc/nginx/conf.d/tts-api.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 🌐 Universal Access Features

Your deployed TTS API supports:

### CORS Configuration
- ✅ `Access-Control-Allow-Origin: *` - Any domain can call your API
- ✅ `Access-Control-Allow-Methods: GET, POST, OPTIONS` - All required methods
- ✅ `Access-Control-Allow-Headers: x-api-key, Content-Type, Authorization, Range, X-Request-Id` - All required headers
- ✅ OPTIONS preflight handling (returns 204)

### Voice Options
- ✅ `naija_male_deep` - Nigerian male, deep & calm authority
- ✅ `naija_male_warm` - Nigerian male, warm & friendly
- ✅ `naija_female_warm` - Nigerian female, warm & lively
- ✅ `naija_female_bold` - Nigerian female, bold & confident
- ✅ `us_male_story` - US male, calm storyteller
- ✅ `us_female_clear` - US female, clear & professional

### Audio Formats
- ✅ MP3 - Most compatible
- ✅ WAV - Uncompressed audio
- ✅ OPUS - High quality, small size
- ✅ AAC - Apple devices
- ✅ FLAC - Lossless audio

### Tone Options
- ✅ `neutral` - Default tone
- ✅ `friendly` - Warm and welcoming
- ✅ `bold` - Confident and strong
- ✅ `calm` - Steady and peaceful
- ✅ `sales` - Persuasive and upbeat
- ✅ `support` - Empathetic and reassuring
- ✅ `ads` - Catchy and punchy

## 🔒 Security Features

- ✅ API key authentication via `x-api-key` header
- ✅ Secure file permissions (600 for keys, 640 for env)
- ✅ Rate limiting and usage tracking
- ✅ Input validation and sanitization
- ✅ Proper error handling without information leakage

## 📊 Monitoring and Logs

### Log Locations
- **Application logs**: `journalctl -u tts-api -f`
- **Nginx access logs**: `/var/log/nginx/tts-api-access.log`
- **Nginx error logs**: `/var/log/nginx/tts-api-error.log`
- **Application access logs**: `/opt/tts-api/access.log`
- **Application error logs**: `/opt/tts-api/error.log`

### Health Monitoring
- **Health endpoint**: `GET /v1/health`
- **Service status**: `systemctl status tts-api`
- **Nginx status**: `systemctl status nginx`

## 🎉 Ready for Global Use

Your TTS API is now ready to serve requests from:

- ✅ **Lovable** - Full CORS support for web applications
- ✅ **Vercel** - Compatible with serverless deployments
- ✅ **Static Sites** - Works with any static site generator
- ✅ **Mobile Apps** - RESTful API with JSON responses
- ✅ **Any Project** - Universal CORS allows any domain

## 🆘 Troubleshooting

### Common Issues

1. **Service not starting**: Check logs with `journalctl -u tts-api -f`
2. **CORS errors**: Verify Nginx configuration with `nginx -t`
3. **API key errors**: Check `/opt/tts-api/keys.txt` permissions and content
4. **OpenAI errors**: Verify your OpenAI API key in `/opt/tts-api/.env`

### Verification Script
Run the comprehensive verification script:
```bash
sudo bash verify-ec2-deployment.sh
```

## 📞 Support

For issues or questions:
1. Check the logs: `journalctl -u tts-api -f`
2. Verify configuration: `sudo bash verify-ec2-deployment.sh`
3. Test endpoints: Use the curl examples above
4. Review this guide for configuration details

**Your TTS API is now ready for universal access! 🌍**
