# ODIADEV TTS API - Complete Documentation

## 🌐 **API Overview**

The ODIADEV TTS API provides high-quality text-to-speech conversion using OpenAI's advanced TTS models. It's designed for universal access with CORS support, making it perfect for web applications, mobile apps, and any project requiring speech synthesis.

**Base URL**: `https://YOUR_EC2_IP`

---

## 🔐 **Authentication**

All API requests require authentication via the `x-api-key` header:

```http
x-api-key: YOUR_ODIADEV_KEY
```

**API Key Format**: `tts_` or `odiadev_` followed by 32 hexadecimal characters

---

## 📡 **Endpoints**

### **1. Health Check**
```http
GET /v1/health
```

**Description**: Check API status and get basic information

**Headers**: None required

**Response**:
```json
{
  "ok": true,
  "service": "odiadev-tts-openai-proxy",
  "time": "2024-01-15T10:30:00.000Z",
  "formats": ["mp3", "wav", "opus", "aac", "flac"]
}
```

**Example**:
```bash
curl https://YOUR_EC2_IP/v1/health
```

---

### **2. Get Available Voices**
```http
GET /v1/voices
```

**Description**: Get list of available voice profiles

**Headers**:
```http
x-api-key: YOUR_ODIADEV_KEY
```

**Response**:
```json
{
  "voices": [
    {
      "voice_id": "naija_male_deep",
      "name": "Nigerian Male Deep"
    },
    {
      "voice_id": "naija_male_warm", 
      "name": "Nigerian Male Warm"
    },
    {
      "voice_id": "naija_female_warm",
      "name": "Nigerian Female Warm"
    },
    {
      "voice_id": "naija_female_bold",
      "name": "Nigerian Female Bold"
    },
    {
      "voice_id": "us_male_story",
      "name": "US Male Story"
    },
    {
      "voice_id": "us_female_clear",
      "name": "US Female Clear"
    }
  ]
}
```

**Example**:
```bash
curl -H "x-api-key: YOUR_ODIADEV_KEY" https://YOUR_EC2_IP/v1/voices
```

---

### **3. Generate Speech**
```http
POST /v1/tts
```

**Description**: Convert text to speech audio

**Headers**:
```http
x-api-key: YOUR_ODIADEV_KEY
Content-Type: application/json
```

**Request Body**:
```json
{
  "text": "Text to convert to speech",
  "voice_id": "naija_female_warm",
  "format": "mp3",
  "speed": 1.0
}
```

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | string | ✅ | - | Text to convert (max 5000 characters) |
| `voice_id` | string | ❌ | `naija_female_warm` | Voice profile to use |
| `format` | string | ❌ | `mp3` | Audio format (`mp3`, `wav`, `opus`, `aac`, `flac`) |
| `speed` | number | ❌ | `1.0` | Speech speed (0.5 - 1.5) |

**Response**:
- **Success**: Binary audio data
- **Content-Type**: `audio/mpeg` (for mp3), `audio/wav` (for wav), etc.
- **Error**: JSON with error message

**Example**:
```bash
curl -X POST https://YOUR_EC2_IP/v1/tts \
  -H "x-api-key: YOUR_ODIADEV_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, this is a test","voice_id":"naija_female_warm","format":"mp3"}' \
  --output speech.mp3
```

---

## 🎤 **Voice Profiles**

### **Nigerian Voices**

#### **naija_male_deep**
- **Description**: Nigerian male, deep & calm authority
- **Best for**: Announcements, news, support content
- **Characteristics**: Authoritative, professional, calm

#### **naija_male_warm**
- **Description**: Nigerian male, warm & friendly
- **Best for**: Conversational content, customer service
- **Characteristics**: Approachable, friendly, conversational

#### **naija_female_warm**
- **Description**: Nigerian female, warm & lively
- **Best for**: Onboarding, conversational content
- **Characteristics**: Welcoming, energetic, friendly

#### **naija_female_bold**
- **Description**: Nigerian female, bold & confident
- **Best for**: Advertisements, announcements
- **Characteristics**: Confident, bold, attention-grabbing

### **US Voices**

#### **us_male_story**
- **Description**: US male, calm storyteller
- **Best for**: Explainer videos, narration, storytelling
- **Characteristics**: Calm, engaging, narrative

#### **us_female_clear**
- **Description**: US female, clear & professional
- **Best for**: Business presentations, educational content
- **Characteristics**: Clear, professional, articulate

---

## 🎵 **Audio Formats**

| Format | MIME Type | Description | Use Case |
|--------|-----------|-------------|----------|
| `mp3` | `audio/mpeg` | Compressed, widely supported | Web, mobile, general use |
| `wav` | `audio/wav` | Uncompressed, high quality | Professional, archival |
| `opus` | `audio/ogg` | Modern, efficient compression | Web, streaming |
| `aac` | `audio/aac` | Apple standard, good quality | iOS, Apple devices |
| `flac` | `audio/flac` | Lossless compression | High-quality audio |

---

## ⚡ **Rate Limits**

- **Requests**: 60 requests per minute
- **Characters**: 300,000 characters per day
- **Text Length**: Maximum 5,000 characters per request

---

## 🚨 **Error Responses**

### **400 Bad Request**
```json
{
  "error": "text required"
}
```

```json
{
  "error": "text too long (max 5000)"
}
```

### **401 Unauthorized**
```json
{
  "error": "invalid_or_missing_api_key"
}
```

### **500 Internal Server Error**
```json
{
  "error": "OpenAI 429: Rate limit exceeded"
}
```

---

## 🌍 **CORS Support**

The API supports universal CORS with the following headers:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: x-api-key, Content-Type, Authorization, Range, X-Request-Id
Timing-Allow-Origin: *
```

**OPTIONS requests** return `204 No Content` for preflight checks.

---

## 💻 **Code Examples**

### **JavaScript (Fetch API)**
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
    const error = await response.json();
    throw new Error(`TTS API error: ${error.error}`);
  }

  return response.blob();
}

// Usage
generateSpeech('Hello, this is a test')
  .then(audioBlob => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  })
  .catch(error => console.error('TTS Error:', error));
```

### **Python (requests)**
```python
import requests
import io

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

# Usage
audio_data = generate_speech('Hello, this is a test')
with open('speech.mp3', 'wb') as f:
    f.write(audio_data)
```

### **PHP (cURL)**
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

// Usage
$audioData = generateSpeech('Hello, this is a test');
file_put_contents('speech.mp3', $audioData);
?>
```

### **React Hook**
```jsx
import { useState, useCallback } from 'react';

export function useTTS() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateSpeech = useCallback(async (text, voiceId = 'naija_female_warm') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://YOUR_EC2_IP/v1/tts', {
        method: 'POST',
        headers: {
          'x-api-key': 'YOUR_ODIADEV_KEY',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          voice_id: voiceId,
          format: 'mp3'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'TTS request failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return audioUrl;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { generateSpeech, isLoading, error };
}

// Usage in component
function TTSButton({ text }) {
  const { generateSpeech, isLoading, error } = useTTS();
  
  const handleSpeak = async () => {
    try {
      const audioUrl = await generateSpeech(text);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error('TTS Error:', err);
    }
  };

  return (
    <button onClick={handleSpeak} disabled={isLoading}>
      {isLoading ? 'Generating...' : 'Speak'}
      {error && <div className="error">{error}</div>}
    </button>
  );
}
```

---

## 🧪 **Testing**

### **Health Check**
```bash
curl https://YOUR_EC2_IP/v1/health
```

### **Voice List**
```bash
curl -H "x-api-key: YOUR_ODIADEV_KEY" https://YOUR_EC2_IP/v1/voices
```

### **Basic TTS Test**
```bash
curl -X POST https://YOUR_EC2_IP/v1/tts \
  -H "x-api-key: YOUR_ODIADEV_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, this is a test","voice_id":"naija_female_warm","format":"mp3"}' \
  --output test.mp3
```

### **JavaScript Test**
```javascript
// Test all voices
const voices = [
  'naija_male_deep',
  'naija_male_warm', 
  'naija_female_warm',
  'naija_female_bold',
  'us_male_story',
  'us_female_clear'
];

async function testAllVoices() {
  for (const voice of voices) {
    console.log(`Testing voice: ${voice}`);
    try {
      const audioBlob = await generateSpeech('Hello, this is a test', voice);
      console.log(`✅ ${voice}: ${audioBlob.size} bytes`);
    } catch (error) {
      console.error(`❌ ${voice}: ${error.message}`);
    }
  }
}
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

1. **CORS Errors**
   - ✅ API supports universal CORS
   - Check if you're using the correct endpoint

2. **Authentication Errors**
   - Verify API key format: `tts_` or `odiadev_` + 32 hex chars
   - Check header name: `x-api-key` (case sensitive)

3. **Text Length Errors**
   - Maximum 5,000 characters per request
   - Split longer texts into multiple requests

4. **Network Timeouts**
   - Implement retry logic with exponential backoff
   - Check EC2 instance status

5. **Audio Playback Issues**
   - Use correct MIME types
   - Check browser audio support
   - Verify audio format compatibility

### **Debug Mode**
```javascript
// Enable detailed logging
const DEBUG = true;

async function generateSpeech(text, voiceId) {
  if (DEBUG) {
    console.log('TTS Request:', { text: text.substring(0, 50) + '...', voiceId });
  }
  
  const response = await fetch('https://YOUR_EC2_IP/v1/tts', {
    method: 'POST',
    headers: {
      'x-api-key': 'YOUR_ODIADEV_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text, voice_id: voiceId, format: 'mp3' })
  });

  if (DEBUG) {
    console.log('TTS Response:', response.status, response.statusText);
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`TTS API error: ${error.error}`);
  }

  return response.blob();
}
```

---

## 📊 **Usage Analytics**

The API logs usage for analytics and monitoring:

- **User Key**: API key used for the request
- **Endpoint**: API endpoint accessed
- **Characters**: Number of characters processed
- **Request ID**: Unique identifier for each request
- **Timestamp**: When the request was made

---

## 🚀 **Production Considerations**

### **Performance**
- Use appropriate voice for your use case
- Consider caching for repeated content
- Implement retry logic for reliability

### **Security**
- Keep API keys secure
- Use HTTPS in production
- Monitor usage patterns

### **Scalability**
- Respect rate limits
- Implement proper error handling
- Consider load balancing for high traffic

---

## 📞 **Support**

For technical support or questions:
- Check this documentation first
- Test with the health endpoint
- Verify your API key and endpoint
- Review error messages for specific issues

The ODIADEV TTS API is designed to be reliable, fast, and easy to integrate into any project requiring high-quality text-to-speech functionality.
