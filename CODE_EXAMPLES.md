# ODIADEV TTS API - Code Examples

## 🚀 **Complete Code Examples for All Platforms**

This document provides ready-to-use code examples for integrating with the ODIADEV TTS API across different platforms and frameworks.

---

## 🌐 **Web Development**

### **Vanilla JavaScript**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TTS Demo</title>
</head>
<body>
    <div id="app">
        <h1>ODIADEV TTS Demo</h1>
        
        <div>
            <label for="text">Text to speak:</label>
            <textarea id="text" rows="4" cols="50" placeholder="Enter text to convert to speech..."></textarea>
        </div>
        
        <div>
            <label for="voice">Voice:</label>
            <select id="voice">
                <option value="naija_female_warm">Nigerian Female Warm</option>
                <option value="naija_male_warm">Nigerian Male Warm</option>
                <option value="naija_female_bold">Nigerian Female Bold</option>
                <option value="naija_male_deep">Nigerian Male Deep</option>
                <option value="us_female_clear">US Female Clear</option>
                <option value="us_male_story">US Male Story</option>
            </select>
        </div>
        
        <div>
            <label for="speed">Speed:</label>
            <input type="range" id="speed" min="0.5" max="1.5" step="0.1" value="1.0">
            <span id="speedValue">1.0</span>
        </div>
        
        <button id="speakBtn">Speak</button>
        <button id="stopBtn">Stop</button>
        
        <div id="status"></div>
    </div>

    <script>
        class TTSClient {
            constructor(apiKey, baseUrl) {
                this.apiKey = apiKey;
                this.baseUrl = baseUrl;
                this.currentAudio = null;
            }

            async generateSpeech(text, voiceId = 'naija_female_warm', speed = 1.0) {
                try {
                    const response = await fetch(`${this.baseUrl}/v1/tts`, {
                        method: 'POST',
                        headers: {
                            'x-api-key': this.apiKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            text: text,
                            voice_id: voiceId,
                            format: 'mp3',
                            speed: speed
                        })
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(`TTS API error: ${error.error}`);
                    }

                    return response.blob();
                } catch (error) {
                    console.error('TTS Error:', error);
                    throw error;
                }
            }

            async playSpeech(text, voiceId, speed) {
                try {
                    this.updateStatus('Generating speech...');
                    
                    const audioBlob = await this.generateSpeech(text, voiceId, speed);
                    const audioUrl = URL.createObjectURL(audioBlob);
                    
                    this.currentAudio = new Audio(audioUrl);
                    this.currentAudio.onended = () => {
                        this.updateStatus('Speech completed');
                        URL.revokeObjectURL(audioUrl);
                    };
                    
                    this.currentAudio.onerror = (error) => {
                        this.updateStatus('Error playing audio');
                        console.error('Audio playback error:', error);
                    };
                    
                    await this.currentAudio.play();
                    this.updateStatus('Playing speech...');
                    
                } catch (error) {
                    this.updateStatus(`Error: ${error.message}`);
                }
            }

            stopSpeech() {
                if (this.currentAudio) {
                    this.currentAudio.pause();
                    this.currentAudio.currentTime = 0;
                    this.updateStatus('Speech stopped');
                }
            }

            updateStatus(message) {
                document.getElementById('status').textContent = message;
            }
        }

        // Initialize TTS Client
        const ttsClient = new TTSClient('YOUR_ODIADEV_KEY', 'https://YOUR_EC2_IP');

        // Event listeners
        document.getElementById('speakBtn').addEventListener('click', async () => {
            const text = document.getElementById('text').value;
            const voice = document.getElementById('voice').value;
            const speed = parseFloat(document.getElementById('speed').value);
            
            if (!text.trim()) {
                alert('Please enter some text');
                return;
            }
            
            await ttsClient.playSpeech(text, voice, speed);
        });

        document.getElementById('stopBtn').addEventListener('click', () => {
            ttsClient.stopSpeech();
        });

        document.getElementById('speed').addEventListener('input', (e) => {
            document.getElementById('speedValue').textContent = e.target.value;
        });
    </script>
</body>
</html>
```

### **React Hook**
```jsx
import { useState, useCallback, useRef } from 'react';

export function useTTS(apiKey, baseUrl) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const generateSpeech = useCallback(async (text, voiceId = 'naija_female_warm', speed = 1.0) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${baseUrl}/v1/tts`, {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text,
                    voice_id: voiceId,
                    format: 'mp3',
                    speed
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'TTS request failed');
            }

            const audioBlob = await response.blob();
            return audioBlob;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [apiKey, baseUrl]);

    const playSpeech = useCallback(async (text, voiceId, speed) => {
        try {
            const audioBlob = await generateSpeech(text, voiceId, speed);
            const audioUrl = URL.createObjectURL(audioBlob);
            
            if (audioRef.current) {
                audioRef.current.pause();
            }
            
            audioRef.current = new Audio(audioUrl);
            audioRef.current.onended = () => {
                setIsPlaying(false);
                URL.revokeObjectURL(audioUrl);
            };
            audioRef.current.onerror = () => {
                setIsPlaying(false);
                setError('Audio playback failed');
            };
            
            await audioRef.current.play();
            setIsPlaying(true);
            
        } catch (err) {
            setError(err.message);
        }
    }, [generateSpeech]);

    const stopSpeech = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }, []);

    return {
        generateSpeech,
        playSpeech,
        stopSpeech,
        isLoading,
        error,
        isPlaying
    };
}

// Usage in component
export function TTSComponent() {
    const { playSpeech, stopSpeech, isLoading, error, isPlaying } = useTTS(
        'YOUR_ODIADEV_KEY',
        'https://YOUR_EC2_IP'
    );
    
    const [text, setText] = useState('');
    const [voice, setVoice] = useState('naija_female_warm');
    const [speed, setSpeed] = useState(1.0);

    const handleSpeak = () => {
        if (text.trim()) {
            playSpeech(text, voice, speed);
        }
    };

    return (
        <div className="tts-component">
            <h2>Text to Speech</h2>
            
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to convert to speech..."
                rows={4}
                cols={50}
            />
            
            <div>
                <label>Voice:</label>
                <select value={voice} onChange={(e) => setVoice(e.target.value)}>
                    <option value="naija_female_warm">Nigerian Female Warm</option>
                    <option value="naija_male_warm">Nigerian Male Warm</option>
                    <option value="naija_female_bold">Nigerian Female Bold</option>
                    <option value="naija_male_deep">Nigerian Male Deep</option>
                    <option value="us_female_clear">US Female Clear</option>
                    <option value="us_male_story">US Male Story</option>
                </select>
            </div>
            
            <div>
                <label>Speed: {speed}</label>
                <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                />
            </div>
            
            <div>
                <button onClick={handleSpeak} disabled={isLoading || !text.trim()}>
                    {isLoading ? 'Generating...' : 'Speak'}
                </button>
                <button onClick={stopSpeech} disabled={!isPlaying}>
                    Stop
                </button>
            </div>
            
            {error && <div className="error">Error: {error}</div>}
        </div>
    );
}
```

### **Next.js API Route**
```javascript
// pages/api/tts.js or app/api/tts/route.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { text, voice_id, speed } = req.body;
    
    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Text is required' });
    }
    
    if (text.length > 5000) {
        return res.status(400).json({ error: 'Text too long (max 5000 characters)' });
    }
    
    try {
        const response = await fetch('https://YOUR_EC2_IP/v1/tts', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.ODIADEV_TTS_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text.trim(),
                voice_id: voice_id || 'naija_female_warm',
                format: 'mp3',
                speed: speed || 1.0
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `TTS API error: ${response.status}`);
        }
        
        const audioBuffer = await response.arrayBuffer();
        
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', audioBuffer.byteLength);
        res.setHeader('Cache-Control', 'no-cache');
        
        res.send(Buffer.from(audioBuffer));
    } catch (error) {
        console.error('TTS API Error:', error);
        res.status(500).json({ error: error.message });
    }
}

// Usage in frontend
async function generateSpeech(text, voiceId, speed) {
    const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text,
            voice_id: voiceId,
            speed
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
    }
    
    return response.blob();
}
```

---

## 🐍 **Python**

### **Basic Python Client**
```python
import requests
import json
import os
from typing import Optional, Dict, Any

class TTSClient:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'x-api-key': self.api_key,
            'Content-Type': 'application/json'
        })
    
    def generate_speech(self, text: str, voice_id: str = 'naija_female_warm', 
                       speed: float = 1.0, format: str = 'mp3') -> bytes:
        """
        Generate speech from text
        
        Args:
            text: Text to convert to speech
            voice_id: Voice to use
            speed: Speech speed (0.5-1.5)
            format: Audio format (mp3, wav, opus, aac, flac)
            
        Returns:
            Audio data as bytes
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        if len(text) > 5000:
            raise ValueError("Text too long (max 5000 characters)")
        
        url = f"{self.base_url}/v1/tts"
        data = {
            'text': text.strip(),
            'voice_id': voice_id,
            'format': format,
            'speed': speed
        }
        
        try:
            response = self.session.post(url, json=data, timeout=45)
            response.raise_for_status()
            return response.content
        except requests.exceptions.RequestException as e:
            raise Exception(f"TTS API error: {e}")
    
    def save_speech(self, text: str, filename: str, voice_id: str = 'naija_female_warm',
                   speed: float = 1.0, format: str = 'mp3') -> str:
        """
        Generate speech and save to file
        
        Args:
            text: Text to convert
            filename: Output filename
            voice_id: Voice to use
            speed: Speech speed
            format: Audio format
            
        Returns:
            Path to saved file
        """
        audio_data = self.generate_speech(text, voice_id, speed, format)
        
        # Ensure file extension matches format
        if not filename.endswith(f'.{format}'):
            filename = f"{filename}.{format}"
        
        with open(filename, 'wb') as f:
            f.write(audio_data)
        
        return filename
    
    def get_voices(self) -> Dict[str, Any]:
        """Get available voices"""
        url = f"{self.base_url}/v1/voices"
        response = self.session.get(url)
        response.raise_for_status()
        return response.json()
    
    def health_check(self) -> Dict[str, Any]:
        """Check API health"""
        url = f"{self.base_url}/v1/health"
        response = self.session.get(url)
        response.raise_for_status()
        return response.json()

# Usage example
if __name__ == "__main__":
    # Initialize client
    tts = TTSClient('YOUR_ODIADEV_KEY', 'https://YOUR_EC2_IP')
    
    # Check health
    health = tts.health_check()
    print(f"API Status: {health}")
    
    # Get available voices
    voices = tts.get_voices()
    print(f"Available voices: {voices}")
    
    # Generate speech
    text = "Hello, this is a test of the ODIADEV TTS API"
    audio_data = tts.generate_speech(text, 'naija_female_warm', 1.0, 'mp3')
    
    # Save to file
    filename = tts.save_speech(text, 'test_speech', 'naija_female_warm')
    print(f"Speech saved to: {filename}")
```

### **Flask Integration**
```python
from flask import Flask, request, jsonify, send_file
import io
import os
from tts_client import TTSClient

app = Flask(__name__)

# Initialize TTS client
tts_client = TTSClient(
    api_key=os.getenv('ODIADEV_TTS_KEY'),
    base_url=os.getenv('TTS_BASE_URL', 'https://YOUR_EC2_IP')
)

@app.route('/api/tts', methods=['POST'])
def generate_tts():
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        voice_id = data.get('voice_id', 'naija_female_warm')
        speed = float(data.get('speed', 1.0))
        format = data.get('format', 'mp3')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        if len(text) > 5000:
            return jsonify({'error': 'Text too long (max 5000 characters)'}), 400
        
        # Generate speech
        audio_data = tts_client.generate_speech(text, voice_id, speed, format)
        
        # Return audio file
        audio_io = io.BytesIO(audio_data)
        audio_io.seek(0)
        
        return send_file(
            audio_io,
            mimetype=f'audio/{format}',
            as_attachment=True,
            download_name=f'speech.{format}'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/voices', methods=['GET'])
def get_voices():
    try:
        voices = tts_client.get_voices()
        return jsonify(voices)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        health = tts_client.health_check()
        return jsonify(health)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
```

---

## 🐘 **PHP**

### **Basic PHP Client**
```php
<?php
class TTSClient {
    private $apiKey;
    private $baseUrl;
    
    public function __construct($apiKey, $baseUrl) {
        $this->apiKey = $apiKey;
        $this->baseUrl = rtrim($baseUrl, '/');
    }
    
    public function generateSpeech($text, $voiceId = 'naija_female_warm', $speed = 1.0, $format = 'mp3') {
        if (empty(trim($text))) {
            throw new InvalidArgumentException('Text cannot be empty');
        }
        
        if (strlen($text) > 5000) {
            throw new InvalidArgumentException('Text too long (max 5000 characters)');
        }
        
        $url = $this->baseUrl . '/v1/tts';
        $data = [
            'text' => trim($text),
            'voice_id' => $voiceId,
            'format' => $format,
            'speed' => $speed
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'x-api-key: ' . $this->apiKey,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 45);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            throw new Exception("cURL error: $error");
        }
        
        if ($httpCode !== 200) {
            $errorData = json_decode($response, true);
            $errorMessage = $errorData['error'] ?? "HTTP error: $httpCode";
            throw new Exception("TTS API error: $errorMessage");
        }
        
        return $response;
    }
    
    public function saveSpeech($text, $filename, $voiceId = 'naija_female_warm', $speed = 1.0, $format = 'mp3') {
        $audioData = $this->generateSpeech($text, $voiceId, $speed, $format);
        
        // Ensure file extension matches format
        if (!str_ends_with($filename, ".$format")) {
            $filename .= ".$format";
        }
        
        if (file_put_contents($filename, $audioData) === false) {
            throw new Exception("Failed to save audio file");
        }
        
        return $filename;
    }
    
    public function getVoices() {
        $url = $this->baseUrl . '/v1/voices';
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'x-api-key: ' . $this->apiKey
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("Failed to get voices: HTTP $httpCode");
        }
        
        return json_decode($response, true);
    }
    
    public function healthCheck() {
        $url = $this->baseUrl . '/v1/health';
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("Health check failed: HTTP $httpCode");
        }
        
        return json_decode($response, true);
    }
}

// Usage example
try {
    $tts = new TTSClient('YOUR_ODIADEV_KEY', 'https://YOUR_EC2_IP');
    
    // Health check
    $health = $tts->healthCheck();
    echo "API Status: " . json_encode($health) . "\n";
    
    // Get voices
    $voices = $tts->getVoices();
    echo "Available voices: " . json_encode($voices) . "\n";
    
    // Generate speech
    $text = "Hello, this is a test of the ODIADEV TTS API";
    $audioData = $tts->generateSpeech($text, 'naija_female_warm', 1.0, 'mp3');
    
    // Save to file
    $filename = $tts->saveSpeech($text, 'test_speech', 'naija_female_warm');
    echo "Speech saved to: $filename\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
```

---

## 📱 **Mobile Development**

### **React Native**
```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Sound from 'react-native-sound';

const TTSComponent = () => {
    const [text, setText] = useState('');
    const [voice, setVoice] = useState('naija_female_warm');
    const [isLoading, setIsLoading] = useState(false);
    const [currentSound, setCurrentSound] = useState(null);

    const generateSpeech = async (text, voiceId) => {
        try {
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
                throw new Error(error.error || 'TTS request failed');
            }

            const audioBlob = await response.blob();
            return audioBlob;
        } catch (error) {
            throw error;
        }
    };

    const playSpeech = async () => {
        if (!text.trim()) {
            Alert.alert('Error', 'Please enter some text');
            return;
        }

        setIsLoading(true);
        try {
            const audioBlob = await generateSpeech(text, voice);
            
            // Convert blob to base64 for React Native Sound
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                const sound = new Sound(base64, Sound.MAIN_BUNDLE, (error) => {
                    if (error) {
                        console.log('Failed to load sound', error);
                        Alert.alert('Error', 'Failed to load audio');
                        return;
                    }
                    
                    sound.play((success) => {
                        if (success) {
                            console.log('Successfully finished playing');
                        } else {
                            console.log('Playback failed due to audio decoding errors');
                        }
                        sound.release();
                    });
                });
                
                setCurrentSound(sound);
            };
            reader.readAsDataURL(audioBlob);
            
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const stopSpeech = () => {
        if (currentSound) {
            currentSound.stop();
            currentSound.release();
            setCurrentSound(null);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>TTS Demo</Text>
            
            <TextInput
                style={{ 
                    borderWidth: 1, 
                    borderColor: '#ccc', 
                    padding: 10, 
                    marginBottom: 10,
                    height: 100,
                    textAlignVertical: 'top'
                }}
                value={text}
                onChangeText={setText}
                placeholder="Enter text to convert to speech..."
                multiline
            />
            
            <View style={{ marginBottom: 10 }}>
                <Text>Voice:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {[
                        { id: 'naija_female_warm', name: 'Nigerian Female Warm' },
                        { id: 'naija_male_warm', name: 'Nigerian Male Warm' },
                        { id: 'naija_female_bold', name: 'Nigerian Female Bold' },
                        { id: 'naija_male_deep', name: 'Nigerian Male Deep' },
                        { id: 'us_female_clear', name: 'US Female Clear' },
                        { id: 'us_male_story', name: 'US Male Story' }
                    ].map((voiceOption) => (
                        <TouchableOpacity
                            key={voiceOption.id}
                            style={{
                                backgroundColor: voice === voiceOption.id ? '#007AFF' : '#f0f0f0',
                                padding: 8,
                                margin: 4,
                                borderRadius: 4
                            }}
                            onPress={() => setVoice(voiceOption.id)}
                        >
                            <Text style={{ 
                                color: voice === voiceOption.id ? 'white' : 'black',
                                fontSize: 12
                            }}>
                                {voiceOption.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <TouchableOpacity
                    style={{
                        backgroundColor: '#007AFF',
                        padding: 15,
                        borderRadius: 8,
                        flex: 1,
                        marginRight: 10
                    }}
                    onPress={playSpeech}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={{ color: 'white', textAlign: 'center' }}>Speak</Text>
                    )}
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={{
                        backgroundColor: '#FF3B30',
                        padding: 15,
                        borderRadius: 8,
                        flex: 1
                    }}
                    onPress={stopSpeech}
                >
                    <Text style={{ color: 'white', textAlign: 'center' }}>Stop</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default TTSComponent;
```

---

## 🧪 **Testing Examples**

### **JavaScript Test Suite**
```javascript
// test-tts.js
class TTSTester {
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    async testHealth() {
        try {
            const response = await fetch(`${this.baseUrl}/v1/health`);
            const data = await response.json();
            console.log('✅ Health check passed:', data);
            return true;
        } catch (error) {
            console.error('❌ Health check failed:', error);
            return false;
        }
    }

    async testVoices() {
        try {
            const response = await fetch(`${this.baseUrl}/v1/voices`, {
                headers: { 'x-api-key': this.apiKey }
            });
            const data = await response.json();
            console.log('✅ Voices test passed:', data);
            return true;
        } catch (error) {
            console.error('❌ Voices test failed:', error);
            return false;
        }
    }

    async testTTS(text = 'Hello, this is a test', voiceId = 'naija_female_warm') {
        try {
            const response = await fetch(`${this.baseUrl}/v1/tts`, {
                method: 'POST',
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text,
                    voice_id: voiceId,
                    format: 'mp3',
                    speed: 1.0
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }

            const audioBlob = await response.blob();
            console.log(`✅ TTS test passed: ${audioBlob.size} bytes`);
            return audioBlob;
        } catch (error) {
            console.error('❌ TTS test failed:', error);
            return false;
        }
    }

    async testAllVoices() {
        const voices = [
            'naija_male_deep',
            'naija_male_warm',
            'naija_female_warm',
            'naija_female_bold',
            'us_male_story',
            'us_female_clear'
        ];

        console.log('Testing all voices...');
        for (const voice of voices) {
            console.log(`Testing voice: ${voice}`);
            await this.testTTS('Hello, this is a test', voice);
        }
    }

    async runAllTests() {
        console.log('Starting TTS API tests...');
        
        const healthOk = await this.testHealth();
        const voicesOk = await this.testVoices();
        const ttsOk = await this.testTTS();
        
        if (healthOk && voicesOk && ttsOk) {
            console.log('🎉 All tests passed!');
            await this.testAllVoices();
        } else {
            console.log('❌ Some tests failed');
        }
    }
}

// Usage
const tester = new TTSTester('YOUR_ODIADEV_KEY', 'https://YOUR_EC2_IP');
tester.runAllTests();
```

### **Python Test Suite**
```python
import unittest
import tempfile
import os
from tts_client import TTSClient

class TestTTSClient(unittest.TestCase):
    def setUp(self):
        self.client = TTSClient(
            api_key='YOUR_ODIADEV_KEY',
            base_url='https://YOUR_EC2_IP'
        )
    
    def test_health_check(self):
        """Test API health check"""
        health = self.client.health_check()
        self.assertTrue(health['ok'])
        self.assertIn('service', health)
    
    def test_get_voices(self):
        """Test getting available voices"""
        voices = self.client.get_voices()
        self.assertIn('voices', voices)
        self.assertGreater(len(voices['voices']), 0)
    
    def test_generate_speech(self):
        """Test basic speech generation"""
        text = "Hello, this is a test"
        audio_data = self.client.generate_speech(text)
        self.assertIsInstance(audio_data, bytes)
        self.assertGreater(len(audio_data), 0)
    
    def test_save_speech(self):
        """Test saving speech to file"""
        text = "Hello, this is a test"
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as f:
            filename = f.name
        
        try:
            result = self.client.save_speech(text, filename)
            self.assertEqual(result, filename)
            self.assertTrue(os.path.exists(filename))
            self.assertGreater(os.path.getsize(filename), 0)
        finally:
            if os.path.exists(filename):
                os.unlink(filename)
    
    def test_empty_text(self):
        """Test error handling for empty text"""
        with self.assertRaises(ValueError):
            self.client.generate_speech("")
    
    def test_long_text(self):
        """Test error handling for long text"""
        long_text = "a" * 5001
        with self.assertRaises(ValueError):
            self.client.generate_speech(long_text)
    
    def test_all_voices(self):
        """Test all available voices"""
        voices = self.client.get_voices()
        text = "Hello, this is a test"
        
        for voice in voices['voices']:
            voice_id = voice['voice_id']
            with self.subTest(voice=voice_id):
                audio_data = self.client.generate_speech(text, voice_id)
                self.assertIsInstance(audio_data, bytes)
                self.assertGreater(len(audio_data), 0)

if __name__ == '__main__':
    unittest.main()
```

---

## 🚀 **Production Examples**

### **Docker Configuration**
```dockerfile
# Dockerfile for TTS service
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  tts-service:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ODIADEV_TTS_KEY=${ODIADEV_TTS_KEY}
      - TTS_BASE_URL=${TTS_BASE_URL}
    restart: unless-stopped
```

### **Environment Configuration**
```bash
# .env
ODIADEV_TTS_KEY=your_odiadev_key_here
TTS_BASE_URL=https://YOUR_EC2_IP
NODE_ENV=production
PORT=3000
```

---

## 📊 **Performance Optimization**

### **Caching Strategy**
```javascript
class TTSCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    
    generateKey(text, voiceId, speed) {
        return `${text}_${voiceId}_${speed}`;
    }
    
    get(text, voiceId, speed) {
        const key = this.generateKey(text, voiceId, speed);
        return this.cache.get(key);
    }
    
    set(text, voiceId, speed, audioData) {
        const key = this.generateKey(text, voiceId, speed);
        
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, audioData);
    }
}

// Usage with caching
const ttsCache = new TTSCache();

async function generateSpeechWithCache(text, voiceId, speed) {
    const cached = ttsCache.get(text, voiceId, speed);
    if (cached) {
        return cached;
    }
    
    const audioData = await generateSpeech(text, voiceId, speed);
    ttsCache.set(text, voiceId, speed, audioData);
    return audioData;
}
```

---

## 🎯 **Summary**

These code examples provide complete, production-ready implementations for integrating with the ODIADEV TTS API across different platforms and frameworks. Each example includes:

- ✅ **Complete error handling**
- ✅ **Proper authentication**
- ✅ **Voice selection options**
- ✅ **Audio playback functionality**
- ✅ **Testing examples**
- ✅ **Production considerations**

Choose the example that matches your platform and customize it for your specific needs!
