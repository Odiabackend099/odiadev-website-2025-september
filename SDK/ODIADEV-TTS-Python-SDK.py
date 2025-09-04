"""
ODIADEV TTS Python SDK
Professional Text-to-Speech SDK for Nigerian and US English Voices
"""

import requests
import time
import os
import logging
from typing import Optional, Union
from enum import Enum
import uuid

logger = logging.getLogger(__name__)

class VoiceID(Enum):
    NAIJA_MALE_DEEP = "naija_male_deep"
    NAIJA_MALE_WARM = "naija_male_warm"
    NAIJA_FEMALE_WARM = "naija_female_warm"
    NAIJA_FEMALE_BOLD = "naija_female_bold"
    US_MALE_STORY = "us_male_story"
    US_FEMALE_CLEAR = "us_female_clear"

class AudioFormat(Enum):
    MP3 = "mp3"
    WAV = "wav"
    OPUS = "opus"
    AAC = "aac"
    FLAC = "flac"

class Tone(Enum):
    NEUTRAL = "neutral"
    FRIENDLY = "friendly"
    BOLD = "bold"
    CALM = "calm"
    SALES = "sales"
    SUPPORT = "support"
    ADS = "ads"

class ODIADEVTTS:
    def __init__(self, api_key: str, base_url: str = "https://tts-api.odia.dev", **kwargs):
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.timeout = kwargs.get('timeout', 30)
        self.max_retries = kwargs.get('max_retries', 3)
        self.retry_delay = kwargs.get('retry_delay', 1.0)
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'ODIADEV-TTS-Python-SDK/1.0.0',
            'x-api-key': self.api_key,
            'Content-Type': 'application/json'
        })
        
        self._validate_api_key()
        self._test_connection()
    
    def _validate_api_key(self):
        if not self.api_key or len(self.api_key) < 20:
            raise ValueError("Invalid API key format")
        if not self.api_key.startswith('odiadev_'):
            logger.warning("API key doesn't start with 'odiadev_'")
    
    def _test_connection(self):
        try:
            response = self.session.get(f"{self.base_url}/v1/health", timeout=self.timeout)
            response.raise_for_status()
            health_data = response.json()
            logger.info(f"Connected to ODIADEV TTS: {health_data.get('brand', 'Unknown')}")
        except Exception as e:
            logger.error(f"Failed to connect: {e}")
            raise ConnectionError(f"Cannot connect to ODIADEV TTS API: {e}")
    
    def _sanitize_text(self, text: str) -> str:
        if not text or not isinstance(text, str):
            raise ValueError("Text must be a non-empty string")
        
        sanitized = text.strip()
        if len(sanitized) == 0:
            raise ValueError("Text cannot be empty")
        
        if len(sanitized) > 5000:
            sanitized = sanitized[:5000]
            logger.warning("Text truncated to 5000 characters")
        
        return sanitized
    
    def _validate_voice_id(self, voice_id: Union[str, VoiceID]) -> str:
        if isinstance(voice_id, VoiceID):
            return voice_id.value
        
        valid_voices = [v.value for v in VoiceID]
        if voice_id not in valid_voices:
            logger.warning(f"Invalid voice_id '{voice_id}', using default")
            return VoiceID.NAIJA_FEMALE_WARM.value
        
        return voice_id
    
    def _validate_format(self, format: Union[str, AudioFormat]) -> str:
        if isinstance(format, AudioFormat):
            return format.value
        
        valid_formats = [f.value for f in AudioFormat]
        if format not in valid_formats:
            logger.warning(f"Invalid format '{format}', using default")
            return AudioFormat.MP3.value
        
        return format
    
    def _validate_speed(self, speed: float) -> float:
        if not isinstance(speed, (int, float)):
            speed = 1.0
        
        speed = float(speed)
        if speed < 0.5 or speed > 1.5:
            logger.warning(f"Speed {speed} out of range, clamping")
            speed = max(0.5, min(1.5, speed))
        
        return speed
    
    def _make_request(self, request_data: dict, retry_count: int = 0) -> requests.Response:
        try:
            if retry_count > 0:
                time.sleep(self.retry_delay * (2 ** retry_count))
            
            response = self.session.post(
                f"{self.base_url}/v1/tts",
                json=request_data,
                timeout=self.timeout
            )
            
            if response.status_code == 429:
                if retry_count < self.max_retries:
                    retry_after = int(response.headers.get('Retry-After', 60))
                    logger.warning(f"Rate limited, retrying after {retry_after}s")
                    time.sleep(retry_after)
                    return self._make_request(request_data, retry_count + 1)
                else:
                    raise Exception("Rate limit exceeded")
            
            response.raise_for_status()
            return response
            
        except requests.exceptions.Timeout:
            if retry_count < self.max_retries:
                logger.warning(f"Timeout, retrying ({retry_count + 1}/{self.max_retries})")
                time.sleep(self.retry_delay * (2 ** retry_count))
                return self._make_request(request_data, retry_count + 1)
            else:
                raise Exception("Request timeout after max retries")
        
        except requests.exceptions.ConnectionError:
            if retry_count < self.max_retries:
                logger.warning(f"Connection error, retrying ({retry_count + 1}/{self.max_retries})")
                time.sleep(self.retry_delay * (2 ** retry_count))
                return self._make_request(request_data, retry_count + 1)
            else:
                raise Exception("Connection error after max retries")
        
        except requests.exceptions.HTTPError as e:
            if e.response.status_code >= 500 and retry_count < self.max_retries:
                logger.warning(f"Server error {e.response.status_code}, retrying")
                time.sleep(self.retry_delay * (2 ** retry_count))
                return self._make_request(request_data, retry_count + 1)
            else:
                raise e
    
    def generate_speech(self, 
                       text: str,
                       voice_id: Union[str, VoiceID] = VoiceID.NAIJA_FEMALE_WARM,
                       format: Union[str, AudioFormat] = AudioFormat.MP3,
                       speed: float = 1.0,
                       tone: Union[str, Tone] = Tone.NEUTRAL,
                       language: str = "en-NG",
                       save_to_file: Optional[str] = None) -> dict:
        start_time = time.time()
        request_id = str(uuid.uuid4())
        
        try:
            sanitized_text = self._sanitize_text(text)
            voice_id = self._validate_voice_id(voice_id)
            format = self._validate_format(format)
            speed = self._validate_speed(speed)
            
            request_data = {
                "text": sanitized_text,
                "voice_id": voice_id,
                "format": format,
                "speed": speed,
                "tone": tone.value if isinstance(tone, Tone) else tone,
                "lang": language
            }
            
            logger.info(f"Generating speech: {voice_id}, {format}, {len(sanitized_text)} chars")
            
            response = self._make_request(request_data)
            audio_data = response.content
            processing_time = time.time() - start_time
            
            file_path = None
            if save_to_file:
                file_path = self._save_audio(audio_data, save_to_file, format)
            
            return {
                "success": True,
                "audio_data": audio_data,
                "file_path": file_path,
                "request_id": request_id,
                "processing_time": processing_time,
                "file_size": len(audio_data)
            }
            
        except Exception as e:
            logger.error(f"TTS generation failed: {e}")
            return {
                "success": False,
                "error_message": str(e),
                "request_id": request_id,
                "processing_time": time.time() - start_time
            }
    
    def _save_audio(self, audio_data: bytes, file_path: str, format: str) -> str:
        try:
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            if not file_path.lower().endswith(f'.{format}'):
                file_path = f"{file_path}.{format}"
            
            with open(file_path, 'wb') as f:
                f.write(audio_data)
            
            logger.info(f"Audio saved to: {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"Failed to save audio: {e}")
            raise
    
    def get_voices(self) -> list:
        try:
            response = self.session.get(f"{self.base_url}/v1/voices", timeout=self.timeout)
            response.raise_for_status()
            return response.json().get('profiles', [])
        except Exception as e:
            logger.error(f"Failed to get voices: {e}")
            return []
    
    def get_health(self) -> dict:
        try:
            response = self.session.get(f"{self.base_url}/v1/health", timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get health: {e}")
            return {"status": "error", "message": str(e)}

def speak(text: str, api_key: str, voice_id: str = "naija_female_warm", save_to: Optional[str] = None, **kwargs) -> dict:
    client = ODIADEVTTS(api_key, **kwargs)
    return client.generate_speech(text, voice_id, save_to_file=save_to)

def quick_speak(text: str, api_key: str) -> str:
    import tempfile
    with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp:
        response = speak(text, api_key, save_to=tmp.name)
        if response["success"]:
            return response["file_path"]
        else:
            raise Exception(f"TTS failed: {response['error_message']}")

if __name__ == "__main__":
    client = ODIADEVTTS("your_api_key_here")
    response = client.generate_speech(
        text="Hello Lagos! This is ODIADEV TTS speaking.",
        voice_id=VoiceID.NAIJA_FEMALE_WARM,
        format=AudioFormat.MP3,
        save_to_file="output.mp3"
    )
    
    if response["success"]:
        print(f"Audio generated: {response['file_path']}")
        print(f"Size: {response['file_size']} bytes")
    else:
        print(f"Error: {response['error_message']}")