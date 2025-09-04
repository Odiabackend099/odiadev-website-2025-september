<?php
/**
 * ODIADEV TTS PHP SDK
 * Professional Text-to-Speech SDK for Nigerian and US English Voices
 * Compatible with OpenAI TTS API format
 */

class ODIADEVTTS {
    
    // Voice IDs
    const VOICE_NAIJA_MALE_DEEP = 'naija_male_deep';
    const VOICE_NAIJA_MALE_WARM = 'naija_male_warm';
    const VOICE_NAIJA_FEMALE_WARM = 'naija_female_warm';
    const VOICE_NAIJA_FEMALE_BOLD = 'naija_female_bold';
    const VOICE_US_MALE_STORY = 'us_male_story';
    const VOICE_US_FEMALE_CLEAR = 'us_female_clear';
    
    // Audio formats
    const FORMAT_MP3 = 'mp3';
    const FORMAT_WAV = 'wav';
    const FORMAT_OPUS = 'opus';
    const FORMAT_AAC = 'aac';
    const FORMAT_FLAC = 'flac';
    
    // Voice tones
    const TONE_NEUTRAL = 'neutral';
    const TONE_FRIENDLY = 'friendly';
    const TONE_BOLD = 'bold';
    const TONE_CALM = 'calm';
    const TONE_SALES = 'sales';
    const TONE_SUPPORT = 'support';
    const TONE_ADS = 'ads';
    
    private $apiKey;
    private $baseUrl;
    private $timeout;
    private $maxRetries;
    private $retryDelay;
    private $rateLimitDelay;
    private $validateSSL;
    
    /**
     * Initialize ODIADEV TTS Client
     * 
     * @param string $apiKey Your ODIADEV API key
     * @param array $options Configuration options
     */
    public function __construct($apiKey, $options = []) {
        $this->apiKey = $apiKey;
        $this->baseUrl = $options['baseUrl'] ?? 'https://tts-api.odia.dev';
        $this->timeout = $options['timeout'] ?? 30;
        $this->maxRetries = $options['maxRetries'] ?? 3;
        $this->retryDelay = $options['retryDelay'] ?? 1.0;
        $this->rateLimitDelay = $options['rateLimitDelay'] ?? 0.1;
        $this->validateSSL = $options['validateSSL'] ?? true;
        
        // Remove trailing slash from base URL
        $this->baseUrl = rtrim($this->baseUrl, '/');
        
        // Validate API key
        $this->validateApiKey();
        
        // Test connection
        $this->testConnection();
    }
    
    /**
     * Validate API key format
     * 
     * @throws InvalidArgumentException
     */
    private function validateApiKey() {
        if (empty($this->apiKey) || strlen($this->apiKey) < 20) {
            throw new InvalidArgumentException('Invalid API key format. API key must be at least 20 characters long.');
        }
        
        if (!str_starts_with($this->apiKey, 'odiadev_')) {
            error_log('API key doesn\'t start with \'odiadev_\' - this might not be a valid ODIADEV key');
        }
    }
    
    /**
     * Test API connection
     * 
     * @throws RuntimeException
     */
    private function testConnection() {
        try {
            $health = $this->getHealth();
            error_log("Connected to ODIADEV TTS: " . ($health['brand'] ?? 'Unknown'));
        } catch (Exception $e) {
            error_log("Failed to connect to ODIADEV TTS API: " . $e->getMessage());
            throw new RuntimeException("Cannot connect to ODIADEV TTS API: " . $e->getMessage());
        }
    }
    
    /**
     * Sanitize input text
     * 
     * @param string $text Input text
     * @return string Sanitized text
     * @throws InvalidArgumentException
     */
    private function sanitizeText($text) {
        if (empty($text) || !is_string($text)) {
            throw new InvalidArgumentException('Text must be a non-empty string');
        }
        
        $sanitized = trim($text);
        if (empty($sanitized)) {
            throw new InvalidArgumentException('Text cannot be empty after sanitization');
        }
        
        // Limit length
        if (strlen($sanitized) > 5000) {
            $sanitized = substr($sanitized, 0, 5000);
            error_log('Text truncated to 5000 characters');
        }
        
        return $sanitized;
    }
    
    /**
     * Validate voice ID
     * 
     * @param string $voiceId Voice ID
     * @return string Valid voice ID
     */
    private function validateVoiceId($voiceId) {
        $validVoices = [
            self::VOICE_NAIJA_MALE_DEEP,
            self::VOICE_NAIJA_MALE_WARM,
            self::VOICE_NAIJA_FEMALE_WARM,
            self::VOICE_NAIJA_FEMALE_BOLD,
            self::VOICE_US_MALE_STORY,
            self::VOICE_US_FEMALE_CLEAR
        ];
        
        if (!in_array($voiceId, $validVoices)) {
            error_log("Invalid voice_id '$voiceId', using default 'naija_female_warm'");
            return self::VOICE_NAIJA_FEMALE_WARM;
        }
        
        return $voiceId;
    }
    
    /**
     * Validate audio format
     * 
     * @param string $format Audio format
     * @return string Valid format
     */
    private function validateFormat($format) {
        $validFormats = [
            self::FORMAT_MP3,
            self::FORMAT_WAV,
            self::FORMAT_OPUS,
            self::FORMAT_AAC,
            self::FORMAT_FLAC
        ];
        
        if (!in_array($format, $validFormats)) {
            error_log("Invalid format '$format', using default 'mp3'");
            return self::FORMAT_MP3;
        }
        
        return $format;
    }
    
    /**
     * Validate speed parameter
     * 
     * @param float $speed Speed value
     * @return float Valid speed
     */
    private function validateSpeed($speed) {
        if (!is_numeric($speed)) {
            $speed = 1.0;
        }
        
        $speed = (float) $speed;
        if ($speed < 0.5 || $speed > 1.5) {
            error_log("Speed $speed out of range [0.5, 1.5], clamping to valid range");
            $speed = max(0.5, min(1.5, $speed));
        }
        
        return $speed;
    }
    
    /**
     * Make HTTP request with retry logic
     * 
     * @param array $requestData Request data
     * @param int $retryCount Current retry count
     * @return array Response data
     * @throws Exception
     */
    private function makeRequest($requestData, $retryCount = 0) {
        $url = $this->baseUrl . '/v1/tts';
        $postData = json_encode($requestData);
        
        $headers = [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($postData),
            'x-api-key: ' . $this->apiKey,
            'User-Agent: ODIADEV-TTS-PHP-SDK/1.0.0'
        ];
        
        $context = [
            'http' => [
                'method' => 'POST',
                'header' => implode("\r\n", $headers),
                'content' => $postData,
                'timeout' => $this->timeout,
                'ignore_errors' => true
            ]
        ];
        
        if (!$this->validateSSL) {
            $context['ssl'] = [
                'verify_peer' => false,
                'verify_peer_name' => false
            ];
        }
        
        $context = stream_context_create($context);
        $response = file_get_contents($url, false, $context);
        
        if ($response === false) {
            if ($retryCount < $this->maxRetries) {
                $delay = $this->retryDelay * pow(2, $retryCount);
                error_log("Request failed, retrying after {$delay}s ({$retryCount}/{$this->maxRetries})");
                sleep($delay);
                return $this->makeRequest($requestData, $retryCount + 1);
            } else {
                throw new Exception('Request failed after max retries');
            }
        }
        
        // Check HTTP status
        $httpCode = $this->getHttpCode($http_response_header ?? []);
        
        if ($httpCode === 429) {
            if ($retryCount < $this->maxRetries) {
                $retryAfter = 60; // Default retry after 60 seconds
                error_log("Rate limited, retrying after {$retryAfter}s");
                sleep($retryAfter);
                return $this->makeRequest($requestData, $retryCount + 1);
            } else {
                throw new Exception('Rate limit exceeded, max retries reached');
            }
        }
        
        if ($httpCode >= 500 && $retryCount < $this->maxRetries) {
            $delay = $this->retryDelay * pow(2, $retryCount);
            error_log("Server error $httpCode, retrying after {$delay}s ({$retryCount}/{$this->maxRetries})");
            sleep($delay);
            return $this->makeRequest($requestData, $retryCount + 1);
        }
        
        if ($httpCode < 200 || $httpCode >= 300) {
            throw new Exception("HTTP $httpCode: Request failed");
        }
        
        return $response;
    }
    
    /**
     * Extract HTTP status code from response headers
     * 
     * @param array $headers Response headers
     * @return int HTTP status code
     */
    private function getHttpCode($headers) {
        if (empty($headers)) {
            return 200;
        }
        
        $statusLine = $headers[0];
        if (preg_match('/HTTP\/\d\.\d\s+(\d+)/', $statusLine, $matches)) {
            return (int) $matches[1];
        }
        
        return 200;
    }
    
    /**
     * Generate speech from text
     * 
     * @param array $options TTS options
     * @return array TTS response
     */
    public function generateSpeech($options = []) {
        $startTime = microtime(true);
        $requestId = uniqid('req_', true);
        
        try {
            // Validate and sanitize inputs
            $text = $this->sanitizeText($options['text'] ?? '');
            $voiceId = $this->validateVoiceId($options['voiceId'] ?? self::VOICE_NAIJA_FEMALE_WARM);
            $format = $this->validateFormat($options['format'] ?? self::FORMAT_MP3);
            $speed = $this->validateSpeed($options['speed'] ?? 1.0);
            $tone = $options['tone'] ?? self::TONE_NEUTRAL;
            $language = $options['language'] ?? 'en-NG';
            
            // Prepare request
            $requestData = [
                'text' => $text,
                'voice_id' => $voiceId,
                'format' => $format,
                'speed' => $speed,
                'tone' => $tone,
                'lang' => $language
            ];
            
            error_log("Generating speech for voice: $voiceId, format: $format, length: " . strlen($text) . " chars");
            
            // Make request
            $audioData = $this->makeRequest($requestData);
            $processingTime = (microtime(true) - $startTime) * 1000; // Convert to milliseconds
            
            // Save to file if requested
            $filePath = null;
            if (isset($options['saveTo'])) {
                $filePath = $this->saveAudio($audioData, $options['saveTo'], $format);
            }
            
            return [
                'success' => true,
                'audioData' => $audioData,
                'filePath' => $filePath,
                'requestId' => $requestId,
                'processingTime' => $processingTime,
                'fileSize' => strlen($audioData)
            ];
            
        } catch (Exception $e) {
            error_log("TTS generation failed: " . $e->getMessage());
            return [
                'success' => false,
                'errorMessage' => $e->getMessage(),
                'requestId' => $requestId,
                'processingTime' => (microtime(true) - $startTime) * 1000
            ];
        }
    }
    
    /**
     * Save audio data to file
     * 
     * @param string $audioData Audio data
     * @param string $filePath File path
     * @param string $format Audio format
     * @return string Saved file path
     * @throws Exception
     */
    private function saveAudio($audioData, $filePath, $format) {
        try {
            // Ensure directory exists
            $dir = dirname($filePath);
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
            
            // Add extension if not present
            if (!str_ends_with(strtolower($filePath), '.' . $format)) {
                $filePath .= '.' . $format;
            }
            
            if (file_put_contents($filePath, $audioData) === false) {
                throw new Exception("Failed to write audio file: $filePath");
            }
            
            error_log("Audio saved to: $filePath");
            return $filePath;
            
        } catch (Exception $e) {
            error_log("Failed to save audio: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Get available voices
     * 
     * @return array List of available voices
     */
    public function getVoices() {
        try {
            $url = $this->baseUrl . '/v1/voices';
            
            $headers = [
                'x-api-key: ' . $this->apiKey,
                'User-Agent: ODIADEV-TTS-PHP-SDK/1.0.0'
            ];
            
            $context = [
                'http' => [
                    'method' => 'GET',
                    'header' => implode("\r\n", $headers),
                    'timeout' => $this->timeout,
                    'ignore_errors' => true
                ]
            ];
            
            if (!$this->validateSSL) {
                $context['ssl'] = [
                    'verify_peer' => false,
                    'verify_peer_name' => false
                ];
            }
            
            $context = stream_context_create($context);
            $response = file_get_contents($url, false, $context);
            
            if ($response === false) {
                throw new Exception('Failed to get voices');
            }
            
            $data = json_decode($response, true);
            return $data['profiles'] ?? [];
            
        } catch (Exception $e) {
            error_log("Failed to get voices: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get API health status
     * 
     * @return array Health status
     */
    public function getHealth() {
        try {
            $url = $this->baseUrl . '/v1/health';
            
            $headers = [
                'User-Agent: ODIADEV-TTS-PHP-SDK/1.0.0'
            ];
            
            $context = [
                'http' => [
                    'method' => 'GET',
                    'header' => implode("\r\n", $headers),
                    'timeout' => $this->timeout,
                    'ignore_errors' => true
                ]
            ];
            
            if (!$this->validateSSL) {
                $context['ssl'] = [
                    'verify_peer' => false,
                    'verify_peer_name' => false
                ];
            }
            
            $context = stream_context_create($context);
            $response = file_get_contents($url, false, $context);
            
            if ($response === false) {
                throw new Exception('Failed to get health status');
            }
            
            return json_decode($response, true);
            
        } catch (Exception $e) {
            error_log("Failed to get health status: " . $e->getMessage());
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }
}

// Convenience functions
/**
 * Simple function to generate speech
 * 
 * @param string $text Text to convert to speech
 * @param string $apiKey Your ODIADEV API key
 * @param array $options Additional options
 * @return array TTS response
 */
function odiadev_speak($text, $apiKey, $options = []) {
    $client = new ODIADEVTTS($apiKey, $options);
    return $client->generateSpeech(array_merge(['text' => $text], $options));
}

/**
 * Quick speech generation that returns file path
 * 
 * @param string $text Text to convert to speech
 * @param string $apiKey Your ODIADEV API key
 * @param string $saveTo File path to save audio
 * @return string Path to generated audio file
 * @throws Exception
 */
function odiadev_quick_speak($text, $apiKey, $saveTo = null) {
    $client = new ODIADEVTTS($apiKey);
    $saveTo = $saveTo ?? './audio_' . time() . '.mp3';
    
    $response = $client->generateSpeech([
        'text' => $text,
        'saveTo' => $saveTo
    ]);
    
    if ($response['success']) {
        return $response['filePath'];
    } else {
        throw new Exception("TTS failed: " . $response['errorMessage']);
    }
}

// Example usage
if (basename(__FILE__) === basename($_SERVER['SCRIPT_NAME'])) {
    try {
        // Initialize client
        $client = new ODIADEVTTS('your_api_key_here');
        
        // Generate speech
        $response = $client->generateSpeech([
            'text' => 'Hello Lagos! This is ODIADEV TTS speaking.',
            'voiceId' => ODIADEVTTS::VOICE_NAIJA_FEMALE_WARM,
            'format' => ODIADEVTTS::FORMAT_MP3,
            'saveTo' => './output.mp3'
        ]);
        
        if ($response['success']) {
            echo "Audio generated successfully!\n";
            echo "File: " . $response['filePath'] . "\n";
            echo "Size: " . $response['fileSize'] . " bytes\n";
            echo "Processing time: " . round($response['processingTime'], 2) . "ms\n";
        } else {
            echo "Error: " . $response['errorMessage'] . "\n";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
?>
