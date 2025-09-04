# 🎤 ODIADEV TTS API - Production Ready

A comprehensive, production-ready Text-to-Speech API built with Flask, featuring Nigerian and US voice profiles, API key authentication, and universal CORS support for all client types.

## 🚀 Features

- **🌐 Universal CORS Support** - Works with browsers, mobile apps, n8n, and any client
- **🔐 API Key Authentication** - Secure access control with user management
- **🎭 Multiple Voice Profiles** - Nigerian and US voices with different tones
- **📊 Usage Tracking** - Monitor API usage and implement rate limiting
- **🔄 Retry Logic** - Robust error handling with automatic retries
- **⚡ High Performance** - Gunicorn + Nginx for production scalability
- **📱 Mobile Ready** - Optimized for all device types
- **🔧 Easy Deployment** - One-click EC2 deployment with user-data script

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Web Browsers  │    │   n8n/Workflows │
│   (Mobile/Web)  │    │   (CORS Ready)  │    │   (Automation)  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │        Nginx Proxy        │
                    │    (CORS + SSL + Cache)   │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Flask API Server      │
                    │  (Gunicorn + 4 Workers)   │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      SQLite Database      │
                    │  (Users + Voices + Usage) │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      OpenAI API           │
                    │   (gpt-4o-mini-tts)       │
                    └───────────────────────────┘
```

## 📋 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/v1/health` | Health check | ❌ |
| `POST` | `/v1/admin/users` | Issue API keys | 🔑 Admin |
| `GET` | `/v1/voices` | List available voices | ✅ |
| `POST` | `/v1/voices` | Create custom voice | ✅ |
| `POST` | `/v1/tts` | Generate speech | ✅ |
| `GET` | `/v1/usage` | Usage statistics | ✅ |

## 🚀 Quick Start

### 1. Deploy to EC2 (One-Click)

1. **Launch EC2 Instance** (Ubuntu 22.04 LTS)
2. **Configure Security Group** - Open port 80 (HTTP)
3. **Paste User Data Script** - Copy contents of `ec2-user-data.sh`
4. **Wait 5-10 minutes** for deployment to complete
5. **Test**: `curl http://YOUR_EC2_IP/v1/health`

### 2. Configure API

```bash
# SSH to your EC2 instance
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Update environment variables
sudo nano /opt/tts-api/.env

# Set your OpenAI API key
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Restart service
sudo systemctl restart tts-api
```

### 3. Issue API Keys

```bash
# Issue API key for a user
curl -X POST http://YOUR_EC2_IP/v1/admin/users \
  -H "X-Admin-Token: admin_change_me_12345" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### 4. Test TTS Generation

```bash
# Generate speech
curl -X POST http://YOUR_EC2_IP/v1/tts \
  -H "x-api-key: tts_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello Lagos! This is a test.",
    "voice_id": "naija_female_warm",
    "format": "mp3",
    "tone": "friendly"
  }' \
  --output speech.mp3
```

## 🌐 Client Integration

### Browser (JavaScript)

```javascript
// Simple fetch example
async function speak(text, apiKey, baseUrl) {
  const response = await fetch(`${baseUrl}/v1/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      text,
      voice_id: 'naija_female_warm',
      format: 'mp3',
      tone: 'friendly'
    })
  });
  
  const audioBlob = await response.blob();
  const audio = new Audio(URL.createObjectURL(audioBlob));
  audio.play();
}

// Usage
speak('Hello Lagos!', 'tts_your_api_key', 'http://YOUR_EC2_IP');
```

### n8n Workflow

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "tts-webhook",
        "httpMethod": "POST"
      }
    },
    {
      "name": "TTS API",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://YOUR_EC2_IP/v1/tts",
        "headers": {
          "x-api-key": "tts_your_api_key",
          "Content-Type": "application/json"
        },
        "body": {
          "text": "{{ $json.message }}",
          "voice_id": "naija_female_warm",
          "format": "mp3"
        }
      }
    }
  ]
}
```

### Python

```python
import requests

def generate_speech(text, api_key, base_url):
    response = requests.post(
        f"{base_url}/v1/tts",
        headers={
            "x-api-key": api_key,
            "Content-Type": "application/json"
        },
        json={
            "text": text,
            "voice_id": "naija_female_warm",
            "format": "mp3",
            "tone": "friendly"
        }
    )
    
    if response.status_code == 200:
        with open("speech.mp3", "wb") as f:
            f.write(response.content)
        return "Speech saved to speech.mp3"
    else:
        return f"Error: {response.status_code} - {response.text}"

# Usage
result = generate_speech(
    "Hello Lagos!", 
    "tts_your_api_key", 
    "http://YOUR_EC2_IP"
)
print(result)
```

## 🎭 Available Voices

| Voice ID | Name | Description | Language |
|----------|------|-------------|----------|
| `naija_female_warm` | Nigerian Female Warm | Warm & lively; conversational | en-NG |
| `naija_female_bold` | Nigerian Female Bold | Bold & confident; ads & announcements | en-NG |
| `naija_male_deep` | Nigerian Male Deep | Deep & calm authority; news/support | en-NG |
| `us_male_story` | US Male Storyteller | Calm storyteller; explainer videos | en-US |

## 🎨 Tone Options

| Tone | Description |
|------|-------------|
| `neutral` | Standard, clear delivery |
| `friendly` | Warm, welcoming with light Pidgin |
| `bold` | Confident and authoritative |
| `calm` | Steady and soothing |
| `sales` | Persuasive and upbeat |
| `support` | Empathetic and reassuring |
| `ads` | Catchy and punchy |

## ⚙️ Configuration

### Environment Variables

```bash
# Database
TTS_DB_PATH=/opt/tts-api/tts_api.db

# Security
TTS_ADMIN_TOKEN=admin_change_me_12345
ALLOWED_ORIGINS=*

# Limits
MAX_TEXT_LEN=5000
RATE_LIMIT_REQUESTS=60
RATE_LIMIT_WINDOW=60
RATE_LIMIT_CHARS_PER_DAY=300000

# OpenAI
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4o-mini-tts
OPENAI_BASE_URL=https://api.openai.com/v1

# Defaults
DEFAULT_FORMAT=mp3
DEFAULT_LANG=en-NG
DEFAULT_TONE=neutral
DEFAULT_SPEED=1.0
```

### Rate Limiting

- **Requests**: 60 per minute per API key
- **Characters**: 300,000 per day per API key
- **Text Length**: Maximum 5,000 characters per request

## 🔧 Deployment Options

### Option 1: EC2 User Data (Recommended)

1. Copy `ec2-user-data.sh` content
2. Paste into EC2 "User Data" field
3. Launch instance
4. Wait for automatic deployment

### Option 2: Manual Deployment

```bash
# Clone repository
git clone <your-repo>
cd odiadev-tts

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env

# Start with Gunicorn
gunicorn --bind 0.0.0.0:8000 --workers 4 tts_api_server:app
```

### Option 3: Docker (Optional)

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY tts_api_server.py .
EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "tts_api_server:app"]
```

## 📊 Monitoring & Logs

### Service Status

```bash
# Check service status
sudo systemctl status tts-api

# View logs
sudo journalctl -u tts-api -f

# Restart service
sudo systemctl restart tts-api
```

### Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/tts-api-access.log

# Error logs
tail -f /var/log/nginx/tts-api-error.log
```

### Application Logs

```bash
# API logs
tail -f /opt/tts-api/tts_api.log

# Gunicorn logs
tail -f /opt/tts-api/access.log
tail -f /opt/tts-api/error.log
```

## 🔒 Security Features

- **API Key Authentication** - Secure access control
- **Rate Limiting** - Prevent abuse and ensure fair usage
- **Input Validation** - Sanitize all user inputs
- **CORS Configuration** - Control cross-origin access
- **Security Headers** - XSS protection, content type validation
- **Admin Token** - Separate admin access for key management

## 🚨 Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   ```bash
   sudo systemctl restart tts-api
   sudo systemctl restart nginx
   ```

2. **CORS Errors**
   - Check `ALLOWED_ORIGINS` in environment
   - Verify Nginx CORS headers

3. **OpenAI API Errors**
   - Verify `OPENAI_API_KEY` is set correctly
   - Check OpenAI account credits

4. **Database Issues**
   ```bash
   sudo chown ubuntu:ubuntu /opt/tts-api/tts_api.db
   ```

### Health Checks

```bash
# API health
curl http://YOUR_EC2_IP/v1/health

# Service status
sudo systemctl is-active tts-api

# Port check
netstat -tlnp | grep :8000
```

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer** - Use ALB/ELB in front of multiple instances
2. **Database** - Migrate to PostgreSQL/MySQL for multi-instance
3. **Caching** - Add Redis for voice caching
4. **CDN** - Use CloudFront for audio file delivery

### Vertical Scaling

1. **Increase Workers** - Edit Gunicorn worker count
2. **Larger Instance** - Upgrade EC2 instance type
3. **Database Optimization** - Add indexes, connection pooling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: This README
- **Examples**: `client-examples.html`

---

**Built with ❤️ for the Nigerian tech community**