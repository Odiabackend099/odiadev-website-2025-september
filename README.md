# 🎤 ODIADEV TTS (ODIADEV Zone Solution)

**Secure proxy over OpenAI gpt-4o-mini-tts with Nigerian & US voice profiles**

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-EC2%20t3.small-orange.svg)](https://aws.amazon.com/ec2/instance-types/)

## 🚀 Quick Start

### One-Click EC2 Deployment

```bash
# On your EC2 instance (Ubuntu 22.04 or Amazon Linux 2023)
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/yourusername/odiadev-tts/main/deploy/ec2/one-click-deploy.sh)"
```

### Manual Deployment

1. **Launch EC2 t3.small instance**
   - OS: Ubuntu 22.04 LTS or Amazon Linux 2023
   - Security Group: Allow inbound ports 80 (HTTP) and 443 (HTTPS)

2. **Connect and deploy**
   ```bash
   # SSH into your instance
   ssh -i your-key.pem ubuntu@your-instance-ip
   
   # Clone repository
   git clone https://github.com/yourusername/odiadev-tts.git
   cd odiadev-tts
   
   # Run bootstrap (requires sudo)
   sudo ./deploy/ec2/bootstrap.sh
   ```

3. **Configure environment**
   ```bash
   # Edit environment file
   sudo nano /etc/odiadev-tts/.env
   
   # Add your OpenAI API key
   OPENAI_API_KEY=sk-your-actual-key-here
   
   # Restart service
   sudo systemctl restart odiadev-tts
   ```

4. **Test the system**
   ```bash
   # Health check
   curl http://your-instance-ip/v1/health
   
   # Run smoke test
   ./scripts/smoke.sh http://your-instance-ip
   ```

## 🎭 Voice Profiles

| Voice ID | OpenAI Voice | Description | Best For |
|-----------|--------------|-------------|----------|
| `naija_male_deep` | `onyx` | Deep & calm authority | Announcements, news, support |
| `naija_female_warm` | `verse` | Warm & lively | Onboarding, conversations |
| `us_male_story` | `sage` | Calm storyteller | Explainer videos, narration |
| `us_female_clear` | `coral` | Confident & clear | Ads, CTAs, presentations |

## 🔌 API Endpoints

### Health Check
```bash
GET /v1/health
# Returns: {"status":"ok","brand":"ODIADEV TTS","model":"gpt-4o-mini-tts","voices":4}
```

### List Voices
```bash
GET /v1/voices
Headers: x-api-key: YOUR_ODIADEV_API_KEY
# Returns: Available voice profiles
```

### Generate Speech
```bash
POST /v1/tts
Headers: 
  Content-Type: application/json
  x-api-key: YOUR_ODIADEV_API_KEY

Body:
{
  "text": "Your text here (1-5000 chars)",
  "voice_id": "naija_female_warm",
  "format": "mp3",
  "speed": 1.0,
  "lang": "en-NG",
  "tone": "friendly"
}
```

**Supported formats:** `mp3`, `wav`, `opus`, `aac`, `flac`  
**Speed range:** `0.5` to `1.5`  
**Tones:** `neutral`, `friendly`, `bold`, `calm`, `sales`, `support`, `ads`

## 🌍 Language Support

- **English (Nigerian)**: Primary support with Pidgin integration
- **Hausa**: Nigerian Hausa dialect
- **Igbo**: Nigerian Igbo dialect  
- **Yorùbá**: Nigerian Yoruba dialect
- **Efik**: Nigerian Efik dialect
- **Esan**: Nigerian Esan dialect

## 🏗️ Architecture

```
Internet → Nginx (Port 80/443) → Node.js App (Port 8080) → OpenAI API
```

- **Nginx**: Reverse proxy with SSL termination
- **Node.js**: Express.js application with rate limiting
- **Systemd**: Service management with auto-restart
- **Environment**: Secure configuration management

## 🔧 Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-your-openai-key
ODIADEV_API_KEY=your-odiadev-key

# Optional
MODEL=gpt-4o-mini-tts
DEFAULT_AUDIO_FORMAT=mp3
PORT=8080
RATE_LIMIT=120
ALLOWED_ORIGINS=https://*.odia.dev;https://*.odiadev.com
DOMAIN=yourdomain.com  # For HTTPS
```

### Rate Limiting
- Default: 120 requests per 15 minutes per IP
- Configurable via `RATE_LIMIT` environment variable

### CORS
- Configurable origins via `ALLOWED_ORIGINS`
- Supports wildcards: `https://*.odia.dev`

## 🧪 Testing

### Smoke Test
```bash
# Test all endpoints
./scripts/smoke.sh http://your-instance-ip

# Test with custom API key
./scripts/smoke.sh http://your-instance-ip YOUR_API_KEY
```

### cURL Examples
```bash
# View all examples
./scripts/curl-examples.sh http://your-instance-ip

# Quick health check
curl http://your-instance-ip/v1/health | jq '.'

# Generate audio
curl -X POST http://your-instance-ip/v1/tts \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY" \
  -d '{"text":"Hello from ODIADEV!","voice_id":"naija_female_warm"}' \
  -o output.mp3
```

## 🚀 Deployment Options

### EC2 t3.small (Recommended)
- **Cost**: ~$15/month
- **Performance**: 2 vCPU, 2GB RAM
- **Auto-scaling**: Optional with swapfile
- **OS Support**: Ubuntu 22.04, Amazon Linux 2023

### Docker (Alternative)
```bash
# Build and run
docker build -t odiadev-tts .
docker run -p 8080:8080 --env-file .env odiadev-tts

# Or use docker-compose
docker-compose up -d
```

### Render (Alternative)
- Deploy via `render.yaml`
- Automatic HTTPS
- Global CDN

## 📊 Performance

### t3.small Specifications
- **CPU**: 2 vCPUs (burstable)
- **Memory**: 2GB RAM
- **Network**: Up to 5 Gbps
- **Storage**: EBS optimized

### Optimization Features
- **Swapfile**: Auto-created if RAM < 3GB
- **Rate Limiting**: Prevents abuse
- **Connection Pooling**: Efficient OpenAI API usage
- **Static File Serving**: Optimized for web interface

## 🔒 Security Features

- **API Key Authentication**: Required for protected endpoints
- **Input Validation**: Zod schema validation
- **Rate Limiting**: Per-IP request throttling
- **CORS Protection**: Configurable origin allowlist
- **Environment Variables**: No secrets in code
- **HTTPS Support**: Automatic SSL with certbot

## 🛠️ Management

### Service Commands
```bash
# Start/stop/restart
sudo systemctl start odiadev-tts
sudo systemctl stop odiadev-tts
sudo systemctl restart odiadev-tts

# Status and logs
sudo systemctl status odiadev-tts
sudo journalctl -u odiadev-tts -f

# Enable/disable
sudo systemctl enable odiadev-tts
sudo systemctl disable odiadev-tts
```

### Nginx Commands
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx
```

### Rollback
```bash
# Complete system removal
sudo ./deploy/ec2/rollback.sh
```

## 🐛 Troubleshooting

### Common Issues

**Service won't start**
```bash
# Check logs
sudo journalctl -u odiadev-tts -n 50

# Check environment file
sudo cat /etc/odiadev-tts/.env

# Verify Node.js
node --version
```

**Nginx errors**
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

**API key issues**
```bash
# Verify key in environment
sudo grep ODIADEV_API_KEY /etc/odiadev-tts/.env

# Test with curl
curl -H "x-api-key: YOUR_KEY" http://localhost:8080/v1/voices
```

### Health Checks
```bash
# Service status
sudo systemctl is-active odiadev-tts

# Port listening
sudo netstat -tlnp | grep :8080

# Process running
ps aux | grep node
```

## 📚 Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

### Project Structure
```
odiadev-tts/
├── src/
│   └── server.js          # Main application
├── public/
│   ├── index.html         # Web tester interface
│   └── odiadev-voice-sdk.js # Browser SDK
├── deploy/
│   └── ec2/               # EC2 deployment scripts
├── scripts/
│   ├── smoke.sh           # Smoke test script
│   └── curl-examples.sh   # cURL examples
├── package.json           # Dependencies and scripts
└── voices.json           # Voice profile definitions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/odiadev-tts/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/odiadev-tts/wiki)
- **Community**: [Discussions](https://github.com/yourusername/odiadev-tts/discussions)

## 🙏 Acknowledgments

- **OpenAI**: For the TTS API
- **Express.js**: Web framework
- **Nginx**: Reverse proxy
- **Systemd**: Service management

---

**Made with ❤️ by ODIADEV Team**  
**ODIADEV Zone Solution - Empowering Nigerian Tech**
