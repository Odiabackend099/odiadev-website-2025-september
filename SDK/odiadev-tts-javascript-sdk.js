/**
 * ODIADEV TTS JavaScript/Node.js SDK
 * Professional Text-to-Speech SDK for Nigerian and US English Voices
 * Compatible with OpenAI TTS API format
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Voice IDs
const VOICE_IDS = {
    NAIJA_MALE_DEEP: 'naija_male_deep',
    NAIJA_MALE_WARM: 'naija_male_warm',
    NAIJA_FEMALE_WARM: 'naija_female_warm',
    NAIJA_FEMALE_BOLD: 'naija_female_bold',
    US_MALE_STORY: 'us_male_story',
    US_FEMALE_CLEAR: 'us_female_clear'
};

// Audio formats
const AUDIO_FORMATS = {
    MP3: 'mp3',
    WAV: 'wav',
    OPUS: 'opus',
    AAC: 'aac',
    FLAC: 'flac'
};

// Voice tones
const TONES = {
    NEUTRAL: 'neutral',
    FRIENDLY: 'friendly',
    BOLD: 'bold',
    CALM: 'calm',
    SALES: 'sales',
    SUPPORT: 'support',
    ADS: 'ads'
};

/**
 * ODIADEV TTS Client Class
 */
class ODIADEVTTS {
    /**
     * Initialize ODIADEV TTS Client
     * @param {string} apiKey - Your ODIADEV API key
     * @param {Object} options - Configuration options
     */
    constructor(apiKey, options = {}) {
        this.apiKey = apiKey;
        this.baseUrl = options.baseUrl || 'https://tts-api.odia.dev';
        this.timeout = options.timeout || 30000;
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000;
        this.rateLimitDelay = options.rateLimitDelay || 100;
        this.validateSSL = options.validateSSL !== false;
        
        // Validate API key
        this._validateApiKey();
        
        // Test connection
        this._testConnection();
    }
    
    /**
     * Validate API key format
     * @private
     */
    _validateApiKey() {
        if (!this.apiKey || this.apiKey.length < 20) {
            throw new Error('Invalid API key format. API key must be at least 20 characters long.');
        }
        
        if (!this.apiKey.startsWith('odiadev_')) {
            console.warn('API key doesn\'t start with \'odiadev_\' - this might not be a valid ODIADEV key');
        }
    }
    
    /**
     * Test API connection
     * @private
     */
    async _testConnection() {
        try {
            const health = await this.getHealth();
            console.log(`Connected to ODIADEV TTS: ${health.brand || 'Unknown'}`);
        } catch (error) {
            console.error(`Failed to connect to ODIADEV TTS API: ${error.message}`);
            throw new Error(`Cannot connect to ODIADEV TTS API: ${error.message}`);
        }
    }
    
    /**
     * Sanitize input text
     * @private
     */
    _sanitizeText(text) {
        if (!text || typeof text !== 'string') {
            throw new Error('Text must be a non-empty string');
        }
        
        let sanitized = text.trim();
        if (sanitized.length === 0) {
            throw new Error('Text cannot be empty after sanitization');
        }
        
        // Limit length
        if (sanitized.length > 5000) {
            sanitized = sanitized.substring(0, 5000);
            console.warn('Text truncated to 5000 characters');
        }
        
        return sanitized;
    }
    
    /**
     * Validate voice ID
     * @private
     */
    _validateVoiceId(voiceId) {
        const validVoices = Object.values(VOICE_IDS);
        if (!validVoices.includes(voiceId)) {
            console.warn(`Invalid voice_id '${voiceId}', using default 'naija_female_warm'`);
            return VOICE_IDS.NAIJA_FEMALE_WARM;
        }
        return voiceId;
    }
    
    /**
     * Validate audio format
     * @private
     */
    _validateFormat(format) {
        const validFormats = Object.values(AUDIO_FORMATS);
        if (!validFormats.includes(format)) {
            console.warn(`Invalid format '${format}', using default 'mp3'`);
            return AUDIO_FORMATS.MP3;
        }
        return format;
    }
    
    /**
     * Validate speed parameter
     * @private
     */
    _validateSpeed(speed) {
        if (typeof speed !== 'number') {
            speed = 1.0;
        }
        
        if (speed < 0.5 || speed > 1.5) {
            console.warn(`Speed ${speed} out of range [0.5, 1.5], clamping to valid range`);
            speed = Math.max(0.5, Math.min(1.5, speed));
        }
        
        return speed;
    }
    
    /**
     * Make HTTP request with retry logic
     * @private
     */
    async _makeRequest(requestData, retryCount = 0) {
        return new Promise((resolve, reject) => {
            const url = new URL(`${this.baseUrl}/v1/tts`);
            const postData = JSON.stringify(requestData);
            
            const options = {
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 443 : 80),
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                    'x-api-key': this.apiKey,
                    'User-Agent': 'ODIADEV-TTS-JavaScript-SDK/1.0.0'
                },
                timeout: this.timeout
            };
            
            if (url.protocol === 'https:' && !this.validateSSL) {
                options.rejectUnauthorized = false;
            }
            
            const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
                let data = Buffer.alloc(0);
                
                res.on('data', (chunk) => {
                    data = Buffer.concat([data, chunk]);
                });
                
                res.on('end', () => {
                    if (res.statusCode === 429) {
                        if (retryCount < this.maxRetries) {
                            const retryAfter = parseInt(res.headers['retry-after'] || '60') * 1000;
                            console.warn(`Rate limited, retrying after ${retryAfter}ms`);
                            setTimeout(() => {
                                this._makeRequest(requestData, retryCount + 1)
                                    .then(resolve)
                                    .catch(reject);
                            }, retryAfter);
                            return;
                        } else {
                            reject(new Error('Rate limit exceeded, max retries reached'));
                            return;
                        }
                    }
                    
                    if (res.statusCode >= 500 && retryCount < this.maxRetries) {
                        console.warn(`Server error ${res.statusCode}, retrying (${retryCount + 1}/${this.maxRetries})`);
                        setTimeout(() => {
                            this._makeRequest(requestData, retryCount + 1)
                                .then(resolve)
                                .catch(reject);
                        }, this.retryDelay * Math.pow(2, retryCount));
                        return;
                    }
                    
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(data);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                if (retryCount < this.maxRetries) {
                    console.warn(`Request error, retrying (${retryCount + 1}/${this.maxRetries}): ${error.message}`);
                    setTimeout(() => {
                        this._makeRequest(requestData, retryCount + 1)
                            .then(resolve)
                            .catch(reject);
                    }, this.retryDelay * Math.pow(2, retryCount));
                } else {
                    reject(error);
                }
            });
            
            req.on('timeout', () => {
                req.destroy();
                if (retryCount < this.maxRetries) {
                    console.warn(`Request timeout, retrying (${retryCount + 1}/${this.maxRetries})`);
                    setTimeout(() => {
                        this._makeRequest(requestData, retryCount + 1)
                            .then(resolve)
                            .catch(reject);
                    }, this.retryDelay * Math.pow(2, retryCount));
                } else {
                    reject(new Error('Request timeout after max retries'));
                }
            });
            
            req.write(postData);
            req.end();
        });
    }
    
    /**
     * Generate speech from text
     * @param {Object} options - TTS options
     * @returns {Promise<Object>} TTS response
     */
    async generateSpeech(options = {}) {
        const startTime = Date.now();
        const requestId = uuidv4();
        
        try {
            // Validate and sanitize inputs
            const text = this._sanitizeText(options.text);
            const voiceId = this._validateVoiceId(options.voiceId || VOICE_IDS.NAIJA_FEMALE_WARM);
            const format = this._validateFormat(options.format || AUDIO_FORMATS.MP3);
            const speed = this._validateSpeed(options.speed || 1.0);
            const tone = options.tone || TONES.NEUTRAL;
            const language = options.language || 'en-NG';
            
            // Prepare request
            const requestData = {
                text: text,
                voice_id: voiceId,
                format: format,
                speed: speed,
                tone: tone,
                lang: language
            };
            
            console.log(`Generating speech for voice: ${voiceId}, format: ${format}, length: ${text.length} chars`);
            
            // Make request
            const audioData = await this._makeRequest(requestData);
            const processingTime = Date.now() - startTime;
            
            // Save to file if requested
            let filePath = null;
            if (options.saveTo) {
                filePath = await this._saveAudio(audioData, options.saveTo, format);
            }
            
            return {
                success: true,
                audioData: audioData,
                filePath: filePath,
                requestId: requestId,
                processingTime: processingTime,
                fileSize: audioData.length
            };
            
        } catch (error) {
            console.error(`TTS generation failed: ${error.message}`);
            return {
                success: false,
                errorMessage: error.message,
                requestId: requestId,
                processingTime: Date.now() - startTime
            };
        }
    }
    
    /**
     * Save audio data to file
     * @private
     */
    async _saveAudio(audioData, filePath, format) {
        return new Promise((resolve, reject) => {
            try {
                // Ensure directory exists
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                // Add extension if not present
                if (!filePath.toLowerCase().endsWith(`.${format}`)) {
                    filePath = `${filePath}.${format}`;
                }
                
                fs.writeFile(filePath, audioData, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        console.log(`Audio saved to: ${filePath}`);
                        resolve(filePath);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Get available voices
     * @returns {Promise<Array>} List of available voices
     */
    async getVoices() {
        return new Promise((resolve, reject) => {
            const url = new URL(`${this.baseUrl}/v1/voices`);
            
            const options = {
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 443 : 80),
                path: url.pathname,
                method: 'GET',
                headers: {
                    'x-api-key': this.apiKey,
                    'User-Agent': 'ODIADEV-TTS-JavaScript-SDK/1.0.0'
                },
                timeout: this.timeout
            };
            
            if (url.protocol === 'https:' && !this.validateSSL) {
                options.rejectUnauthorized = false;
            }
            
            const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const response = JSON.parse(data);
                            resolve(response.profiles || []);
                        } catch (error) {
                            reject(new Error('Invalid JSON response'));
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                    }
                });
            });
            
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            req.end();
        });
    }
    
    /**
     * Get API health status
     * @returns {Promise<Object>} Health status
     */
    async getHealth() {
        return new Promise((resolve, reject) => {
            const url = new URL(`${this.baseUrl}/v1/health`);
            
            const options = {
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 443 : 80),
                path: url.pathname,
                method: 'GET',
                headers: {
                    'User-Agent': 'ODIADEV-TTS-JavaScript-SDK/1.0.0'
                },
                timeout: this.timeout
            };
            
            if (url.protocol === 'https:' && !this.validateSSL) {
                options.rejectUnauthorized = false;
            }
            
            const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            resolve(JSON.parse(data));
                        } catch (error) {
                            reject(new Error('Invalid JSON response'));
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                    }
                });
            });
            
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            req.end();
        });
    }
}

// Convenience functions
/**
 * Simple function to generate speech
 * @param {string} text - Text to convert to speech
 * @param {string} apiKey - Your ODIADEV API key
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} TTS response
 */
async function speak(text, apiKey, options = {}) {
    const client = new ODIADEVTTS(apiKey, options);
    return await client.generateSpeech({ text, ...options });
}

/**
 * Quick speech generation that returns file path
 * @param {string} text - Text to convert to speech
 * @param {string} apiKey - Your ODIADEV API key
 * @param {string} saveTo - File path to save audio
 * @returns {Promise<string>} Path to generated audio file
 */
async function quickSpeak(text, apiKey, saveTo = null) {
    const client = new ODIADEVTTS(apiKey);
    const response = await client.generateSpeech({ 
        text, 
        saveTo: saveTo || `./audio_${Date.now()}.mp3` 
    });
    
    if (response.success) {
        return response.filePath;
    } else {
        throw new Error(`TTS failed: ${response.errorMessage}`);
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ODIADEVTTS,
        VOICE_IDS,
        AUDIO_FORMATS,
        TONES,
        speak,
        quickSpeak
    };
}

// Example usage
if (require.main === module) {
    (async () => {
        try {
            // Initialize client
            const client = new ODIADEVTTS('your_api_key_here');
            
            // Generate speech
            const response = await client.generateSpeech({
                text: 'Hello Lagos! This is ODIADEV TTS speaking.',
                voiceId: VOICE_IDS.NAIJA_FEMALE_WARM,
                format: AUDIO_FORMATS.MP3,
                saveTo: './output.mp3'
            });
            
            if (response.success) {
                console.log('Audio generated successfully!');
                console.log(`File: ${response.filePath}`);
                console.log(`Size: ${response.fileSize} bytes`);
                console.log(`Processing time: ${response.processingTime}ms`);
            } else {
                console.log(`Error: ${response.errorMessage}`);
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
    })();
}
