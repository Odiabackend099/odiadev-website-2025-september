# 🤖 ODIADEV TTS API - AI Integration Package

## 📦 **Complete Package for AI Assistants**

This package contains everything an AI assistant needs to help users integrate with the ODIADEV TTS API. Perfect for AI assistants working on web development, mobile apps, or any project requiring text-to-speech functionality.

---

## 🎯 **What's Included**

### **📚 Documentation**
- **`AI_TTS_INTEGRATION_GUIDE.md`** - Complete guide for AI assistants
- **`API_DOCUMENTATION.md`** - Detailed API reference with examples
- **`AI_PROMPTS_FOR_TTS_INTEGRATION.md`** - Ready-to-use prompts for AI assistants

### **💻 Code Examples**
- **`CODE_EXAMPLES.md`** - Complete code examples for all platforms
- **`TESTING_GUIDE.md`** - Comprehensive testing and validation guide

### **🚀 Deployment**
- **`ec2-user-data-final.sh`** - One-click EC2 deployment script
- **`EC2_USER_DATA_DEPLOYMENT_GUIDE.md`** - Deployment instructions

---

## 🎤 **TTS API Overview**

### **Key Features**
- ✅ **6 High-Quality Voices** - Nigerian and US accents
- ✅ **5 Audio Formats** - MP3, WAV, OPUS, AAC, FLAC
- ✅ **Universal CORS** - Works from any domain
- ✅ **Simple API** - Easy to integrate
- ✅ **Reliable** - Built-in retry logic
- ✅ **Production Ready** - Rate limiting, error handling

### **Available Voices**
| Voice ID | Description | Best For |
|----------|-------------|----------|
| `naija_female_warm` | Nigerian female, warm & lively | Onboarding, conversational |
| `naija_male_warm` | Nigerian male, warm & friendly | Customer service, chat |
| `naija_female_bold` | Nigerian female, bold & confident | Ads, announcements |
| `naija_male_deep` | Nigerian male, deep & calm authority | News, support |
| `us_female_clear` | US female, clear & professional | Business, education |
| `us_male_story` | US male, calm storyteller | Narration, explainers |

---

## 🚀 **Quick Start for AI Assistants**

### **1. Basic Integration**
```javascript
// Simple TTS integration
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

### **2. Voice Selection Guide**
```javascript
// Voice selection based on use case
const voiceRecommendations = {
  'business': 'us_female_clear',
  'conversational': 'naija_female_warm',
  'announcements': 'naija_male_deep',
  'storytelling': 'us_male_story',
  'marketing': 'naija_female_bold',
  'customer_service': 'naija_male_warm'
};
```

### **3. Error Handling**
```javascript
// Robust error handling
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

## 📋 **AI Assistant Instructions**

### **When User Asks for TTS Integration:**

1. **Always provide complete code examples** for their platform
2. **Include proper error handling** and retry logic
3. **Recommend appropriate voices** based on use case
4. **Show testing examples** and validation steps
5. **Explain authentication** and API configuration
6. **Provide troubleshooting** for common issues

### **Key Points to Emphasize:**
- ✅ **Universal CORS support** - Works from any domain
- ✅ **6 professional voices** - Choose based on content type
- ✅ **5 audio formats** - MP3 recommended for web
- ✅ **Simple API** - Easy to integrate
- ✅ **Reliable** - Built-in retry logic
- ✅ **Production ready** - Rate limiting, monitoring

---

## 🎨 **Platform-Specific Guidance**

### **Web Development (React/Next.js/Vue)**
- Use React hooks for state management
- Implement proper error handling
- Show audio playback functionality
- Include voice selection UI
- Add loading states and user feedback

### **Mobile Development (React Native/Flutter)**
- Handle audio playback on mobile devices
- Include proper permissions
- Show voice selection interface
- Implement retry logic for mobile networks
- Add offline handling

### **Backend Development (Node.js/Python/PHP)**
- Create service functions for TTS
- Include proper logging and monitoring
- Show file saving and streaming
- Implement rate limiting
- Add batch processing capabilities

---

## 🧪 **Testing Strategy**

### **Essential Tests**
1. **Health Check** - Verify API availability
2. **Authentication** - Test valid/invalid API keys
3. **Voice Generation** - Test all voices and formats
4. **Error Handling** - Test invalid inputs and network issues
5. **Performance** - Test response times and reliability

### **Test Examples**
```bash
# Health check
curl https://YOUR_EC2_IP/v1/health

# Basic TTS test
curl -X POST https://YOUR_EC2_IP/v1/tts \
  -H 'x-api-key: YOUR_ODIADEV_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"text":"Hello, this is a test","voice_id":"naija_female_warm","format":"mp3"}' \
  --output test.mp3
```

---

## 🔧 **Common Issues & Solutions**

### **CORS Errors**
- ✅ API supports universal CORS (`*`)
- Check if using correct endpoint
- Verify request method and headers

### **Authentication Errors**
- Verify API key format: `tts_` or `odiadev_` + 32 hex chars
- Check header name: `x-api-key` (case sensitive)
- Ensure API key is valid and active

### **Audio Playback Issues**
- Use correct MIME types for audio formats
- Check browser audio support
- Verify audio format compatibility
- Test with different browsers/devices

### **Network Issues**
- Implement retry logic with exponential backoff
- Check EC2 instance status and connectivity
- Monitor rate limits and usage
- Use proper timeout settings

---

## 📊 **Performance Considerations**

### **Optimization Tips**
1. **Use appropriate voice** for your content type
2. **Implement caching** for repeated content
3. **Add retry logic** for reliability
4. **Monitor rate limits** (60 req/min, 300k chars/day)
5. **Use MP3 format** for web compatibility
6. **Split long texts** (max 5000 characters per request)

### **Rate Limits**
- **Requests**: 60 per minute
- **Characters**: 300,000 per day
- **Text Length**: 5,000 characters per request
- **Timeout**: 45 seconds per request

---

## 🎯 **Success Criteria**

### **Integration Checklist**
- [ ] API endpoint configured correctly
- [ ] Authentication working (valid API key)
- [ ] Voice selection implemented
- [ ] Error handling in place
- [ ] Audio playback working
- [ ] Testing completed
- [ ] Performance optimized
- [ ] User experience polished

### **Quality Assurance**
- [ ] All voices tested and working
- [ ] Error scenarios handled gracefully
- [ ] Loading states and feedback provided
- [ ] Responsive design implemented
- [ ] Accessibility features included
- [ ] Performance meets requirements

---

## 📞 **Support Resources**

### **Documentation**
- **API Reference**: Complete endpoint documentation
- **Code Examples**: Platform-specific implementations
- **Testing Guide**: Comprehensive testing strategies
- **Deployment Guide**: EC2 setup instructions

### **Tools**
- **Health Check**: `GET /v1/health`
- **Voice List**: `GET /v1/voices`
- **TTS Generation**: `POST /v1/tts`
- **Testing Scripts**: Automated test suites

### **Community**
- **GitHub Repository**: Source code and issues
- **Documentation**: Complete integration guides
- **Examples**: Ready-to-use code samples
- **Support**: Technical assistance available

---

## 🎉 **Ready to Use**

This package provides everything needed for successful TTS integration:

1. **📚 Complete Documentation** - Everything an AI needs to know
2. **💻 Ready-to-Use Code** - Copy-paste examples for all platforms
3. **🧪 Testing Tools** - Comprehensive test suites and validation
4. **🚀 Deployment Scripts** - One-click EC2 deployment
5. **🎯 Best Practices** - Production-ready implementation patterns

**The ODIADEV TTS API is designed to be universally accessible and easy to integrate into any project requiring high-quality text-to-speech functionality.**

---

## 📝 **Quick Reference**

**API Endpoint**: `https://YOUR_EC2_IP/v1/tts`  
**Authentication**: `x-api-key: YOUR_ODIADEV_KEY`  
**Voices**: 6 options (Nigerian and US accents)  
**Formats**: MP3, WAV, OPUS, AAC, FLAC  
**CORS**: Universal support (`*`)  
**Rate Limits**: 60 req/min, 300k chars/day  
**Max Text**: 5000 characters per request  

**Perfect for**: Web apps, mobile apps, AI assistants, content creation, e-learning, customer service, and any project requiring speech synthesis.
