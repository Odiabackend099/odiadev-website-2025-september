# ODIADEV TTS SDK

🎤 **Professional Text-to-Speech SDK for Nigerian and US English Voices**

**Compatible with OpenAI TTS API format** - Drop-in replacement for ElevenLabs

## 🚀 Features

- ✅ **6 Professional Voices** - Nigerian and US English accents
- ✅ **Multiple Audio Formats** - MP3, WAV, OPUS, AAC, FLAC
- ✅ **Voice Tone Control** - Neutral, Friendly, Bold, Calm, Sales, Support, Ads
- ✅ **Automatic Retry Logic** - Built-in exponential backoff
- ✅ **Rate Limiting Protection** - Prevents API abuse
- ✅ **Input Validation** - Sanitizes and validates all inputs
- ✅ **Multi-Language Support** - Python, JavaScript, PHP
- ✅ **Production Ready** - Enterprise-grade reliability

## 🎯 Quick Start

### Python

```bash
pip install odiadev-tts
```

```python
from odiadev_tts import ODIADEVTTS, VoiceID, AudioFormat

client = ODIADEVTTS("your_api_key_here")
response = client.generate_speech(
    text="Hello Lagos! This is ODIADEV TTS speaking.",
    voice_id=VoiceID.NAIJA_FEMALE_WARM,
    format=AudioFormat.MP3,
    save_to_file="output.mp3"
)

if response.success:
    print(f"Audio saved to: {response.file_path}")
```

### JavaScript/Node.js

```bash
npm install odiadev-tts
```

```javascript
const { ODIADEVTTS, VOICE_IDS, AUDIO_FORMATS } = require('odiadev-tts');

const client = new ODIADEVTTS('your_api_key_here');
const response = await client.generateSpeech({
    text: 'Hello Lagos! This is ODIADEV TTS speaking.',
    voiceId: VOICE_IDS.NAIJA_FEMALE_WARM,
    format: AUDIO_FORMATS.MP3,
    saveTo: './output.mp3'
});

if (response.success) {
    console.log(`Audio saved to: ${response.filePath}`);
}
```

### PHP

```bash
composer require odiadev/tts-sdk
```

```php
<?php
use ODIADEV\TTS\ODIADEVTTS;

$client = new ODIADEVTTS('your_api_key_here');
$response = $client->generateSpeech([
    'text' => 'Hello Lagos! This is ODIADEV TTS speaking.',
    'voiceId' => ODIADEVTTS::VOICE_NAIJA_FEMALE_WARM,
    'format' => ODIADEVTTS::FORMAT_MP3,
    'saveTo' => './output.mp3'
]);

if ($response['success']) {
    echo "Audio saved to: " . $response['filePath'];
}
?>
```

## 🎵 Available Voices

| Voice ID | Description | Best For |
|----------|-------------|----------|
| `naija_male_deep` | Deep Nigerian male voice | Announcements, news |
| `naija_male_warm` | Warm Nigerian male voice | Conversational |
| `naija_female_warm` | Warm Nigerian female voice | Onboarding |
| `naija_female_bold` | Bold Nigerian female voice | Ads, announcements |
| `us_male_story` | US male storyteller | Explainer videos |
| `us_female_clear` | US female clear voice | Professional content |

## 🎛️ Voice Tones

- `neutral` - Natural, balanced tone
- `friendly` - Warm, welcoming tone
- `bold` - Confident, authoritative
- `calm` - Relaxed, soothing
- `sales` - Persuasive, upbeat
- `support` - Empathetic, reassuring
- `ads` - Catchy, punchy

## 📊 Audio Formats

- `mp3` - Compressed audio (recommended for web)
- `wav` - Uncompressed audio (highest quality)
- `opus` - Modern compression (good for mobile)
- `aac` - Apple compression
- `flac` - Lossless compression

## 🛡️ Error Handling

The SDK includes comprehensive error handling with automatic retry logic:

- **Network errors**: Retry up to 3 times with exponential backoff
- **Rate limiting**: Automatic wait and retry
- **Server errors**: Retry with backoff
- **Input validation**: Sanitizes and validates all inputs

## 📈 Performance Tips

1. **Use MP3 format** for web applications (smaller file size)
2. **Keep text under 1000 characters** for faster processing
3. **Cache audio files** for reuse
4. **Use batch processing** for multiple audio files

## 🔐 Security

- **API Key Protection**: Never expose API keys in client-side code
- **Input Validation**: All inputs are sanitized and validated
- **SSL/TLS**: All communications are encrypted
- **Rate Limiting**: Built-in protection against abuse

## 🤝 Support

- **Documentation**: [https://docs.odia.dev/tts](https://docs.odia.dev/tts)
- **API Reference**: [https://tts-api.odia.dev/docs](https://tts-api.odia.dev/docs)
- **GitHub Issues**: [https://github.com/odiadev/odiadev-tts-sdk/issues](https://github.com/odiadev/odiadev-tts-sdk/issues)
- **Email Support**: support@odia.dev

## 📄 License

MIT License - see LICENSE file for details.

---

**Made with ❤️ in Nigeria by ODIADEV**