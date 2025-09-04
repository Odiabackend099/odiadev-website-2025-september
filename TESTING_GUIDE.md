# ODIADEV TTS API - Testing & Validation Guide

## 🧪 **Complete Testing Guide for TTS Integration**

This guide provides comprehensive testing strategies, validation methods, and troubleshooting steps for the ODIADEV TTS API integration.

---

## 🎯 **Testing Overview**

### **Testing Levels**
1. **Unit Tests** - Individual functions and components
2. **Integration Tests** - API communication and data flow
3. **End-to-End Tests** - Complete user workflows
4. **Performance Tests** - Load and stress testing
5. **User Acceptance Tests** - Real-world usage scenarios

---

## 🔍 **Pre-Testing Checklist**

### **Environment Setup**
- [ ] API endpoint is accessible
- [ ] Valid ODIADEV API key is configured
- [ ] Network connectivity is stable
- [ ] Required dependencies are installed
- [ ] Test data is prepared

### **API Configuration**
- [ ] Base URL: `https://YOUR_EC2_IP`
- [ ] Authentication: `x-api-key` header
- [ ] Content-Type: `application/json`
- [ ] CORS is properly configured

---

## 🚀 **Basic API Tests**

### **1. Health Check Test**
```bash
# Test API availability
curl -X GET https://YOUR_EC2_IP/v1/health

# Expected response:
{
  "ok": true,
  "service": "odiadev-tts-openai-proxy",
  "time": "2024-01-15T10:30:00.000Z",
  "formats": ["mp3", "wav", "opus", "aac", "flac"]
}
```

### **2. Authentication Test**
```bash
# Test with valid API key
curl -H "x-api-key: YOUR_ODIADEV_KEY" https://YOUR_EC2_IP/v1/voices

# Test without API key (should fail)
curl https://YOUR_EC2_IP/v1/voices

# Test with invalid API key (should fail)
curl -H "x-api-key: invalid_key" https://YOUR_EC2_IP/v1/voices
```

### **3. Voice List Test**
```bash
# Get available voices
curl -H "x-api-key: YOUR_ODIADEV_KEY" https://YOUR_EC2_IP/v1/voices

# Expected response:
{
  "voices": [
    {"voice_id": "naija_male_deep", "name": "Nigerian Male Deep"},
    {"voice_id": "naija_male_warm", "name": "Nigerian Male Warm"},
    {"voice_id": "naija_female_warm", "name": "Nigerian Female Warm"},
    {"voice_id": "naija_female_bold", "name": "Nigerian Female Bold"},
    {"voice_id": "us_male_story", "name": "US Male Story"},
    {"voice_id": "us_female_clear", "name": "US Female Clear"}
  ]
}
```

---

## 🎤 **TTS Generation Tests**

### **Basic TTS Test**
```bash
# Test basic speech generation
curl -X POST https://YOUR_EC2_IP/v1/tts \
  -H "x-api-key: YOUR_ODIADEV_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test of the ODIADEV TTS API",
    "voice_id": "naija_female_warm",
    "format": "mp3",
    "speed": 1.0
  }' \
  --output test_speech.mp3
```

### **Test All Voices**
```bash
#!/bin/bash
# Test all available voices

VOICES=("naija_male_deep" "naija_male_warm" "naija_female_warm" "naija_female_bold" "us_male_story" "us_female_clear")
TEXT="Hello, this is a test of the ODIADEV TTS API"

for voice in "${VOICES[@]}"; do
  echo "Testing voice: $voice"
  curl -X POST https://YOUR_EC2_IP/v1/tts \
    -H "x-api-key: YOUR_ODIADEV_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"text\":\"$TEXT\",\"voice_id\":\"$voice\",\"format\":\"mp3\"}" \
    --output "test_${voice}.mp3"
  
  if [ $? -eq 0 ]; then
    echo "✅ $voice: Success"
  else
    echo "❌ $voice: Failed"
  fi
done
```

### **Test All Formats**
```bash
#!/bin/bash
# Test all audio formats

FORMATS=("mp3" "wav" "opus" "aac" "flac")
TEXT="Hello, this is a test of the ODIADEV TTS API"

for format in "${FORMATS[@]}"; do
  echo "Testing format: $format"
  curl -X POST https://YOUR_EC2_IP/v1/tts \
    -H "x-api-key: YOUR_ODIADEV_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"text\":\"$TEXT\",\"voice_id\":\"naija_female_warm\",\"format\":\"$format\"}" \
    --output "test_format_${format}.${format}"
  
  if [ $? -eq 0 ]; then
    echo "✅ $format: Success"
  else
    echo "❌ $format: Failed"
  fi
done
```

---

## 🧪 **JavaScript Testing**

### **Jest Test Suite**
```javascript
// tts.test.js
const TTSClient = require('./tts-client');

describe('TTS API Tests', () => {
  let ttsClient;
  
  beforeAll(() => {
    ttsClient = new TTSClient(
      process.env.ODIADEV_TTS_KEY,
      process.env.TTS_BASE_URL || 'https://YOUR_EC2_IP'
    );
  });
  
  describe('Health Check', () => {
    test('should return health status', async () => {
      const health = await ttsClient.healthCheck();
      expect(health.ok).toBe(true);
      expect(health.service).toBe('odiadev-tts-openai-proxy');
      expect(health.formats).toContain('mp3');
    });
  });
  
  describe('Voice Management', () => {
    test('should get available voices', async () => {
      const voices = await ttsClient.getVoices();
      expect(voices.voices).toBeDefined();
      expect(voices.voices.length).toBeGreaterThan(0);
      
      const voiceIds = voices.voices.map(v => v.voice_id);
      expect(voiceIds).toContain('naija_female_warm');
      expect(voiceIds).toContain('naija_male_deep');
    });
  });
  
  describe('Speech Generation', () => {
    test('should generate speech with default parameters', async () => {
      const text = 'Hello, this is a test';
      const audioBlob = await ttsClient.generateSpeech(text);
      
      expect(audioBlob).toBeInstanceOf(Blob);
      expect(audioBlob.size).toBeGreaterThan(0);
      expect(audioBlob.type).toBe('audio/mpeg');
    });
    
    test('should generate speech with custom voice', async () => {
      const text = 'Hello, this is a test';
      const audioBlob = await ttsClient.generateSpeech(text, 'naija_male_deep');
      
      expect(audioBlob).toBeInstanceOf(Blob);
      expect(audioBlob.size).toBeGreaterThan(0);
    });
    
    test('should generate speech with custom speed', async () => {
      const text = 'Hello, this is a test';
      const audioBlob = await ttsClient.generateSpeech(text, 'naija_female_warm', 1.2);
      
      expect(audioBlob).toBeInstanceOf(Blob);
      expect(audioBlob.size).toBeGreaterThan(0);
    });
    
    test('should handle empty text', async () => {
      await expect(ttsClient.generateSpeech('')).rejects.toThrow('Text cannot be empty');
    });
    
    test('should handle long text', async () => {
      const longText = 'a'.repeat(5001);
      await expect(ttsClient.generateSpeech(longText)).rejects.toThrow('Text too long');
    });
  });
  
  describe('Error Handling', () => {
    test('should handle invalid API key', async () => {
      const invalidClient = new TTSClient('invalid_key', 'https://YOUR_EC2_IP');
      await expect(invalidClient.getVoices()).rejects.toThrow();
    });
    
    test('should handle network errors', async () => {
      const offlineClient = new TTSClient('YOUR_ODIADEV_KEY', 'https://invalid-url');
      await expect(offlineClient.healthCheck()).rejects.toThrow();
    });
  });
});
```

### **Cypress E2E Tests**
```javascript
// cypress/integration/tts.spec.js
describe('TTS Integration', () => {
  beforeEach(() => {
    cy.visit('/tts-demo');
  });
  
  it('should display TTS interface', () => {
    cy.get('[data-testid="tts-textarea"]').should('be.visible');
    cy.get('[data-testid="voice-select"]').should('be.visible');
    cy.get('[data-testid="speak-button"]').should('be.visible');
  });
  
  it('should generate and play speech', () => {
    const testText = 'Hello, this is a test';
    
    cy.get('[data-testid="tts-textarea"]').type(testText);
    cy.get('[data-testid="voice-select"]').select('naija_female_warm');
    cy.get('[data-testid="speak-button"]').click();
    
    cy.get('[data-testid="status"]').should('contain', 'Generating speech');
    cy.get('[data-testid="status"]').should('contain', 'Playing speech');
  });
  
  it('should handle empty text', () => {
    cy.get('[data-testid="speak-button"]').click();
    cy.get('[data-testid="error"]').should('contain', 'Please enter some text');
  });
  
  it('should handle long text', () => {
    const longText = 'a'.repeat(5001);
    cy.get('[data-testid="tts-textarea"]').type(longText);
    cy.get('[data-testid="speak-button"]').click();
    cy.get('[data-testid="error"]').should('contain', 'Text too long');
  });
});
```

---

## 🐍 **Python Testing**

### **Pytest Test Suite**
```python
# test_tts.py
import pytest
import tempfile
import os
from tts_client import TTSClient

class TestTTSClient:
    @pytest.fixture
    def client(self):
        return TTSClient(
            api_key=os.getenv('ODIADEV_TTS_KEY'),
            base_url=os.getenv('TTS_BASE_URL', 'https://YOUR_EC2_IP')
        )
    
    def test_health_check(self, client):
        """Test API health check"""
        health = client.health_check()
        assert health['ok'] is True
        assert 'service' in health
        assert 'formats' in health
        assert 'mp3' in health['formats']
    
    def test_get_voices(self, client):
        """Test getting available voices"""
        voices = client.get_voices()
        assert 'voices' in voices
        assert len(voices['voices']) > 0
        
        voice_ids = [v['voice_id'] for v in voices['voices']]
        assert 'naija_female_warm' in voice_ids
        assert 'naija_male_deep' in voice_ids
    
    def test_generate_speech_basic(self, client):
        """Test basic speech generation"""
        text = "Hello, this is a test"
        audio_data = client.generate_speech(text)
        
        assert isinstance(audio_data, bytes)
        assert len(audio_data) > 0
    
    def test_generate_speech_all_voices(self, client):
        """Test all available voices"""
        voices = client.get_voices()
        text = "Hello, this is a test"
        
        for voice in voices['voices']:
            voice_id = voice['voice_id']
            audio_data = client.generate_speech(text, voice_id)
            assert isinstance(audio_data, bytes)
            assert len(audio_data) > 0
    
    def test_generate_speech_all_formats(self, client):
        """Test all audio formats"""
        formats = ['mp3', 'wav', 'opus', 'aac', 'flac']
        text = "Hello, this is a test"
        
        for format in formats:
            audio_data = client.generate_speech(text, 'naija_female_warm', 1.0, format)
            assert isinstance(audio_data, bytes)
            assert len(audio_data) > 0
    
    def test_save_speech(self, client):
        """Test saving speech to file"""
        text = "Hello, this is a test"
        
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as f:
            filename = f.name
        
        try:
            result = client.save_speech(text, filename)
            assert result == filename
            assert os.path.exists(filename)
            assert os.path.getsize(filename) > 0
        finally:
            if os.path.exists(filename):
                os.unlink(filename)
    
    def test_empty_text_error(self, client):
        """Test error handling for empty text"""
        with pytest.raises(ValueError, match="Text cannot be empty"):
            client.generate_speech("")
    
    def test_long_text_error(self, client):
        """Test error handling for long text"""
        long_text = "a" * 5001
        with pytest.raises(ValueError, match="Text too long"):
            client.generate_speech(long_text)
    
    def test_invalid_api_key(self):
        """Test error handling for invalid API key"""
        invalid_client = TTSClient('invalid_key', 'https://YOUR_EC2_IP')
        with pytest.raises(Exception):
            invalid_client.get_voices()
    
    def test_network_error(self):
        """Test error handling for network issues"""
        offline_client = TTSClient('YOUR_ODIADEV_KEY', 'https://invalid-url')
        with pytest.raises(Exception):
            offline_client.health_check()

# Run tests with: pytest test_tts.py -v
```

---

## 📱 **Mobile Testing**

### **React Native Testing**
```javascript
// __tests__/TTSComponent.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TTSComponent from '../TTSComponent';

// Mock the TTS API
jest.mock('../TTSClient', () => ({
  generateSpeech: jest.fn(() => Promise.resolve(new Blob(['mock audio'], { type: 'audio/mpeg' })))
}));

describe('TTSComponent', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<TTSComponent />);
    expect(getByTestId('tts-textarea')).toBeTruthy();
    expect(getByTestId('voice-select')).toBeTruthy();
    expect(getByTestId('speak-button')).toBeTruthy();
  });
  
  it('handles text input', () => {
    const { getByTestId } = render(<TTSComponent />);
    const textarea = getByTestId('tts-textarea');
    fireEvent.changeText(textarea, 'Hello, this is a test');
    expect(textarea.props.value).toBe('Hello, this is a test');
  });
  
  it('handles voice selection', () => {
    const { getByTestId } = render(<TTSComponent />);
    const voiceSelect = getByTestId('voice-select');
    fireEvent(voiceSelect, 'onValueChange', 'naija_male_deep');
    expect(voiceSelect.props.selectedValue).toBe('naija_male_deep');
  });
  
  it('generates speech when speak button is pressed', async () => {
    const { getByTestId } = render(<TTSComponent />);
    const textarea = getByTestId('tts-textarea');
    const speakButton = getByTestId('speak-button');
    
    fireEvent.changeText(textarea, 'Hello, this is a test');
    fireEvent.press(speakButton);
    
    await waitFor(() => {
      expect(getByTestId('status')).toHaveTextContent('Generating speech');
    });
  });
});
```

---

## ⚡ **Performance Testing**

### **Load Testing with Artillery**
```yaml
# artillery-config.yml
config:
  target: 'https://YOUR_EC2_IP'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
    - duration: 60
      arrivalRate: 10
  headers:
    x-api-key: 'YOUR_ODIADEV_KEY'
    Content-Type: 'application/json'

scenarios:
  - name: "TTS Generation"
    weight: 100
    flow:
      - post:
          url: "/v1/tts"
          json:
            text: "Hello, this is a performance test"
            voice_id: "naija_female_warm"
            format: "mp3"
            speed: 1.0
```

```bash
# Run load test
artillery run artillery-config.yml
```

### **JavaScript Performance Test**
```javascript
// performance-test.js
class TTSPerformanceTest {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.results = [];
  }
  
  async runPerformanceTest(iterations = 100) {
    console.log(`Running performance test with ${iterations} iterations...`);
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      try {
        const response = await fetch(`${this.baseUrl}/v1/tts`, {
          method: 'POST',
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: 'Hello, this is a performance test',
            voice_id: 'naija_female_warm',
            format: 'mp3'
          })
        });
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (response.ok) {
          const audioBlob = await response.blob();
          this.results.push({
            success: true,
            duration,
            size: audioBlob.size
          });
        } else {
          this.results.push({
            success: false,
            duration,
            error: response.status
          });
        }
      } catch (error) {
        const endTime = performance.now();
        this.results.push({
          success: false,
          duration: endTime - startTime,
          error: error.message
        });
      }
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.analyzeResults();
  }
  
  analyzeResults() {
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    
    const durations = successful.map(r => r.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    
    console.log('Performance Test Results:');
    console.log(`Total requests: ${this.results.length}`);
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);
    console.log(`Success rate: ${(successful.length / this.results.length * 100).toFixed(2)}%`);
    console.log(`Average duration: ${avgDuration.toFixed(2)}ms`);
    console.log(`Min duration: ${minDuration.toFixed(2)}ms`);
    console.log(`Max duration: ${maxDuration.toFixed(2)}ms`);
  }
}

// Usage
const tester = new TTSPerformanceTest('YOUR_ODIADEV_KEY', 'https://YOUR_EC2_IP');
tester.runPerformanceTest(50);
```

---

## 🔧 **Troubleshooting Tests**

### **Network Connectivity Test**
```bash
#!/bin/bash
# network-test.sh

echo "Testing network connectivity..."

# Test basic connectivity
ping -c 3 YOUR_EC2_IP

# Test HTTP connectivity
curl -I https://YOUR_EC2_IP/v1/health

# Test with timeout
curl --max-time 10 https://YOUR_EC2_IP/v1/health

# Test DNS resolution
nslookup YOUR_EC2_IP

echo "Network test completed"
```

### **API Response Time Test**
```bash
#!/bin/bash
# response-time-test.sh

echo "Testing API response times..."

# Test health endpoint
echo "Health endpoint:"
curl -w "@curl-format.txt" -o /dev/null -s https://YOUR_EC2_IP/v1/health

# Test voices endpoint
echo "Voices endpoint:"
curl -w "@curl-format.txt" -o /dev/null -s -H "x-api-key: YOUR_ODIADEV_KEY" https://YOUR_EC2_IP/v1/voices

# Test TTS endpoint
echo "TTS endpoint:"
curl -w "@curl-format.txt" -o /dev/null -s -X POST \
  -H "x-api-key: YOUR_ODIADEV_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, this is a test","voice_id":"naija_female_warm","format":"mp3"}' \
  https://YOUR_EC2_IP/v1/tts
```

```bash
# curl-format.txt
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

---

## 📊 **Test Results Analysis**

### **Success Criteria**
- ✅ **Health Check**: API responds within 2 seconds
- ✅ **Authentication**: Valid API key works, invalid key fails
- ✅ **Voice List**: All 6 voices are available
- ✅ **TTS Generation**: Audio is generated for all voices and formats
- ✅ **Error Handling**: Proper errors for invalid inputs
- ✅ **Performance**: Average response time < 5 seconds
- ✅ **Reliability**: Success rate > 95%

### **Test Report Template**
```markdown
# TTS API Test Report

## Test Summary
- **Date**: 2024-01-15
- **Environment**: Production
- **Total Tests**: 50
- **Passed**: 48
- **Failed**: 2
- **Success Rate**: 96%

## Test Results

### API Health
- ✅ Health check: PASS
- ✅ Authentication: PASS
- ✅ Voice list: PASS

### TTS Generation
- ✅ Basic generation: PASS
- ✅ All voices: PASS
- ✅ All formats: PASS
- ❌ Long text handling: FAIL
- ✅ Error handling: PASS

### Performance
- ✅ Response time: 3.2s average
- ✅ Success rate: 96%
- ✅ Load test: PASS

## Issues Found
1. Long text (>5000 chars) not properly handled
2. Network timeout on slow connections

## Recommendations
1. Implement better text length validation
2. Add retry logic for network issues
3. Consider caching for repeated requests
```

---

## 🎯 **Continuous Testing**

### **GitHub Actions Workflow**
```yaml
# .github/workflows/tts-test.yml
name: TTS API Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm test
      env:
        ODIADEV_TTS_KEY: ${{ secrets.ODIADEV_TTS_KEY }}
        TTS_BASE_URL: ${{ secrets.TTS_BASE_URL }}
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        ODIADEV_TTS_KEY: ${{ secrets.ODIADEV_TTS_KEY }}
        TTS_BASE_URL: ${{ secrets.TTS_BASE_URL }}
    
    - name: Run performance tests
      run: npm run test:performance
      env:
        ODIADEV_TTS_KEY: ${{ secrets.ODIADEV_TTS_KEY }}
        TTS_BASE_URL: ${{ secrets.TTS_BASE_URL }}
```

---

## 🎉 **Testing Best Practices**

### **Test Organization**
1. **Group related tests** by functionality
2. **Use descriptive test names** that explain what is being tested
3. **Keep tests independent** - each test should be able to run alone
4. **Use setup and teardown** for test data preparation
5. **Mock external dependencies** when appropriate

### **Test Data Management**
1. **Use consistent test data** across all tests
2. **Clean up test files** after each test
3. **Use environment variables** for configuration
4. **Avoid hardcoded values** in tests
5. **Use realistic test scenarios**

### **Error Testing**
1. **Test all error conditions** - invalid inputs, network failures, etc.
2. **Verify error messages** are helpful and accurate
3. **Test error recovery** mechanisms
4. **Test timeout handling** for slow responses
5. **Test rate limiting** behavior

---

## 📞 **Support and Debugging**

### **Common Test Failures**
1. **Authentication errors** - Check API key format and validity
2. **Network timeouts** - Verify EC2 instance is running and accessible
3. **CORS errors** - Ensure API supports universal CORS
4. **Audio playback issues** - Check MIME types and browser support
5. **Rate limiting** - Monitor request frequency and limits

### **Debug Tools**
1. **Browser DevTools** - Network tab for request/response inspection
2. **Postman/Insomnia** - API testing and debugging
3. **curl** - Command-line testing and debugging
4. **Logs** - Check application and server logs
5. **Monitoring** - Use API monitoring tools for production

This comprehensive testing guide ensures your TTS integration is robust, reliable, and ready for production use!
