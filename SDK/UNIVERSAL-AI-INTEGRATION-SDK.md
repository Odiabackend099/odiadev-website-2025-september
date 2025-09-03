# 🎤 ODIADEV TTS - UNIVERSAL AI INTEGRATION SDK

**Copy this entire document and give it to ANY AI assistant. They will instantly understand how to integrate Nigerian-accented TTS into any project.**

---

## 🚀 **QUICK START FOR AI ASSISTANTS**

**Hey AI! Here's everything you need to integrate ODIADEV TTS into any project:**

### **1. API ENDPOINTS & AUTHENTICATION**
```javascript
// Base URL
const BASE_URL = "https://tts-api.odia.dev";

// Authentication (REQUIRED for TTS endpoints)
const headers = {
  "Content-Type": "application/json",
  "x-api-key": "YOUR_ODIADEV_API_KEY_HERE"
};
```

### **2. CORE TTS ENDPOINT**
```javascript
// Generate speech with Nigerian accent injection
POST ${BASE_URL}/v1/tts
Headers: x-api-key required
Body: {
  "text": "Your text here (1-5000 characters)",
  "voice_id": "naija_female_warm", // See voice options below
  "tone": "friendly",              // See tone options below
  "format": "mp3",                 // mp3, wav, opus, aac, flac
  "speed": 1.0,                   // 0.5 to 1.5
  "lang": "en-NG"                 // Nigerian English
}
```

---

## 🎭 **VOICE PROFILES (Dynamic Selection)**

| Voice ID | Description | Best For |
|----------|-------------|----------|
| `naija_male_deep` | Nigerian male, deep & calm authority | Announcements, news, support |
| `naija_female_warm` | Nigerian female, warm & lively | Onboarding, conversational |
| `naija_female_bold` | Nigerian female, bold & confident | Ads, announcements |
| `us_male_story` | US male, calm storyteller | Explainer videos, narration |

---

## 🎨 **TONE OPTIONS (Dynamic Control)**

| Tone | Description | Use Case |
|------|-------------|----------|
| `friendly` | Warm, welcoming, light Pidgin | Customer service, onboarding |
| `bold` | Confident, authoritative | Announcements, ads |
| `calm` | Steady, relaxed | Storytelling, narration |
| `sales` | Persuasive, upbeat | Marketing, promotions |
| `support` | Empathetic, reassuring | Help, customer support |
| `ads` | Catchy, punchy | Short advertisements |

---

## 🔧 **PROJECT INTEGRATION TEMPLATES**

### **🌐 Web/JavaScript Project**
```javascript
class ODIADEVTTS {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://tts-api.odia.dev";
  }

  async generateSpeech(text, options = {}) {
    const {
      voice_id = "naija_female_warm",
      tone = "friendly",
      format = "mp3",
      speed = 1.0
    } = options;

    const response = await fetch(`${this.baseUrl}/v1/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey
      },
      body: JSON.stringify({
        text,
        voice_id,
        tone,
        format,
        speed,
        lang: "en-NG"
      })
    });

    if (!response.ok) {
      throw new Error(`TTS failed: ${response.status}`);
    }

    return await response.arrayBuffer();
  }

  // Play audio in browser
  playAudio(audioBuffer, format = "mp3") {
    const blob = new Blob([audioBuffer], { type: `audio/${format}` });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
    return audio;
  }
}

// Usage
const tts = new ODIADEVTTS("YOUR_API_KEY");
const audio = await tts.generateSpeech("Hello from Nigeria!", {
  voice_id: "naija_female_warm",
  tone: "friendly"
});
tts.playAudio(audio);
```

### **⚛️ React Project**
```jsx
import React, { useState } from 'react';

function TTSSpeechGenerator({ apiKey }) {
  const [text, setText] = useState('');
  const [voiceId, setVoiceId] = useState('naija_female_warm');
  const [tone, setTone] = useState('friendly');
  const [isLoading, setIsLoading] = useState(false);

  const generateSpeech = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://tts-api.odia.dev/v1/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          text,
          voice_id: voiceId,
          tone,
          format: 'mp3',
          speed: 1.0,
          lang: 'en-NG'
        })
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        const blob = new Blob([audioBuffer], { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
      }
    } catch (error) {
      console.error('TTS Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to convert to Nigerian-accented speech..."
      />
      
      <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
        <option value="naija_male_deep">Nigerian Male Deep</option>
        <option value="naija_female_warm">Nigerian Female Warm</option>
        <option value="naija_female_bold">Nigerian Female Bold</option>
        <option value="us_male_story">US Male Story</option>
      </select>

      <select value={tone} onChange={(e) => setTone(e.target.value)}>
        <option value="friendly">Friendly</option>
        <option value="bold">Bold</option>
        <option value="calm">Calm</option>
        <option value="sales">Sales</option>
        <option value="support">Support</option>
        <option value="ads">Ads</option>
      </select>

      <button onClick={generateSpeech} disabled={isLoading || !text}>
        {isLoading ? 'Generating...' : '🎤 Generate Nigerian Speech'}
      </button>
    </div>
  );
}
```

### **🐍 Python Project**
```python
import requests
import tempfile
import os
import platform
import subprocess

class ODIADEVTTS:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://tts-api.odia.dev"
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": api_key
        }

    def generate_speech(self, text, voice_id="naija_female_warm", 
                       tone="friendly", format="mp3", speed=1.0):
        payload = {
            "text": text,
            "voice_id": voice_id,
            "tone": tone,
            "format": format,
            "speed": speed,
            "lang": "en-NG"
        }

        response = requests.post(
            f"{self.base_url}/v1/tts",
            headers=self.headers,
            json=payload
        )

        if response.status_code == 200:
            return response.content
        else:
            raise Exception(f"TTS failed: {response.status_code}")

    def play_audio(self, audio_data, format="mp3"):
        with tempfile.NamedTemporaryFile(suffix=f".{format}", delete=False) as f:
            f.write(audio_data)
            temp_path = f.name

        system = platform.system().lower()
        if system == "darwin":  # macOS
            subprocess.run(["open", temp_path])
        elif system == "linux":
            subprocess.run(["xdg-open", temp_path])
        elif system == "windows":
            os.startfile(temp_path)

# Usage
tts = ODIADEVTTS("YOUR_API_KEY")
audio = tts.generate_speech(
    "Welcome to our Nigerian tech platform!",
    voice_id="naija_female_warm",
    tone="friendly"
)
tts.play_audio(audio)
```

### **📱 React Native/Mobile Project**
```javascript
import { Audio } from 'expo-av';

class MobileTTSService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://tts-api.odia.dev";
  }

  async generateAndPlaySpeech(text, options = {}) {
    const {
      voice_id = "naija_female_warm",
      tone = "friendly",
      format = "mp3"
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/v1/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey
        },
        body: JSON.stringify({
          text,
          voice_id,
          tone,
          format,
          speed: 1.0,
          lang: "en-NG"
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
        await sound.playAsync();
        
        return sound;
      }
    } catch (error) {
      console.error("TTS Error:", error);
    }
  }
}

// Usage
const tts = new MobileTTSService("YOUR_API_KEY");
tts.generateAndPlaySpeech("Hello from Nigeria!", {
  voice_id: "naija_female_warm",
  tone: "friendly"
});
```

### **🔧 Node.js/Backend Project**
```javascript
const axios = require('axios');
const fs = require('fs');

class BackendTTSService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://tts-api.odia.dev";
  }

  async generateSpeech(text, options = {}) {
    const {
      voice_id = "naija_female_warm",
      tone = "friendly",
      format = "mp3",
      speed = 1.0
    } = options;

    try {
      const response = await axios.post(`${this.baseUrl}/v1/tts`, {
        text,
        voice_id,
        tone,
        format,
        speed,
        lang: "en-NG"
      }, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey
        },
        responseType: 'arraybuffer'
      });

      return response.data;
    } catch (error) {
      throw new Error(`TTS generation failed: ${error.message}`);
    }
  }

  async saveAudioToFile(audioBuffer, filename, format = "mp3") {
    const filePath = `${filename}.${format}`;
    fs.writeFileSync(filePath, audioBuffer);
    return filePath;
  }
}

// Usage
const tts = new BackendTTSService("YOUR_API_KEY");
const audioBuffer = await tts.generateSpeech(
  "Welcome to our Nigerian tech platform!",
  { voice_id: "naija_female_warm", tone: "friendly" }
);
const filePath = await tts.saveAudioToFile(audioBuffer, "welcome_message");
```

---

## 🎯 **COMMON USE CASES & EXAMPLES**

### **1. Customer Welcome Message**
```javascript
const welcomeText = "Welcome to our platform! We're excited to have you here. Our Nigerian team is ready to help you succeed. *laughs* Let's make something amazing together!";

const audio = await tts.generateSpeech(welcomeText, {
  voice_id: "naija_female_warm",
  tone: "friendly"
});
```

### **2. Product Announcement**
```javascript
const announcementText = "Breaking news! ODIADEV is launching revolutionary new features. We're bringing Nigerian innovation to the global stage. This is just the beginning!";

const audio = await tts.generateSpeech(announcementText, {
  voice_id: "naija_male_deep",
  tone: "bold"
});
```

### **3. Sales Pitch**
```javascript
const salesText = "Are you ready to transform your business? Our Nigerian-powered solutions are changing the game. Don't miss out on this opportunity!";

const audio = await tts.generateSpeech(salesText, {
  voice_id: "naija_female_bold",
  tone: "sales"
});
```

---

## ⚠️ **ERROR HANDLING & BEST PRACTICES**

### **1. Always Handle Errors**
```javascript
try {
  const audio = await tts.generateSpeech(text, options);
  // Success - play audio
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Invalid API key');
  } else if (error.message.includes('429')) {
    console.error('Rate limit exceeded - wait 15 minutes');
  } else {
    console.error('TTS generation failed:', error.message);
  }
}
```

### **2. Validate Input**
```javascript
if (!text || text.length > 5000) {
  throw new Error('Text must be 1-5000 characters');
}

if (!['naija_male_deep', 'naija_female_warm', 'naija_female_bold', 'us_male_story'].includes(voice_id)) {
  throw new Error('Invalid voice_id');
}
```

### **3. Rate Limiting**
```javascript
// ODIADEV TTS allows 120 requests per 15 minutes per IP
// Implement client-side throttling for production apps
```

---

## 🔐 **AUTHENTICATION & SECURITY**

### **1. API Key Management**
```javascript
// Store API key securely
const API_KEY = process.env.ODIADEV_API_KEY || "your_api_key_here";

// Never expose API key in client-side code for production
// Use backend proxy for web apps
```

### **2. CORS & Origins**
```javascript
// Allowed origins for web apps:
// - https://*.odia.dev
// - https://*.odiadev.com
// - http://localhost:3000
// - http://localhost:5173
```

---

## 📱 **BROWSER COMPATIBILITY**

- ✅ **Chrome 60+**
- ✅ **Firefox 55+**
- ✅ **Safari 11+**
- ✅ **Edge 79+**
- ✅ **Mobile browsers**

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **For AI Assistants Building Projects:**

1. **✅ Copy the appropriate template above**
2. **✅ Replace `YOUR_API_KEY` with actual ODIADEV API key**
3. **✅ Test with a simple text first**
4. **✅ Implement error handling**
5. **✅ Add loading states for better UX**
6. **✅ Test on target platforms**

### **Environment Variables:**
```bash
# Set in your project
ODIADEV_API_KEY=your_actual_api_key_here
ODIADEV_TTS_URL=https://tts-api.odia.dev
```

---

## 🎉 **YOU'RE READY TO BUILD!**

**AI Assistant, you now have everything needed to integrate ODIADEV TTS into any project:**

- ✅ **API endpoints & authentication**
- ✅ **Voice profiles & tone options**
- ✅ **Code templates for all platforms**
- ✅ **Error handling & best practices**
- ✅ **Real-world examples**

**Just copy the template you need and start building! The Nigerian-accented TTS will work instantly.** 🎤🇳🇬✨

---

## 📞 **SUPPORT & RESOURCES**

- **API Base URL**: `https://tts-api.odia.dev`
- **Health Check**: `GET /v1/health`
- **Voice List**: `GET /v1/voices` (requires API key)
- **Documentation**: See main README.md for detailed SDKs

**Questions? The AI assistant can now build anything with this information!** 🚀
