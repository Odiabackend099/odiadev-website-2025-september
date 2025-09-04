<?php
/**
 * ODIADEV TTS PHP SDK Example
 * Demonstrates various features of the ODIADEV TTS SDK
 */

require_once '../odiadev-tts-php-sdk.php';

function main() {
    // Your API key
    $API_KEY = 'your_api_key_here';
    
    echo "🎤 ODIADEV TTS PHP SDK Example\n";
    echo str_repeat('=', 50) . "\n";
    
    try {
        // Initialize client
        echo "1. Initializing client...\n";
        $client = new ODIADEVTTS($API_KEY);
        
        // Check API health
        echo "2. Checking API health...\n";
        $health = $client->getHealth();
        echo "   Status: " . $health['status'] . "\n";
        echo "   Brand: " . $health['brand'] . "\n";
        echo "   Model: " . $health['model'] . "\n";
        echo "   Voices: " . $health['voices'] . "\n";
        
        // Get available voices
        echo "3. Getting available voices...\n";
        $voices = $client->getVoices();
        foreach ($voices as $voice) {
            echo "   - " . $voice['voice_id'] . ": " . $voice['description'] . "\n";
        }
        
        // Example 1: Basic speech generation
        echo "4. Generating basic speech...\n";
        $response = $client->generateSpeech([
            'text' => 'Hello Lagos! This is ODIADEV TTS speaking.',
            'voiceId' => ODIADEVTTS::VOICE_NAIJA_FEMALE_WARM,
            'format' => ODIADEVTTS::FORMAT_MP3,
            'saveTo' => './example1_basic.mp3'
        ]);
        
        if ($response['success']) {
            echo "   ✅ Success! File: " . $response['filePath'] . "\n";
            echo "   📊 Size: " . $response['fileSize'] . " bytes\n";
            echo "   ⏱️  Time: " . round($response['processingTime'], 2) . "ms\n";
        } else {
            echo "   ❌ Error: " . $response['errorMessage'] . "\n";
        }
        
        // Example 2: Different voice and tone
        echo "5. Generating speech with different voice and tone...\n";
        $response = $client->generateSpeech([
            'text' => 'Welcome to our Nigerian voice service! How can I help you today?',
            'voiceId' => ODIADEVTTS::VOICE_NAIJA_MALE_WARM,
            'format' => ODIADEVTTS::FORMAT_MP3,
            'tone' => ODIADEVTTS::TONE_FRIENDLY,
            'speed' => 1.1,
            'saveTo' => './example2_friendly.mp3'
        ]);
        
        if ($response['success']) {
            echo "   ✅ Success! File: " . $response['filePath'] . "\n";
        } else {
            echo "   ❌ Error: " . $response['errorMessage'] . "\n";
        }
        
        // Example 3: Bold tone for marketing
        echo "6. Generating marketing speech...\n";
        $response = $client->generateSpeech([
            'text' => 'Don\'t miss out on our amazing Nigerian voice technology! Get started today!',
            'voiceId' => ODIADEVTTS::VOICE_NAIJA_FEMALE_BOLD,
            'format' => ODIADEVTTS::FORMAT_MP3,
            'tone' => ODIADEVTTS::TONE_ADS,
            'speed' => 1.2,
            'saveTo' => './example3_marketing.mp3'
        ]);
        
        if ($response['success']) {
            echo "   ✅ Success! File: " . $response['filePath'] . "\n";
        } else {
            echo "   ❌ Error: " . $response['errorMessage'] . "\n";
        }
        
        // Example 4: US voice for professional content
        echo "7. Generating professional content...\n";
        $response = $client->generateSpeech([
            'text' => 'This is a professional demonstration of our text-to-speech technology.',
            'voiceId' => ODIADEVTTS::VOICE_US_MALE_STORY,
            'format' => ODIADEVTTS::FORMAT_MP3,
            'tone' => ODIADEVTTS::TONE_NEUTRAL,
            'saveTo' => './example4_professional.mp3'
        ]);
        
        if ($response['success']) {
            echo "   ✅ Success! File: " . $response['filePath'] . "\n";
        } else {
            echo "   ❌ Error: " . $response['errorMessage'] . "\n";
        }
        
        // Example 5: Using convenience function
        echo "8. Using convenience function...\n";
        $response = odiadev_speak(
            'This is a quick example using the speak function.',
            $API_KEY,
            [
                'voiceId' => ODIADEVTTS::VOICE_NAIJA_FEMALE_WARM,
                'saveTo' => './example5_convenience.mp3'
            ]
        );
        
        if ($response['success']) {
            echo "   ✅ Success! File: " . $response['filePath'] . "\n";
        } else {
            echo "   ❌ Error: " . $response['errorMessage'] . "\n";
        }
        
        // Example 6: Quick speak function
        echo "9. Using quick speak function...\n";
        try {
            $filePath = odiadev_quick_speak(
                'This is the quickest way to generate speech!',
                $API_KEY,
                './example6_quick.mp3'
            );
            echo "   ✅ Success! File: " . $filePath . "\n";
        } catch (Exception $e) {
            echo "   ❌ Error: " . $e->getMessage() . "\n";
        }
        
        // Example 7: Different audio formats
        echo "10. Testing different audio formats...\n";
        $formats = [ODIADEVTTS::FORMAT_MP3, ODIADEVTTS::FORMAT_WAV, ODIADEVTTS::FORMAT_OPUS];
        
        foreach ($formats as $format) {
            $response = $client->generateSpeech([
                'text' => "This is a test of $format format.",
                'voiceId' => ODIADEVTTS::VOICE_NAIJA_FEMALE_WARM,
                'format' => $format,
                'saveTo' => "./example7_$format.$format"
            ]);
            
            if ($response['success']) {
                echo "   ✅ " . strtoupper($format) . ": " . $response['filePath'] . " (" . $response['fileSize'] . " bytes)\n";
            } else {
                echo "   ❌ " . strtoupper($format) . ": " . $response['errorMessage'] . "\n";
            }
        }
        
        // Example 8: Batch processing
        echo "11. Batch processing multiple texts...\n";
        $texts = [
            'Welcome to our service!',
            'How can I help you today?',
            'Thank you for choosing us!'
        ];
        
        $successCount = 0;
        foreach ($texts as $index => $text) {
            $response = $client->generateSpeech([
                'text' => $text,
                'voiceId' => ODIADEVTTS::VOICE_NAIJA_FEMALE_WARM,
                'format' => ODIADEVTTS::FORMAT_MP3,
                'tone' => ODIADEVTTS::TONE_FRIENDLY,
                'saveTo' => "./batch_" . ($index + 1) . ".mp3"
            ]);
            
            if ($response['success']) {
                $successCount++;
            }
        }
        
        echo "   ✅ Generated $successCount/" . count($texts) . " audio files successfully\n";
        
        echo "\n🎉 All examples completed!\n";
        echo "Check the generated audio files in the current directory.\n";
        
    } catch (Exception $e) {
        echo "❌ Fatal error: " . $e->getMessage() . "\n";
        exit(1);
    }
}

// Run the example
if (basename(__FILE__) === basename($_SERVER['SCRIPT_NAME'])) {
    main();
}
?>
