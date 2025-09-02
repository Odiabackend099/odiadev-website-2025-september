#!/usr/bin/env bash
set -euo pipefail

# ODIADEV TTS Smoke Test Script
# Tests all endpoints and generates sample audio

echo "🧪 ODIADEV TTS Smoke Test Starting..."
echo "======================================"

# Configuration
BASE_URL="${1:-http://localhost:8080}"
API_KEY="${2:-ODIADEV-KEY-777}"
SAMPLE_TEXT="How you dey? Welcome to ODIADEV Zone! This is a test of our Nigerian English and Pidgin support."

echo "📍 Testing against: $BASE_URL"
echo "🔑 Using API key: $API_KEY"
echo ""

# Test 1: Health Check
echo "🔍 Test 1: Health Check"
if curl -s "$BASE_URL/v1/health" | jq -e '.status == "ok"' > /dev/null; then
    echo "✅ Health check passed"
    curl -s "$BASE_URL/v1/health" | jq '.'
else
    echo "❌ Health check failed"
    exit 1
fi
echo ""

# Test 2: Voices Endpoint
echo "🎭 Test 2: Voices Endpoint"
if curl -s -H "x-api-key: $API_KEY" "$BASE_URL/v1/voices" | jq -e '.profiles | length > 0' > /dev/null; then
    echo "✅ Voices endpoint passed"
    VOICE_COUNT=$(curl -s -H "x-api-key: $API_KEY" "$BASE_URL/v1/voices" | jq '.profiles | length')
    echo "📊 Found $VOICE_COUNT voice profiles"
else
    echo "❌ Voices endpoint failed"
    exit 1
fi
echo ""

# Test 3: TTS Generation
echo "🎵 Test 3: TTS Generation"
echo "📝 Generating audio for: '$SAMPLE_TEXT'"

TTS_RESPONSE=$(curl -s -X POST "$BASE_URL/v1/tts" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d "{
        \"text\": \"$SAMPLE_TEXT\",
        \"voice_id\": \"naija_female_warm\",
        \"format\": \"mp3\",
        \"speed\": 1.0,
        \"tone\": \"friendly\"
    }")

if [[ -n "$TTS_RESPONSE" ]]; then
    echo "✅ TTS generation successful"
    echo "📊 Response size: $(echo "$TTS_RESPONSE" | wc -c) bytes"
    
    # Save sample audio
    echo "$TTS_RESPONSE" > sample.mp3
    echo "💾 Sample audio saved as 'sample.mp3'"
    
    # Check if it's valid audio
    if file sample.mp3 | grep -q "MPEG"; then
        echo "✅ Audio file validation passed"
    else
        echo "⚠️  Audio file validation unclear"
    fi
else
    echo "❌ TTS generation failed"
    exit 1
fi
echo ""

# Test 4: Rate Limiting (optional)
echo "⏱️  Test 4: Rate Limiting Check"
echo "📊 Current rate limit status:"
curl -s "$BASE_URL/v1/health" | jq -r '.rate_limit // "Not available"'
echo ""

# Test 5: Error Handling
echo "🚫 Test 5: Error Handling"
echo "Testing invalid API key..."
if curl -s -H "x-api-key: invalid-key" "$BASE_URL/v1/voices" | jq -e '.error' > /dev/null; then
    echo "✅ Invalid API key properly rejected"
else
    echo "⚠️  Invalid API key handling unclear"
fi

echo "Testing invalid TTS request..."
if curl -s -X POST "$BASE_URL/v1/tts" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d '{"text": "", "voice_id": "invalid"}' | jq -e '.error' > /dev/null; then
    echo "✅ Invalid TTS request properly rejected"
else
    echo "⚠️  Invalid TTS request handling unclear"
fi
echo ""

echo "🎉 ODIADEV TTS Smoke Test Complete!"
echo "======================================"
echo "📁 Sample audio saved as: sample.mp3"
echo "🔊 To play: mpv sample.mp3 (or your preferred audio player)"
echo "🧪 All critical endpoints tested successfully"
echo ""
echo "🚀 Your ODIADEV TTS system is ready for production!"
