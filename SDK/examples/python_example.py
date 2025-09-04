#!/usr/bin/env python3
"""
ODIADEV TTS Python SDK Example
Demonstrates various features of the ODIADEV TTS SDK
"""

from odiadev_tts import ODIADEVTTS, VoiceID, AudioFormat, Tone, speak, quick_speak

def main():
    # Your API key
    API_KEY = "your_api_key_here"
    
    print("🎤 ODIADEV TTS Python SDK Example")
    print("=" * 50)
    
    # Initialize client
    print("1. Initializing client...")
    client = ODIADEVTTS(API_KEY)
    
    # Check API health
    print("2. Checking API health...")
    health = client.get_health()
    print(f"   Status: {health['status']}")
    print(f"   Brand: {health['brand']}")
    print(f"   Model: {health['model']}")
    print(f"   Voices: {health['voices']}")
    
    # Get available voices
    print("3. Getting available voices...")
    voices = client.get_voices()
    for voice in voices:
        print(f"   - {voice['voice_id']}: {voice['description']}")
    
    # Example 1: Basic speech generation
    print("4. Generating basic speech...")
    response = client.generate_speech(
        text="Hello Lagos! This is ODIADEV TTS speaking.",
        voice_id=VoiceID.NAIJA_FEMALE_WARM,
        format=AudioFormat.MP3,
        save_to_file="example1_basic.mp3"
    )
    
    if response.success:
        print(f"   ✅ Success! File: {response.file_path}")
        print(f"   📊 Size: {response.file_size} bytes")
        print(f"   ⏱️  Time: {response.processing_time:.2f}s")
    else:
        print(f"   ❌ Error: {response.error_message}")
    
    # Example 2: Different voice and tone
    print("5. Generating speech with different voice and tone...")
    response = client.generate_speech(
        text="Welcome to our Nigerian voice service! How can I help you today?",
        voice_id=VoiceID.NAIJA_MALE_WARM,
        format=AudioFormat.MP3,
        tone=Tone.FRIENDLY,
        speed=1.1,
        save_to_file="example2_friendly.mp3"
    )
    
    if response.success:
        print(f"   ✅ Success! File: {response.file_path}")
    else:
        print(f"   ❌ Error: {response.error_message}")
    
    # Example 3: Bold tone for marketing
    print("6. Generating marketing speech...")
    response = client.generate_speech(
        text="Don't miss out on our amazing Nigerian voice technology! Get started today!",
        voice_id=VoiceID.NAIJA_FEMALE_BOLD,
        format=AudioFormat.MP3,
        tone=Tone.ADS,
        speed=1.2,
        save_to_file="example3_marketing.mp3"
    )
    
    if response.success:
        print(f"   ✅ Success! File: {response.file_path}")
    else:
        print(f"   ❌ Error: {response.error_message}")
    
    # Example 4: US voice for professional content
    print("7. Generating professional content...")
    response = client.generate_speech(
        text="This is a professional demonstration of our text-to-speech technology.",
        voice_id=VoiceID.US_MALE_STORY,
        format=AudioFormat.MP3,
        tone=Tone.NEUTRAL,
        save_to_file="example4_professional.mp3"
    )
    
    if response.success:
        print(f"   ✅ Success! File: {response.file_path}")
    else:
        print(f"   ❌ Error: {response.error_message}")
    
    # Example 5: Using convenience function
    print("8. Using convenience function...")
    response = speak(
        text="This is a quick example using the speak function.",
        api_key=API_KEY,
        voice_id=VoiceID.NAIJA_FEMALE_WARM,
        save_to="example5_convenience.mp3"
    )
    
    if response.success:
        print(f"   ✅ Success! File: {response.file_path}")
    else:
        print(f"   ❌ Error: {response.error_message}")
    
    # Example 6: Quick speak function
    print("9. Using quick speak function...")
    try:
        file_path = quick_speak(
            text="This is the quickest way to generate speech!",
            api_key=API_KEY
        )
        print(f"   ✅ Success! File: {file_path}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Example 7: Different audio formats
    print("10. Testing different audio formats...")
    formats = [AudioFormat.MP3, AudioFormat.WAV, AudioFormat.OPUS]
    
    for fmt in formats:
        response = client.generate_speech(
            text=f"This is a test of {fmt.value} format.",
            voice_id=VoiceID.NAIJA_FEMALE_WARM,
            format=fmt,
            save_to_file=f"example7_{fmt.value}.{fmt.value}"
        )
        
        if response.success:
            print(f"   ✅ {fmt.value.upper()}: {response.file_path} ({response.file_size} bytes)")
        else:
            print(f"   ❌ {fmt.value.upper()}: {response.error_message}")
    
    print("\n🎉 All examples completed!")
    print("Check the generated audio files in the current directory.")

if __name__ == "__main__":
    main()
