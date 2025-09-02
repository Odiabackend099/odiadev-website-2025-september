#!/usr/bin/env bash
set -euo pipefail

# ODIADEV TTS cURL Examples
# Examples for testing all endpoints

echo "🌐 ODIADEV TTS cURL Examples"
echo "=============================="

# Configuration
BASE_URL="${1:-http://localhost:8080}"
API_KEY="${2:-ODIADEV-KEY-777}"

echo "📍 Base URL: $BASE_URL"
echo "🔑 API Key: $API_KEY"
echo ""

# Health Check
echo "🔍 1. Health Check:"
echo "curl $BASE_URL/v1/health"
echo ""

# Voices List
echo "🎭 2. List Available Voices:"
echo "curl -H \"x-api-key: $API_KEY\" $BASE_URL/v1/voices"
echo ""

# TTS Generation Examples
echo "🎵 3. TTS Generation Examples:"
echo ""

echo "   a) Nigerian Female Warm (friendly tone):"
echo "   curl -X POST $BASE_URL/v1/tts \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -H \"x-api-key: $API_KEY\" \\"
echo "     -d '{\"text\": \"How you dey? Welcome to ODIADEV Zone!\", \"voice_id\": \"naija_female_warm\", \"tone\": \"friendly\"}'"
echo ""

echo "   b) Nigerian Male Deep (bold tone):"
echo "   curl -X POST $BASE_URL/v1/tts \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -H \"x-api-key: $API_KEY\" \\"
echo "     -d '{\"text\": \"Attention! This is an important announcement from ODIADEV.\", \"voice_id\": \"naija_male_deep\", \"tone\": \"bold\"}'"
echo ""

echo "   c) US Male Story (calm tone):"
echo "   curl -X POST $BASE_URL/v1/tts \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -H \"x-api-key: $API_KEY\" \\"
echo "     -d '{\"text\": \"Once upon a time, in the heart of Nigeria, there was a company called ODIADEV.\", \"voice_id\": \"us_male_story\", \"tone\": \"calm\"}'"
echo ""

echo "   d) US Female Clear (sales tone):"
echo "   curl -X POST $BASE_URL/v1/tts \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -H \"x-api-key: $API_KEY\" \\"
echo "     -d '{\"text\": \"Don\'t miss out! ODIADEV Zone offers the best solutions for your business needs.\", \"voice_id\": \"us_female_clear\", \"tone\": \"sales\"}'"
echo ""

# Error Testing
echo "🚫 4. Error Testing Examples:"
echo ""

echo "   a) Invalid API Key:"
echo "   curl -H \"x-api-key: invalid-key\" $BASE_URL/v1/voices"
echo ""

echo "   b) Invalid Voice ID:"
echo "   curl -X POST $BASE_URL/v1/tts \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -H \"x-api-key: $API_KEY\" \\"
echo "     -d '{\"text\": \"Test\", \"voice_id\": \"invalid_voice\"}'"
echo ""

echo "   c) Empty Text:"
echo "   curl -X POST $BASE_URL/v1/tts \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -H \"x-api-key: $API_KEY\" \\"
echo "     -d '{\"text\": \"\", \"voice_id\": \"naija_female_warm\"}'"
echo ""

# Advanced Options
echo "⚙️  5. Advanced Options:"
echo ""

echo "   a) Custom Speed and Format:"
echo "   curl -X POST $BASE_URL/v1/tts \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -H \"x-api-key: $API_KEY\" \\"
echo "     -d '{\"text\": \"Custom speed and format test.\", \"voice_id\": \"naija_female_warm\", \"speed\": 0.8, \"format\": \"wav\"}'"
echo ""

echo "   b) Language Tag:"
echo "   curl -X POST $BASE_URL/v1/tts \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -H \"x-api-key: $API_KEY\" \\"
echo "     -d '{\"text\": \"Test with language tag.\", \"voice_id\": \"naija_female_warm\", \"lang\": \"en-NG\"}'"
echo ""

echo "   c) Save to File:"
echo "   curl -X POST $BASE_URL/v1/tts \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -H \"x-api-key: $API_KEY\" \\"
echo "     -d '{\"text\": \"Save this audio to a file.\", \"voice_id\": \"naija_female_warm\"}' \\"
echo "     -o output.mp3"
echo ""

echo "📚 Usage Tips:"
echo "==============="
echo "• Add -v flag for verbose output"
echo "• Use -o filename to save audio to file"
echo "• Add -H \"Accept: audio/mpeg\" for specific content type"
echo "• Use jq for JSON formatting: curl ... | jq '.'"
echo ""
echo "🎯 Quick Test Command:"
echo "======================"
echo "curl -s $BASE_URL/v1/health | jq '.'"
echo ""
echo "🚀 Ready to test your ODIADEV TTS system!"
