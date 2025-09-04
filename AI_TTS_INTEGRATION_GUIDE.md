# ODIADEV TTS API - AI Integration Guide

## 🎯 **For AI Assistants: Complete TTS Integration Instructions**

This guide provides everything an AI assistant needs to help users integrate with the ODIADEV TTS API.

---

## 📋 **Quick Reference**

### **API Endpoint**
```
https://YOUR_EC2_IP/v1/tts
```

### **Authentication**
```
Header: x-api-key: YOUR_ODIADEV_KEY
```

### **Available Voice IDs**
- `naija_male_deep` - Nigerian male, deep & calm authority
- `naija_male_warm` - Nigerian male, warm & friendly  
- `naija_female_warm` - Nigerian female, warm & lively
- `naija_female_bold` - Nigerian female, bold & confident
- `us_male_story` - US male, calm storyteller
- `us_female_clear` - US female, clear & professional

### **Supported Formats**
- `mp3` (default)
- `wav`
- `opus`
- `aac`
- `flac`

---

## 🤖 **AI Assistant Instructions**

### **When User Asks for TTS Integration:**

1. **Always provide the complete API endpoint and authentication method**
2. **Show code examples for their specific platform/framework**
3. **Include error handling and retry logic**
4. **Explain voice selection based on use case**
5. **Provide testing examples**

### **Key Integration Points:**

#### **1. Authentication Setup**
```javascript
const headers = {
  'x-api-key': 'YOUR_ODIADEV_KEY',
  'Content-Type': 'application/json'
};
```

#### **2. Request Body Structure**
```json
{
  "text": "Text to convert to speech",
  "voice_id": "naija_female_warm",
  "format": "mp3",
  "speed": 1.0
}
```

#### **3. Response Handling**
- Success: Binary audio data
- Error: JSON with error message
- Content-Type: `audio/mpeg` (for mp3)

---

## 💻 **Platform-Specific Examples**

### **JavaScript/Node.js**
```javascript
async function generateSpeech(text, voiceId = 'naija_female_warm') {
  const response = await fetch('https://YOUR_EC2_IP/v1/tts', {
    method: 'POST',
    headers: {
      'x-api-key': 'YOUR_ODIADEV_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      voice_id: voiceId,
      format: 'mp3',
      speed: 1.0
    })
  });

  if (!response.ok) {
    throw new Error(`TTS API error: ${response.status}`);
  }

  return response.blob();
}
```

### **Python**
```python
import requests

def generate_speech(text, voice_id='naija_female_warm'):
    url = 'https://YOUR_EC2_IP/v1/tts'
    headers = {
        'x-api-key': 'YOUR_ODIADEV_KEY',
        'Content-Type': 'application/json'
    }
    data = {
        'text': text,
        'voice_id': voice_id,
        'format': 'mp3',
        'speed': 1.0
    }
    
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    
    return response.content
```

### **React/Next.js**
```jsx
import { useState } from 'react';

export default function TTSComponent() {
  const [isLoading, setIsLoading] = useState(false);
  
  const generateSpeech = async (text, voiceId = 'naija_female_warm') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tts-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice_id: voiceId })
      });
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('TTS Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button 
      onClick={() => generateSpeech('Hello, this is a test')}
      disabled={isLoading}
    >
      {isLoading ? 'Generating...' : 'Play Speech'}
    </button>
  );
}
```

### **PHP**
```php
<?php
function generateSpeech($text, $voiceId = 'naija_female_warm') {
    $url = 'https://YOUR_EC2_IP/v1/tts';
    $headers = [
        'x-api-key: YOUR_ODIADEV_KEY',
        'Content-Type: application/json'
    ];
    $data = [
        'text' => $text,
        'voice_id' => $voiceId,
        'format' => 'mp3',
        'speed' => 1.0
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception("TTS API error: $httpCode");
    }
    
    return $response;
}
?>
```

---

## 🎨 **Voice Selection Guide**

### **For AI to Recommend Voices:**

#### **Business/Professional Content**
- `us_female_clear` - Clear, professional presentations
- `naija_female_bold` - Confident announcements

#### **Conversational/Onboarding**
- `naija_female_warm` - Friendly, welcoming tone
- `naija_male_warm` - Conversational, approachable

#### **Storytelling/Narration**
- `us_male_story` - Calm, engaging storytelling
- `naija_male_deep` - Authoritative narration

#### **News/Announcements**
- `naija_male_deep` - Deep, authoritative voice
- `naija_female_bold` - Bold, confident delivery

---

## 🔧 **Error Handling**

### **Common Errors & Solutions**

#### **401 Unauthorized**
```javascript
// Check API key
if (response.status === 401) {
  throw new Error('Invalid or missing API key');
}
```

#### **400 Bad Request**
```javascript
// Check text length and format
if (response.status === 400) {
  const error = await response.json();
  throw new Error(`Invalid request: ${error.error}`);
}
```

#### **Network Issues**
```javascript
// Implement retry logic
async function generateSpeechWithRetry(text, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateSpeech(text);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

## 🧪 **Testing Examples**

### **Health Check**
```bash
curl https://YOUR_EC2_IP/v1/health
```

### **Basic TTS Test**
```bash
curl -X POST https://YOUR_EC2_IP/v1/tts \
  -H 'x-api-key: YOUR_ODIADEV_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"text":"Hello, this is a test","voice_id":"naija_female_warm","format":"mp3"}' \
  --output test.mp3
```

### **JavaScript Test**
```javascript
// Test function
async function testTTS() {
  try {
    const audioBlob = await generateSpeech('Hello, this is a test of the TTS system');
    console.log('TTS Success:', audioBlob.size, 'bytes');
    
    // Play the audio
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (error) {
    console.error('TTS Test Failed:', error);
  }
}
```

---

## 📱 **Framework-Specific Integration**

### **Lovable.ai Integration**
```javascript
// For Lovable projects
export const ttsConfig = {
  apiUrl: 'https://YOUR_EC2_IP/v1/tts',
  apiKey: 'YOUR_ODIADEV_KEY',
  defaultVoice: 'naija_female_warm'
};

export async function speakText(text, voiceId = ttsConfig.defaultVoice) {
  const response = await fetch(ttsConfig.apiUrl, {
    method: 'POST',
    headers: {
      'x-api-key': ttsConfig.apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      voice_id: voiceId,
      format: 'mp3'
    })
  });
  
  if (!response.ok) {
    throw new Error(`TTS failed: ${response.status}`);
  }
  
  return response.blob();
}
```

### **Vercel/Next.js API Route**
```javascript
// pages/api/tts.js or app/api/tts/route.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { text, voice_id } = req.body;
  
  try {
    const response = await fetch('https://YOUR_EC2_IP/v1/tts', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ODIADEV_TTS_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        voice_id: voice_id || 'naija_female_warm',
        format: 'mp3'
      })
    });
    
    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`);
    }
    
    const audioBuffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

## 🚀 **Deployment Checklist**

### **For AI to Verify Integration:**

1. ✅ **API Endpoint** - Correct EC2 IP address
2. ✅ **Authentication** - Valid ODIADEV API key
3. ✅ **CORS** - API supports universal CORS
4. ✅ **Error Handling** - Proper error handling implemented
5. ✅ **Voice Selection** - Appropriate voice for use case
6. ✅ **Format Support** - Correct audio format
7. ✅ **Testing** - Health check and TTS test working

---

## 📞 **Support Information**

### **For AI to Provide to Users:**

- **API Documentation**: This guide
- **Health Check**: `GET /v1/health`
- **Voice List**: `GET /v1/voices` (requires API key)
- **Rate Limits**: 60 requests/minute, 300k characters/day
- **Max Text Length**: 5000 characters
- **Supported Languages**: English (en-NG, en-US)

### **Common Issues:**
1. **CORS Errors** - API supports universal CORS
2. **Authentication** - Use `x-api-key` header
3. **Text Length** - Max 5000 characters
4. **Network Timeouts** - Implement retry logic
5. **Audio Playback** - Use proper MIME types

---

## 🎯 **AI Assistant Summary**

**When helping users integrate TTS:**

1. **Always provide the complete API endpoint and authentication**
2. **Show platform-specific code examples**
3. **Include proper error handling**
4. **Recommend appropriate voices for their use case**
5. **Provide testing examples**
6. **Explain CORS and universal access**
7. **Include retry logic for reliability**

**Key Points to Emphasize:**
- ✅ Universal CORS support (works from any domain)
- ✅ 6 high-quality voice options
- ✅ 5 audio format options
- ✅ Simple API with clear documentation
- ✅ Reliable with retry logic built-in
- ✅ Ready for production use

This TTS API is designed to be **universally accessible** and **easy to integrate** into any project, from simple websites to complex applications.
