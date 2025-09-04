#!/usr/bin/env node
/**
 * ODIADEV TTS JavaScript SDK Example
 * Demonstrates various features of the ODIADEV TTS SDK
 */

const { ODIADEVTTS, VOICE_IDS, AUDIO_FORMATS, TONES, speak, quickSpeak } = require('../odiadev-tts-javascript-sdk.js');

async function main() {
    // Your API key
    const API_KEY = 'your_api_key_here';
    
    console.log('🎤 ODIADEV TTS JavaScript SDK Example');
    console.log('='.repeat(50));
    
    try {
        // Initialize client
        console.log('1. Initializing client...');
        const client = new ODIADEVTTS(API_KEY);
        
        // Check API health
        console.log('2. Checking API health...');
        const health = await client.getHealth();
        console.log(`   Status: ${health.status}`);
        console.log(`   Brand: ${health.brand}`);
        console.log(`   Model: ${health.model}`);
        console.log(`   Voices: ${health.voices}`);
        
        // Get available voices
        console.log('3. Getting available voices...');
        const voices = await client.getVoices();
        voices.forEach(voice => {
            console.log(`   - ${voice.voice_id}: ${voice.description}`);
        });
        
        // Example 1: Basic speech generation
        console.log('4. Generating basic speech...');
        let response = await client.generateSpeech({
            text: 'Hello Lagos! This is ODIADEV TTS speaking.',
            voiceId: VOICE_IDS.NAIJA_FEMALE_WARM,
            format: AUDIO_FORMATS.MP3,
            saveTo: './example1_basic.mp3'
        });
        
        if (response.success) {
            console.log(`   ✅ Success! File: ${response.filePath}`);
            console.log(`   📊 Size: ${response.fileSize} bytes`);
            console.log(`   ⏱️  Time: ${response.processingTime}ms`);
        } else {
            console.log(`   ❌ Error: ${response.errorMessage}`);
        }
        
        // Example 2: Different voice and tone
        console.log('5. Generating speech with different voice and tone...');
        response = await client.generateSpeech({
            text: 'Welcome to our Nigerian voice service! How can I help you today?',
            voiceId: VOICE_IDS.NAIJA_MALE_WARM,
            format: AUDIO_FORMATS.MP3,
            tone: TONES.FRIENDLY,
            speed: 1.1,
            saveTo: './example2_friendly.mp3'
        });
        
        if (response.success) {
            console.log(`   ✅ Success! File: ${response.filePath}`);
        } else {
            console.log(`   ❌ Error: ${response.errorMessage}`);
        }
        
        // Example 3: Bold tone for marketing
        console.log('6. Generating marketing speech...');
        response = await client.generateSpeech({
            text: 'Don\'t miss out on our amazing Nigerian voice technology! Get started today!',
            voiceId: VOICE_IDS.NAIJA_FEMALE_BOLD,
            format: AUDIO_FORMATS.MP3,
            tone: TONES.ADS,
            speed: 1.2,
            saveTo: './example3_marketing.mp3'
        });
        
        if (response.success) {
            console.log(`   ✅ Success! File: ${response.filePath}`);
        } else {
            console.log(`   ❌ Error: ${response.errorMessage}`);
        }
        
        // Example 4: US voice for professional content
        console.log('7. Generating professional content...');
        response = await client.generateSpeech({
            text: 'This is a professional demonstration of our text-to-speech technology.',
            voiceId: VOICE_IDS.US_MALE_STORY,
            format: AUDIO_FORMATS.MP3,
            tone: TONES.NEUTRAL,
            saveTo: './example4_professional.mp3'
        });
        
        if (response.success) {
            console.log(`   ✅ Success! File: ${response.filePath}`);
        } else {
            console.log(`   ❌ Error: ${response.errorMessage}`);
        }
        
        // Example 5: Using convenience function
        console.log('8. Using convenience function...');
        response = await speak(
            'This is a quick example using the speak function.',
            API_KEY,
            {
                voiceId: VOICE_IDS.NAIJA_FEMALE_WARM,
                saveTo: './example5_convenience.mp3'
            }
        );
        
        if (response.success) {
            console.log(`   ✅ Success! File: ${response.filePath}`);
        } else {
            console.log(`   ❌ Error: ${response.errorMessage}`);
        }
        
        // Example 6: Quick speak function
        console.log('9. Using quick speak function...');
        try {
            const filePath = await quickSpeak(
                'This is the quickest way to generate speech!',
                API_KEY,
                './example6_quick.mp3'
            );
            console.log(`   ✅ Success! File: ${filePath}`);
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        // Example 7: Different audio formats
        console.log('10. Testing different audio formats...');
        const formats = [AUDIO_FORMATS.MP3, AUDIO_FORMATS.WAV, AUDIO_FORMATS.OPUS];
        
        for (const fmt of formats) {
            response = await client.generateSpeech({
                text: `This is a test of ${fmt} format.`,
                voiceId: VOICE_IDS.NAIJA_FEMALE_WARM,
                format: fmt,
                saveTo: `./example7_${fmt}.${fmt}`
            });
            
            if (response.success) {
                console.log(`   ✅ ${fmt.toUpperCase()}: ${response.filePath} (${response.fileSize} bytes)`);
            } else {
                console.log(`   ❌ ${fmt.toUpperCase()}: ${response.errorMessage}`);
            }
        }
        
        // Example 8: Batch processing
        console.log('11. Batch processing multiple texts...');
        const texts = [
            'Welcome to our service!',
            'How can I help you today?',
            'Thank you for choosing us!'
        ];
        
        const promises = texts.map(async (text, index) => {
            const response = await client.generateSpeech({
                text: text,
                voiceId: VOICE_IDS.NAIJA_FEMALE_WARM,
                format: AUDIO_FORMATS.MP3,
                tone: TONES.FRIENDLY,
                saveTo: `./batch_${index + 1}.mp3`
            });
            return response;
        });
        
        const results = await Promise.all(promises);
        const successCount = results.filter(r => r.success).length;
        console.log(`   ✅ Generated ${successCount}/${texts.length} audio files successfully`);
        
        console.log('\n🎉 All examples completed!');
        console.log('Check the generated audio files in the current directory.');
        
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    }
}

// Run the example
if (require.main === module) {
    main();
}
