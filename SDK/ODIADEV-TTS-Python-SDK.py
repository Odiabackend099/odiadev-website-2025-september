# ===========================================
# ODIADEV TTS SDK - Python Version
# ===========================================
# Copy this entire file into your project!

import requests
import json
import os
from typing import Optional, Dict, Any, Union
from dataclasses import dataclass
import tempfile
import subprocess
import platform

@dataclass
class TTSOptions:
    """Configuration options for TTS generation"""
    voice_id: str = "naija_female_warm"
    format: str = "mp3"
    speed: float = 1.0
    tone: str = "friendly"
    lang: str = "en-NG"

class ODIADEVTTS:
    """
    ODIADEV TTS Python SDK
    
    Features:
    - Nigerian accent injection for naija_ voices
    - Multiple voice profiles (male/female, Nigerian/US)
    - Tone control (friendly, bold, calm, sales, support, ads)
    - Multiple audio formats (mp3, wav, opus, aac, flac)
    - Speed control (0.5x to 1.5x)
    - Auto-play and download capabilities
    """
    
    def __init__(self, api_key: str, base_url: str = "https://tts-api.odia.dev"):
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        
        # Available voice profiles
        self.voices = {
            "naija_male_deep": "Nigerian male, deep & calm authority",
            "naija_female_warm": "Nigerian female, warm & lively",
            "naija_female_bold": "Nigerian female, bold & confident",
            "us_male_story": "US male, calm storyteller"
        }
        
        # Available tones
        self.tones = {
            "friendly": "Warm, welcoming, light Pidgin",
            "bold": "Confident, authoritative",
            "calm": "Steady, relaxed",
            "sales": "Persuasive, upbeat",
            "support": "Empathetic, reassuring",
            "ads": "Catchy, punchy"
        }
        
        # Available formats
        self.formats = ["mp3", "wav", "opus", "aac", "flac"]
        
        # Headers for API requests
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key
        }
    
    def generate_speech(self, text: str, options: Optional[TTSOptions] = None) -> bytes:
        """
        Generate speech from text with Nigerian accent injection
        
        Args:
            text: Text to convert to speech (1-5000 characters)
            options: TTS configuration options
            
        Returns:
            Audio data as bytes
            
        Raises:
            ValueError: If text is invalid
            requests.RequestException: If API request fails
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        if len(text) > 5000:
            raise ValueError("Text cannot exceed 5000 characters")
        
        # Use default options if none provided
        if options is None:
            options = TTSOptions()
        
        # Validate options
        if options.voice_id not in self.voices:
            raise ValueError(f"Invalid voice_id. Available: {list(self.voices.keys())}")
        
        if options.format not in self.formats:
            raise ValueError(f"Invalid format. Available: {self.formats}")
        
        if not 0.5 <= options.speed <= 1.5:
            raise ValueError("Speed must be between 0.5 and 1.5")
        
        if options.tone not in self.tones:
            raise ValueError(f"Invalid tone. Available: {list(self.tones.keys())}")
        
        # Prepare request payload
        payload = {
            "text": text.strip(),
            "voice_id": options.voice_id,
            "format": options.format,
            "speed": options.speed,
            "tone": options.tone,
            "lang": options.lang
        }
        
        # Make API request
        url = f"{self.base_url}/v1/tts"
        response = requests.post(url, headers=self.headers, json=payload)
        
        if response.status_code != 200:
            try:
                error_data = response.json()
                error_msg = error_data.get("error", "Unknown error")
            except:
                error_msg = f"HTTP {response.status_code}"
            
            raise requests.RequestException(f"TTS generation failed: {error_msg}")
        
        return response.content
    
    def get_voices(self) -> Dict[str, Any]:
        """
        Get available voice profiles
        
        Returns:
            Dictionary containing voice profiles and metadata
        """
        url = f"{self.base_url}/v1/voices"
        response = requests.get(url, headers={"x-api-key": self.api_key})
        
        if response.status_code != 200:
            raise requests.RequestException(f"Failed to get voices: HTTP {response.status_code}")
        
        return response.json()
    
    def check_health(self) -> Dict[str, Any]:
        """
        Check API health status
        
        Returns:
            Dictionary containing health information
        """
        url = f"{self.base_url}/v1/health"
        response = requests.get(url)
        
        if response.status_code != 200:
            raise requests.RequestException(f"Health check failed: HTTP {response.status_code}")
        
        return response.json()
    
    def save_audio(self, audio_data: bytes, filename: str, format: str = "mp3") -> str:
        """
        Save audio data to file
        
        Args:
            audio_data: Audio data as bytes
            filename: Output filename (without extension)
            format: Audio format
            
        Returns:
            Path to saved file
        """
        # Ensure filename has correct extension
        if not filename.endswith(f".{format}"):
            filename = f"{filename}.{format}"
        
        # Save file
        with open(filename, "wb") as f:
            f.write(audio_data)
        
        return filename
    
    def play_audio(self, audio_data: bytes, format: str = "mp3") -> bool:
        """
        Play audio data using system default player
        
        Args:
            audio_data: Audio data as bytes
            format: Audio format
            
        Returns:
            True if playback started successfully
        """
        try:
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix=f".{format}", delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            # Determine system and play command
            system = platform.system().lower()
            
            if system == "darwin":  # macOS
                subprocess.run(["open", temp_file_path], check=True)
            elif system == "linux":
                subprocess.run(["xdg-open", temp_file_path], check=True)
            elif system == "windows":
                os.startfile(temp_file_path)
            else:
                print(f"Audio saved to: {temp_file_path}")
                print("Please play manually using your system's audio player")
                return False
            
            return True
            
        except Exception as e:
            print(f"Failed to play audio: {e}")
            return False
    
    def download_audio(self, audio_data: bytes, filename: str, format: str = "mp3") -> str:
        """
        Download audio file (alias for save_audio)
        
        Args:
            audio_data: Audio data as bytes
            filename: Output filename (without extension)
            format: Audio format
            
        Returns:
            Path to saved file
        """
        return self.save_audio(audio_data, filename, format)
    
    def get_voice_info(self, voice_id: str) -> Optional[str]:
        """
        Get description for a specific voice
        
        Args:
            voice_id: Voice identifier
            
        Returns:
            Voice description or None if not found
        """
        return self.voices.get(voice_id)
    
    def get_tone_info(self, tone: str) -> Optional[str]:
        """
        Get description for a specific tone
        
        Args:
            tone: Tone identifier
            
        Returns:
            Tone description or None if not found
        """
        return self.tones.get(tone)
    
    def list_voices(self) -> Dict[str, str]:
        """
        List all available voices
        
        Returns:
            Dictionary mapping voice IDs to descriptions
        """
        return self.voices.copy()
    
    def list_tones(self) -> Dict[str, str]:
        """
        List all available tones
        
        Returns:
            Dictionary mapping tone IDs to descriptions
        """
        return self.tones.copy()
    
    def list_formats(self) -> list:
        """
        List all available audio formats
        
        Returns:
            List of supported audio formats
        """
        return self.formats.copy()

# ===========================================
# USAGE EXAMPLES - Copy & Paste Ready
# ===========================================

def example_basic_usage():
    """Basic usage example"""
    # Initialize TTS
    tts = ODIADEVTTS("YOUR_API_KEY_HERE")
    
    # Generate speech with default options
    try:
        audio_data = tts.generate_speech(
            "Welcome to our platform! This is a warm Nigerian female voice speaking."
        )
        
        # Save and play
        filename = tts.save_audio(audio_data, "welcome_speech")
        print(f"Audio saved to: {filename}")
        
        # Play audio
        tts.play_audio(audio_data)
        
    except Exception as e:
        print(f"Error: {e}")

def example_advanced_usage():
    """Advanced usage with custom options"""
    # Initialize TTS
    tts = ODIADEVTTS("YOUR_API_KEY_HERE")
    
    # Create custom options
    options = TTSOptions(
        voice_id="naija_male_deep",
        format="wav",
        speed=1.2,
        tone="bold"
    )
    
    try:
        # Generate speech
        audio_data = tts.generate_speech(
            "This is a deep Nigerian male voice with authority and presence.",
            options
        )
        
        # Download with custom filename
        filename = tts.download_audio(audio_data, "nigerian_male_speech", "wav")
        print(f"Audio downloaded to: {filename}")
        
    except Exception as e:
        print(f"Error: {e}")

def example_batch_generation():
    """Generate multiple audio files with different voices"""
    # Initialize TTS
    tts = ODIADEVTTS("YOUR_API_KEY_HERE")
    
    # Text samples
    texts = [
        "Welcome message with warm Nigerian female voice.",
        "Announcement with deep Nigerian male authority.",
        "Story narration with calm US male voice."
    ]
    
    # Voice configurations
    configs = [
        TTSOptions(voice_id="naija_female_warm", tone="friendly"),
        TTSOptions(voice_id="naija_male_deep", tone="bold"),
        TTSOptions(voice_id="us_male_story", tone="calm")
    ]
    
    # Generate all
    for i, (text, config) in enumerate(zip(texts, configs)):
        try:
            audio_data = tts.generate_speech(text, config)
            filename = tts.save_audio(audio_data, f"sample_{i+1}")
            print(f"Generated: {filename}")
        except Exception as e:
            print(f"Failed to generate sample {i+1}: {e}")

def example_api_info():
    """Get API information and available options"""
    # Initialize TTS
    tts = ODIADEVTTS("YOUR_API_KEY_HERE")
    
    try:
        # Check health
        health = tts.check_health()
        print("API Health:", json.dumps(health, indent=2))
        
        # Get available voices
        voices = tts.get_voices()
        print("Available Voices:", json.dumps(voices, indent=2))
        
        # List local options
        print("Local Voice Options:", tts.list_voices())
        print("Available Tones:", tts.list_tones())
        print("Audio Formats:", tts.list_formats())
        
    except Exception as e:
        print(f"Error: {e}")

# ===========================================
# QUICK START TEMPLATE
# ===========================================

def quick_start_template():
    """
    Copy this function and modify for your project!
    """
    # 1. Replace with your API key
    API_KEY = "your_api_key_here"
    
    # 2. Initialize TTS
    tts = ODIADEVTTS(API_KEY)
    
    # 3. Generate speech
    text = "Your text here"
    options = TTSOptions(
        voice_id="naija_female_warm",  # Choose voice
        tone="friendly",               # Choose tone
        format="mp3",                 # Choose format
        speed=1.0                     # Choose speed
    )
    
    try:
        # Generate audio
        audio_data = tts.generate_speech(text, options)
        
        # Save to file
        filename = tts.save_audio(audio_data, "my_speech")
        print(f"Audio saved to: {filename}")
        
        # Play audio
        tts.play_audio(audio_data)
        
    except Exception as e:
        print(f"TTS Error: {e}")

# ===========================================
# MAIN EXECUTION (for testing)
# ===========================================

if __name__ == "__main__":
    print("🎤 ODIADEV TTS Python SDK")
    print("=" * 40)
    
    # Check if API key is set
    api_key = os.getenv("ODIADEV_API_KEY")
    if not api_key:
        print("⚠️  Set ODIADEV_API_KEY environment variable to test")
        print("Example: export ODIADEV_API_KEY='your_key_here'")
        print("\n📚 SDK is ready to use in your projects!")
    else:
        print("✅ API key found, running examples...")
        print("\n1. Basic usage:")
        example_basic_usage()
        
        print("\n2. API information:")
        example_api_info()
        
        print("\n3. Available options:")
        tts = ODIADEVTTS(api_key)
        print("Voices:", list(tts.list_voices().keys()))
        print("Tones:", list(tts.list_tones().keys()))
        print("Formats:", tts.list_formats())

# ===========================================
# INSTALLATION REQUIREMENTS
# ===========================================
"""
Install required packages:
pip install requests

Optional for audio playback:
- macOS: No additional packages needed
- Linux: xdg-utils (sudo apt-get install xdg-utils)
- Windows: No additional packages needed
"""
