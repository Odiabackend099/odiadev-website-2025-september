# AI Prompts for TTS Integration

## 🤖 **Instructions for AI Assistants**

Use these prompts and instructions when helping users integrate with the ODIADEV TTS API.

---

## 📋 **Quick Reference Prompt**

```
You have access to the ODIADEV TTS API for text-to-speech functionality. Here are the key details:

API Endpoint: https://YOUR_EC2_IP/v1/tts
Authentication: x-api-key header with ODIADEV key
Available Voices: naija_male_deep, naija_male_warm, naija_female_warm, naija_female_bold, us_male_story, us_female_clear
Formats: mp3, wav, opus, aac, flac
Max Text: 5000 characters
CORS: Universal support (*)

When helping users integrate TTS, always provide:
1. Complete code examples for their platform
2. Proper error handling
3. Voice recommendations based on use case
4. Testing examples
5. Authentication setup
```

---

## 🎯 **Platform-Specific Prompts**

### **For Web Development (React/Next.js/Vue)**

```
The user wants to add TTS functionality to their web application. Provide a complete integration using the ODIADEV TTS API:

1. Create a React hook or component for TTS
2. Include proper error handling and loading states
3. Show how to play audio in the browser
4. Provide voice selection options
5. Include retry logic for network issues
6. Make it accessible and user-friendly

API Details:
- Endpoint: https://YOUR_EC2_IP/v1/tts
- Auth: x-api-key header
- Voices: 6 options (Nigerian and US voices)
- Formats: mp3 (recommended for web)
- CORS: Universal support
```

### **For Mobile Development (React Native/Flutter)**

```
The user wants to integrate TTS into their mobile app. Provide a complete solution using the ODIADEV TTS API:

1. Show how to make HTTP requests in their framework
2. Handle audio playback on mobile devices
3. Include proper error handling for mobile networks
4. Provide voice selection UI
5. Handle permissions and audio session management
6. Include offline/retry logic

API Details:
- Endpoint: https://YOUR_EC2_IP/v1/tts
- Auth: x-api-key header
- Voices: 6 options optimized for mobile
- Formats: mp3 (best for mobile)
- CORS: Universal support
```

### **For Backend Development (Node.js/Python/PHP)**

```
The user wants to add TTS to their backend service. Provide a complete integration using the ODIADEV TTS API:

1. Create a service/function for TTS generation
2. Include proper error handling and logging
3. Show how to save/stream audio files
4. Provide voice selection logic
5. Include rate limiting and retry logic
6. Show how to integrate with their existing API

API Details:
- Endpoint: https://YOUR_EC2_IP/v1/tts
- Auth: x-api-key header
- Voices: 6 professional voices
- Formats: All formats supported
- Rate Limits: 60 req/min, 300k chars/day
```

### **For AI/ML Projects**

```
The user wants to integrate TTS into their AI/ML project. Provide a complete solution using the ODIADEV TTS API:

1. Create a Python service for TTS generation
2. Include batch processing capabilities
3. Show how to integrate with their ML pipeline
4. Provide voice selection based on content analysis
5. Include proper error handling and logging
6. Show how to cache and optimize requests

API Details:
- Endpoint: https://YOUR_EC2_IP/v1/tts
- Auth: x-api-key header
- Voices: 6 voices for different use cases
- Formats: All formats supported
- Max Text: 5000 characters per request
```

---

## 🎨 **Voice Selection Prompts**

### **For Business Applications**

```
Help the user select the best voice for their business application. Consider:

1. Professional presentations → us_female_clear
2. Customer service → naija_female_warm
3. Announcements → naija_male_deep
4. Marketing content → naija_female_bold
5. Training materials → us_male_story
6. Conversational apps → naija_male_warm

Provide voice selection logic based on content type and user preferences.
```

### **For Educational Content**

```
Help the user select the best voice for educational content. Consider:

1. Lectures → us_female_clear (clear, professional)
2. Storytelling → us_male_story (engaging, narrative)
3. Instructions → naija_female_warm (friendly, approachable)
4. Announcements → naija_male_deep (authoritative)
5. Interactive content → naija_male_warm (conversational)

Provide voice selection based on content type and audience.
```

### **For Entertainment/Media**

```
Help the user select the best voice for entertainment content. Consider:

1. Podcasts → us_male_story (engaging, narrative)
2. Audiobooks → us_female_clear (clear, professional)
3. Games → naija_female_warm (friendly, energetic)
4. Ads → naija_female_bold (attention-grabbing)
5. News → naija_male_deep (authoritative)

Provide voice selection based on content genre and target audience.
```

---

## 🔧 **Error Handling Prompts**

### **For Network Issues**

```
The user is experiencing network issues with TTS. Provide a robust solution:

1. Implement exponential backoff retry logic
2. Handle timeout errors gracefully
3. Provide fallback options
4. Show proper error messages to users
5. Include network status checking
6. Provide offline mode suggestions

API Details:
- Timeout: 45 seconds
- Retry: 3 attempts with delays
- Error Codes: 400, 401, 500
- CORS: Universal support
```

### **For Authentication Issues**

```
The user is having authentication problems with TTS. Provide a complete solution:

1. Verify API key format and validity
2. Check header configuration
3. Provide key validation logic
4. Show proper error handling
5. Include key rotation support
6. Provide debugging tools

API Details:
- Format: tts_ or odiadev_ + 32 hex chars
- Header: x-api-key (case sensitive)
- Error: 401 for invalid/missing keys
```

---

## 🧪 **Testing Prompts**

### **For Integration Testing**

```
Help the user create comprehensive tests for their TTS integration:

1. Create unit tests for TTS functions
2. Include integration tests with the API
3. Test all voice options
4. Test error scenarios
5. Include performance tests
6. Provide test data and examples

API Details:
- Health Check: GET /v1/health
- Voice List: GET /v1/voices
- TTS: POST /v1/tts
- Test with various text lengths and formats
```

### **For User Acceptance Testing**

```
Help the user create user acceptance tests for TTS functionality:

1. Test voice quality and clarity
2. Test different text types and lengths
3. Test voice selection UI
4. Test error handling and user feedback
5. Test performance and loading times
6. Test accessibility features

Include test scenarios for different user types and use cases.
```

---

## 🚀 **Deployment Prompts**

### **For Production Deployment**

```
Help the user deploy TTS integration to production:

1. Set up proper environment variables
2. Configure API keys securely
3. Set up monitoring and logging
4. Configure error handling and alerts
5. Set up performance monitoring
6. Provide deployment checklist

API Details:
- Endpoint: Use production EC2 IP
- Keys: Store securely in environment
- Monitoring: Track usage and errors
- Rate Limits: Monitor and handle
```

### **For Staging/Development**

```
Help the user set up TTS integration for development:

1. Set up development environment
2. Configure test API keys
3. Set up local testing
4. Configure debugging tools
5. Set up development workflow
6. Provide development guidelines

API Details:
- Use development EC2 instance
- Test with sample data
- Enable debug logging
- Use test API keys
```

---

## 📱 **Framework-Specific Prompts**

### **For Lovable.ai Projects**

```
The user is building a project in Lovable.ai and wants to add TTS. Provide a complete integration:

1. Create a TTS service component
2. Include proper error handling
3. Show how to integrate with Lovable's architecture
4. Provide voice selection UI
5. Include audio playback functionality
6. Make it responsive and accessible

API Details:
- Endpoint: https://YOUR_EC2_IP/v1/tts
- Auth: x-api-key header
- CORS: Universal support
- Voices: 6 options
- Formats: mp3 recommended
```

### **For Vercel/Netlify**

```
The user wants to add TTS to their Vercel/Netlify project. Provide a complete solution:

1. Create API routes for TTS
2. Handle CORS properly
3. Include proper error handling
4. Show how to integrate with their frontend
5. Provide voice selection options
6. Include performance optimization

API Details:
- Endpoint: https://YOUR_EC2_IP/v1/tts
- Auth: x-api-key header
- CORS: Universal support
- Serverless: Compatible with Vercel/Netlify
```

---

## 🎯 **Use Case Specific Prompts**

### **For E-learning Platforms**

```
The user is building an e-learning platform and wants to add TTS. Provide a complete solution:

1. Create TTS components for course content
2. Include voice selection for different subjects
3. Handle long-form content (split text)
4. Include progress indicators
5. Provide accessibility features
6. Include offline capabilities

API Details:
- Endpoint: https://YOUR_EC2_IP/v1/tts
- Max Text: 5000 characters (split longer content)
- Voices: 6 options for different subjects
- Formats: mp3 for web compatibility
```

### **For Customer Service**

```
The user wants to add TTS to their customer service system. Provide a complete solution:

1. Create TTS for automated responses
2. Include voice selection based on customer type
3. Handle different languages and accents
4. Include proper error handling
5. Provide voice customization options
6. Include analytics and monitoring

API Details:
- Endpoint: https://YOUR_EC2_IP/v1/tts
- Voices: 6 options for different scenarios
- Formats: mp3 for phone systems
- Rate Limits: Monitor usage
```

### **For Content Creation**

```
The user wants to add TTS to their content creation platform. Provide a complete solution:

1. Create TTS for blog posts and articles
2. Include voice selection based on content type
3. Handle different content formats
4. Include preview and editing features
5. Provide batch processing capabilities
6. Include content optimization

API Details:
- Endpoint: https://YOUR_EC2_IP/v1/tts
- Max Text: 5000 characters per request
- Voices: 6 options for different content types
- Formats: All formats supported
```

---

## 🔍 **Debugging Prompts**

### **For Common Issues**

```
The user is experiencing issues with their TTS integration. Help them debug:

1. Check API endpoint and authentication
2. Verify request format and headers
3. Test with simple examples
4. Check network connectivity
5. Verify error messages
6. Provide debugging tools and logs

Common Issues:
- CORS errors (API supports universal CORS)
- Authentication errors (check API key format)
- Text length errors (max 5000 characters)
- Network timeouts (implement retry logic)
- Audio playback issues (check MIME types)
```

### **For Performance Issues**

```
The user is experiencing performance issues with TTS. Help them optimize:

1. Implement proper caching strategies
2. Optimize request batching
3. Use appropriate voice selection
4. Implement retry logic
5. Monitor rate limits
6. Provide performance metrics

API Details:
- Rate Limits: 60 req/min, 300k chars/day
- Timeout: 45 seconds
- Retry: 3 attempts with delays
- Caching: Implement client-side caching
```

---

## 📊 **Analytics and Monitoring Prompts**

### **For Usage Tracking**

```
Help the user implement analytics and monitoring for their TTS integration:

1. Track TTS usage and performance
2. Monitor error rates and types
3. Track voice selection patterns
4. Monitor rate limit usage
5. Provide usage dashboards
6. Set up alerts and notifications

API Details:
- Usage logging: Automatic
- Rate limits: 60 req/min, 300k chars/day
- Error tracking: 400, 401, 500 errors
- Performance: Response times and success rates
```

---

## 🎉 **Success Criteria Prompts**

### **For Project Completion**

```
Help the user verify their TTS integration is complete and working:

1. Test all voice options
2. Verify error handling
3. Test with different text lengths
4. Verify audio playback
5. Test on different devices/browsers
6. Verify accessibility features

Success Criteria:
- ✅ All voices working
- ✅ Error handling implemented
- ✅ Audio playback working
- ✅ Responsive design
- ✅ Accessibility compliant
- ✅ Performance optimized
```

---

## 📞 **Support Prompts**

### **For User Support**

```
The user needs help with their TTS integration. Provide comprehensive support:

1. Check their implementation
2. Verify API configuration
3. Test with sample data
4. Provide debugging steps
5. Offer alternative solutions
6. Provide additional resources

Support Resources:
- API Documentation: Complete reference
- Code Examples: Platform-specific
- Testing Tools: Health check and validation
- Error Handling: Comprehensive guide
- Performance: Optimization tips
```

---

## 🎯 **Summary for AI Assistants**

When helping users with TTS integration, always:

1. **Provide complete code examples** for their specific platform
2. **Include proper error handling** and retry logic
3. **Recommend appropriate voices** based on use case
4. **Show testing examples** and validation steps
5. **Explain authentication** and API configuration
6. **Provide troubleshooting** for common issues
7. **Include performance optimization** tips
8. **Ensure accessibility** and user experience

The ODIADEV TTS API is designed to be **universally accessible** and **easy to integrate** into any project requiring high-quality text-to-speech functionality.
