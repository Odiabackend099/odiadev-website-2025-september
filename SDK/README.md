# 🎤 ODIADEV TTS SDK Collection

**Complete SDK collection for integrating Nigerian-accented Text-to-Speech into any project**

## 🚀 Quick Start

**Choose your platform and copy-paste the SDK:**

- **🌐 [JavaScript/Web](#javascript-web-sdk)** - For websites, web apps, and browsers
- **⚛️ [React/Node.js](#react-nodejs-sdk)** - For React applications and Node.js projects  
- **🐍 [Python](#python-sdk)** - For Python applications and scripts

## 🌟 Features

- ✅ **Nigerian Accent Injection** - Automatically applied to all `naija_` voices
- ✅ **4 Voice Profiles** - Nigerian male/female + US male voices
- ✅ **6 Tone Options** - friendly, bold, calm, sales, support, ads
- ✅ **5 Audio Formats** - mp3, wav, opus, aac, flac
- ✅ **Speed Control** - 0.5x to 1.5x playback speed
- ✅ **Auto-play & Download** - Built-in audio handling
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Type Safety** - Full TypeScript/Python type support

## 🎭 Voice Profiles

| Voice ID | Description | Best For |
|----------|-------------|----------|
| `naija_male_deep` | Nigerian male, deep & calm authority | Announcements, news, support |
| `naija_female_warm` | Nigerian female, warm & lively | Onboarding, conversational |
| `naija_female_bold` | Nigerian female, bold & confident | Ads, announcements |
| `us_male_story` | US male, calm storyteller | Explainer videos, narration |

## 🎨 Tone Options

| Tone | Description | Use Case |
|------|-------------|----------|
| `friendly` | Warm, welcoming, light Pidgin | Customer service, onboarding |
| `bold` | Confident, authoritative | Announcements, ads |
| `calm` | Steady, relaxed | Storytelling, narration |
| `sales` | Persuasive, upbeat | Marketing, promotions |
| `support` | Empathetic, reassuring | Help, customer support |
| `ads` | Catchy, punchy | Short advertisements |

## 🔧 API Configuration

- **Production URL**: `https://tts-api.odia.dev`
- **Local Development**: `http://localhost:8080`
- **Authentication**: `x-api-key` header
- **Rate Limit**: 120 requests per 15 minutes per IP

---

## 🌐 JavaScript/Web SDK

**Perfect for websites, web apps, and browser-based projects**

### 📥 Installation

Copy the entire SDK from `ODIADEV-TTS-SDK.md` into your project.

### 🚀 Basic Usage

```javascript
// Initialize TTS
const tts = new ODIADEVTTS('YOUR_API_KEY_HERE');

// Generate Nigerian female voice
async function generateVoice() {
  try {
    const audio = await tts.generateSpeech(
      'Welcome to our platform! This is a warm Nigerian female voice.',
      { voice_id: 'naija_female_warm', tone: 'friendly' }
    );
    
    // Auto-play the audio
    tts.playAudio(audio);
    
    // Or download it
    tts.downloadAudio(audio, 'welcome_message');
    
  } catch (error) {
    console.error('TTS Error:', error);
  }
}
```

### 🎯 Advanced Usage

```javascript
// Custom configuration
const options = {
  voice_id: 'naija_male_deep',
  format: 'wav',
  speed: 1.2,
  tone: 'bold'
};

const audio = await tts.generateSpeech('Your text here', options);
```

---

## ⚛️ React/Node.js SDK

**Complete React component with hooks and styling**

### 📥 Installation

Copy the entire SDK from `ODIADEV-TTS-React-SDK.js` into your project.

### 🚀 Basic Usage

```jsx
import { ODIADEVTTSComponent } from './ODIADEV-TTS-React-SDK';

function App() {
  return (
    <ODIADEVTTSComponent 
      apiKey="your_api_key_here" 
      baseUrl="https://tts-api.odia.dev" 
    />
  );
}
```

### 🎯 Using the Hook

```jsx
import { useODIADEVTTS } from './ODIADEV-TTS-React-SDK';

function MyComponent() {
  const { generateSpeech, playAudio, isLoading, error } = useODIADEVTTS('your_api_key');
  
  const handleGenerate = async () => {
    const audio = await generateSpeech('Your text here', {
      voice_id: 'naija_female_warm',
      tone: 'friendly'
    });
    
    playAudio(audio);
  };
  
  return (
    <button onClick={handleGenerate} disabled={isLoading}>
      {isLoading ? 'Generating...' : 'Generate Speech'}
    </button>
  );
}
```

### 🎨 Styling

Copy the CSS from `ODIADEVTTSStyles` into your stylesheet for instant beautiful UI.

---

## 🐍 Python SDK

**Full-featured Python SDK with type hints and examples**

### 📥 Installation

Copy the entire SDK from `ODIADEV-TTS-Python-SDK.py` into your project.

### 📦 Dependencies

```bash
pip install requests
```

### 🚀 Basic Usage

```python
from ODIADEV_TTS_Python_SDK import ODIADEVTTS, TTSOptions

# Initialize TTS
tts = ODIADEVTTS("your_api_key_here")

# Generate speech with default options
audio_data = tts.generate_speech(
    "Welcome to our platform! This is a warm Nigerian female voice speaking."
)

# Save and play
filename = tts.save_audio(audio_data, "welcome_speech")
tts.play_audio(audio_data)
```

### 🎯 Advanced Usage

```python
# Custom configuration
options = TTSOptions(
    voice_id="naija_male_deep",
    format="wav",
    speed=1.2,
    tone="bold"
)

audio_data = tts.generate_speech(
    "This is a deep Nigerian male voice with authority.",
    options
)

# Download with custom filename
filename = tts.download_audio(audio_data, "nigerian_male_speech", "wav")
```

### 🔍 API Information

```python
# Check API health
health = tts.check_health()
print("API Status:", health)

# Get available voices
voices = tts.get_voices()
print("Available Voices:", voices)

# List local options
print("Voices:", tts.list_voices())
print("Tones:", tts.list_tones())
print("Formats:", tts.list_formats())
```

---

## 🌍 Cross-Platform Examples

### 🔄 Batch Generation

**JavaScript:**
```javascript
const texts = [
  'Welcome with Nigerian female voice',
  'Announcement with Nigerian male voice',
  'Story with US male voice'
];

const configs = [
  { voice_id: 'naija_female_warm', tone: 'friendly' },
  { voice_id: 'naija_male_deep', tone: 'bold' },
  { voice_id: 'us_male_story', tone: 'calm' }
];

for (let i = 0; i < texts.length; i++) {
  const audio = await tts.generateSpeech(texts[i], configs[i]);
  tts.downloadAudio(audio, `sample_${i+1}`);
}
```

**Python:**
```python
texts = [
    "Welcome with Nigerian female voice",
    "Announcement with Nigerian male voice", 
    "Story with US male voice"
]

configs = [
    TTSOptions(voice_id="naija_female_warm", tone="friendly"),
    TTSOptions(voice_id="naija_male_deep", tone="bold"),
    TTSOptions(voice_id="us_male_story", tone="calm")
]

for i, (text, config) in enumerate(zip(texts, configs)):
    audio_data = tts.generate_speech(text, config)
    tts.save_audio(audio_data, f"sample_{i+1}")
```

---

## 🔐 Authentication

All SDKs use the `x-api-key` header for authentication:

```javascript
// JavaScript
headers: {
  'x-api-key': 'your_api_key_here'
}
```

```python
# Python
headers = {
    "x-api-key": "your_api_key_here"
}
```

---

## 🚀 Production Deployment

### Environment Variables

```bash
# Set your API key
export ODIADEV_API_KEY="your_api_key_here"

# Set base URL (optional, defaults to production)
export ODIADEV_TTS_URL="https://tts-api.odia.dev"
```

### Error Handling

```javascript
// JavaScript
try {
  const audio = await tts.generateSpeech(text, options);
  tts.playAudio(audio);
} catch (error) {
  console.error('TTS Error:', error);
  // Handle error gracefully
}
```

```python
# Python
try:
    audio_data = tts.generate_speech(text, options)
    tts.play_audio(audio_data)
except Exception as e:
    print(f"TTS Error: {e}")
    # Handle error gracefully
```

---

## 📱 Browser Compatibility

- ✅ **Chrome 60+**
- ✅ **Firefox 55+**
- ✅ **Safari 11+**
- ✅ **Edge 79+**

---

## 🎯 Use Cases

### 🏢 Business Applications
- **Customer Service**: Warm Nigerian voices for support
- **Marketing**: Bold, persuasive tones for ads
- **Onboarding**: Friendly voices for user guidance

### 🎓 Educational Content
- **Language Learning**: Nigerian English with Pidgin
- **Storytelling**: Calm, engaging narration
- **Explainer Videos**: Clear, authoritative delivery

### 🎮 Gaming & Entertainment
- **Character Voices**: Diverse voice profiles
- **Audio Content**: Dynamic speech generation
- **Interactive Stories**: Immersive audio experiences

---

## 🔧 Troubleshooting

### Common Issues

1. **Authentication Error (401)**
   - Check your API key is correct
   - Ensure `x-api-key` header is set

2. **Rate Limit Exceeded (429)**
   - Wait for rate limit reset (15 minutes)
   - Implement request throttling

3. **Audio Playback Issues**
   - Check browser compatibility
   - Ensure audio format is supported

4. **Network Errors**
   - Verify base URL is correct
   - Check internet connection
   - Ensure CORS is properly configured

### Debug Mode

```javascript
// JavaScript - Enable detailed logging
const tts = new ODIADEVTTS('your_api_key', 'https://tts-api.odia.dev');
console.log('Available voices:', tts.voices);
console.log('Available tones:', tts.tones);
```

```python
# Python - Enable detailed logging
import logging
logging.basicConfig(level=logging.DEBUG)

tts = ODIADEVTTS("your_api_key")
print("Available voices:", tts.list_voices())
print("Available tones:", tts.list_tones())
```

---

## 📚 Additional Resources

- **API Documentation**: [https://tts-api.odia.dev](https://tts-api.odia.dev)
- **Voice Samples**: Test all voices before production
- **Support**: Check error messages for troubleshooting

---

## 🎉 Ready to Use!

**Copy any SDK above and paste it into your project for instant TTS integration!**

The SDKs handle all the complexity:
- ✅ **Authentication** - Automatic API key handling
- ✅ **Error Handling** - Comprehensive error management  
- ✅ **Audio Processing** - Built-in play/download functions
- ✅ **Validation** - Input validation and sanitization
- ✅ **Nigerian Accents** - Automatically injected for authentic voices

**Start generating beautiful Nigerian-accented speech in minutes!** 🎤🇳🇬✨
