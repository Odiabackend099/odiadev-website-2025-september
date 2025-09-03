// ===========================================
// ODIADEV TTS SDK - React/Node.js Version
// ===========================================
// Copy this entire file into your project!

import React, { useState, useCallback } from 'react';

// Core TTS Class
export class ODIADEVTTS {
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

// React Hook for TTS
export const useODIADEVTTS = (apiKey, baseUrl = 'https://tts-api.odia.dev') => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const tts = new ODIADEVTTS(apiKey, baseUrl);

  const generateSpeech = useCallback(async (text, options = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const audioBuffer = await tts.generateSpeech(text, options);
      const blob = new Blob([audioBuffer], { type: `audio/${options.format || 'mp3'}` });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      return audioBuffer;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tts]);

  const playAudio = useCallback((audioBuffer, format = 'mp3') => {
    return tts.playAudio(audioBuffer, format);
  }, [tts]);

  const downloadAudio = useCallback((audioBuffer, filename = 'speech', format = 'mp3') => {
    return tts.downloadAudio(audioBuffer, filename, format);
  }, [tts]);

  const getVoices = useCallback(async () => {
    try {
      return await tts.getVoices();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [tts]);

  const checkHealth = useCallback(async () => {
    try {
      return await tts.checkHealth();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [tts]);

  return {
    generateSpeech,
    playAudio,
    downloadAudio,
    getVoices,
    checkHealth,
    isLoading,
    error,
    audioUrl,
    tts
  };
};

// React Component Example
export const ODIADEVTTSComponent = ({ apiKey, baseUrl = 'https://tts-api.odia.dev' }) => {
  const [text, setText] = useState('');
  const [voiceId, setVoiceId] = useState('naija_female_warm');
  const [tone, setTone] = useState('friendly');
  const [format, setFormat] = useState('mp3');
  const [speed, setSpeed] = useState(1.0);

  const {
    generateSpeech,
    playAudio,
    downloadAudio,
    isLoading,
    error,
    audioUrl
  } = useODIADEVTTS(apiKey, baseUrl);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    try {
      const audioBuffer = await generateSpeech(text, {
        voice_id: voiceId,
        tone,
        format,
        speed
      });
      
      // Auto-play the generated audio
      playAudio(audioBuffer, format);
    } catch (err) {
      console.error('TTS Error:', err);
    }
  };

  const handleDownload = async () => {
    if (!text.trim()) return;
    
    try {
      const audioBuffer = await generateSpeech(text, {
        voice_id: voiceId,
        tone,
        format,
        speed
      });
      
      downloadAudio(audioBuffer, `speech_${voiceId}`, format);
    } catch (err) {
      console.error('TTS Error:', err);
    }
  };

  return (
    <div className="odiadev-tts-component">
      <h2>🎤 ODIADEV TTS Generator</h2>
      
      <div className="input-group">
        <label>Text to Speech:</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech..."
          rows={4}
        />
      </div>

      <div className="controls">
        <div className="control-group">
          <label>Voice:</label>
          <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
            <option value="naija_male_deep">Nigerian Male Deep</option>
            <option value="naija_female_warm">Nigerian Female Warm</option>
            <option value="naija_female_bold">Nigerian Female Bold</option>
            <option value="us_male_story">US Male Story</option>
          </select>
        </div>

        <div className="control-group">
          <label>Tone:</label>
          <select value={tone} onChange={(e) => setTone(e.target.value)}>
            <option value="friendly">Friendly</option>
            <option value="bold">Bold</option>
            <option value="calm">Calm</option>
            <option value="sales">Sales</option>
            <option value="support">Support</option>
            <option value="ads">Ads</option>
          </select>
        </div>

        <div className="control-group">
          <label>Format:</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="mp3">MP3</option>
            <option value="wav">WAV</option>
            <option value="opus">OPUS</option>
            <option value="aac">AAC</option>
            <option value="flac">FLAC</option>
          </select>
        </div>

        <div className="control-group">
          <label>Speed:</label>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
          <span>{speed}x</span>
        </div>
      </div>

      <div className="actions">
        <button 
          onClick={handleGenerate} 
          disabled={isLoading || !text.trim()}
          className="generate-btn"
        >
          {isLoading ? 'Generating...' : '🎵 Generate & Play'}
        </button>
        
        <button 
          onClick={handleDownload} 
          disabled={isLoading || !text.trim()}
          className="download-btn"
        >
          💾 Download Audio
        </button>
      </div>

      {error && <div className="error">Error: {error}</div>}
      
      {audioUrl && (
        <div className="audio-player">
          <h3>Generated Audio:</h3>
          <audio controls src={audioUrl} />
        </div>
      )}
    </div>
  );
};

// CSS Styles (copy into your CSS file)
export const ODIADEVTTSStyles = `
.odiadev-tts-component {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.odiadev-tts-component h2 {
  color: #333;
  text-align: center;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

.input-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
  transition: border-color 0.3s;
}

.input-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
}

.control-group label {
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

.control-group select,
.control-group input {
  padding: 8px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
}

.generate-btn,
.download-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.generate-btn {
  background: #007bff;
  color: white;
}

.generate-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-2px);
}

.download-btn {
  background: #28a745;
  color: white;
}

.download-btn:hover:not(:disabled) {
  background: #1e7e34;
  transform: translateY(-2px);
}

.generate-btn:disabled,
.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 15px;
  text-align: center;
}

.audio-player {
  margin-top: 20px;
  text-align: center;
}

.audio-player h3 {
  color: #333;
  margin-bottom: 10px;
}

.audio-player audio {
  width: 100%;
  max-width: 400px;
}
`;

// Usage Example:
// import { ODIADEVTTSComponent, useODIADEVTTS } from './ODIADEV-TTS-React-SDK';
// 
// function App() {
//   return (
//     <ODIADEVTTSComponent 
//       apiKey="your_api_key_here" 
//       baseUrl="https://tts-api.odia.dev" 
//     />
//   );
// }
