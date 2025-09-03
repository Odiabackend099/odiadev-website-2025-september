# 🎤 ODIADEV TTS SDK - Complete Integration Guide

## 🚀 Quick Start

**Copy this entire section into your project for instant TTS integration:**

```javascript
// ===========================================
// ODIADEV TTS SDK - Copy & Paste Integration
// ===========================================

class ODIADEVTTS {
  constructor(apiKey, baseUrl = 'https://tts-api.odia.dev') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.voices = {
      naija_male_deep: 'Nigerian male, deep & calm authority',
      naija_female_warm: 'Nigerian female, warm & lively',
      naija_female_bold: 'Nigerian female, bold & confident',
      us_male_story: 'US male, calm storyteller'
    };
  }

  // Generate speech with Nigerian accent injection
  async generateSpeech(text, options = {}) {
    const {
      voice_id = 'naija_female_warm',
      format = 'mp3',
      speed = 1.0,
      tone = 'friendly'
    } = options;

    const response = await fetch(`${this.baseUrl}/v1/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey
      },
      body: JSON.stringify({
        text,
        voice_id,
        format,
        speed,
        tone,
        lang: 'en-NG'
      })
    });

    if (!response.ok) {
      throw new Error(`TTS failed: ${response.status}`);
    }

    return await response.arrayBuffer();
  }

  // Get available voices
  async getVoices() {
    const response = await fetch(`${this.baseUrl}/v1/voices`, {
      headers: { 'x-api-key': this.apiKey }
    });
    return await response.json();
  }

  // Check API health
  async checkHealth() {
    const response = await fetch(`${this.baseUrl}/v1/health`);
    return await response.json();
  }

  // Play audio in browser
  playAudio(audioBuffer, format = 'mp3') {
    const blob = new Blob([audioBuffer], { type: `audio/${format}` });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
    return audio;
  }

  // Download audio file
  downloadAudio(audioBuffer, filename = 'speech', format = 'mp3') {
    const blob = new Blob([audioBuffer], { type: `audio/${format}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// ===========================================
// USAGE EXAMPLES - Copy & Paste Ready
// ===========================================

// Initialize TTS
const tts = new ODIADEVTTS('YOUR_API_KEY_HERE');

// Example 1: Generate Nigerian female voice
async function generateNigerianVoice() {
  try {
    const audio = await tts.generateSpeech(
      'Welcome to our platform! This is a warm Nigerian female voice speaking.',
      { voice_id: 'naija_female_warm', tone: 'friendly' }
    );
    tts.playAudio(audio);
  } catch (error) {
    console.error('TTS Error:', error);
  }
}

// Example 2: Generate Nigerian male voice
async function generateNigerianMaleVoice() {
  try {
    const audio = await tts.generateSpeech(
      'This is a deep Nigerian male voice with authority and presence.',
      { voice_id: 'naija_male_deep', tone: 'bold' }
    );
    tts.downloadAudio(audio, 'nigerian_male_speech');
  } catch (error) {
    console.error('TTS Error:', error);
  }
}

// Example 3: Generate US male voice
async function generateUSMaleVoice() {
  try {
    const audio = await tts.generateSpeech(
      'This is a calm US male voice perfect for storytelling and narration.',
      { voice_id: 'us_male_story', tone: 'calm' }
    );
    tts.playAudio(audio);
  } catch (error) {
    console.error('TTS Error:', error);
  }
}
```

## 🌟 Voice Profiles

| Voice ID | Description | Best For |
|----------|-------------|----------|
| `naija_male_deep` | Nigerian male, deep & calm authority | Announcements, news, support |
| `naija_female_warm` | Nigerian female, warm & lively | Onboarding, conversational |
| `naija_female_bold` | Nigerian female, bold & confident | Ads, announcements |
| `us_male_story` | US male, calm storyteller | Explainer videos, narration |

## 🎭 Tone Options

| Tone | Description | Use Case |
|------|-------------|----------|
| `friendly` | Warm, welcoming, light Pidgin | Customer service, onboarding |
| `bold` | Confident, authoritative | Announcements, ads |
| `calm` | Steady, relaxed | Storytelling, narration |
| `sales` | Persuasive, upbeat | Marketing, promotions |
| `support` | Empathetic, reassuring | Help, customer support |
| `ads` | Catchy, punchy | Short advertisements |

## 🔧 API Endpoints

- **Health Check**: `GET /v1/health`
- **Get Voices**: `GET /v1/voices` (requires API key)
- **Generate Speech**: `POST /v1/tts` (requires API key)

## 🔐 Authentication

Use `x-api-key` header with your ODIADEV API key:
```javascript
headers: {
  'x-api-key': 'your_api_key_here'
}
```

## 📱 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

## 🚀 Production Deployment

**Base URL**: `https://tts-api.odia.dev`
**Local Development**: `http://localhost:8080`

## 💡 Pro Tips

1. **Nigerian Accent**: Automatically injected for all `naija_` voices
2. **Error Handling**: Always wrap in try-catch for production
3. **Audio Formats**: Supports mp3, wav, opus, aac, flac
4. **Speed Control**: Range 0.5x to 1.5x playback speed
5. **Language**: Optimized for Nigerian English with Pidgin support

---

**🎯 Copy the entire SDK above and paste it into your project for instant TTS integration!**
