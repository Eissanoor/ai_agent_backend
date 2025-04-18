import sys
import json
import speech_recognition as sr
from io import BytesIO
import base64

def convert_speech_to_text(audio_data):
    try:
        # Initialize recognizer
        recognizer = sr.Recognizer()
        
        # Convert base64 audio data to audio file
        audio_bytes = base64.b64decode(audio_data)
        audio_file = BytesIO(audio_bytes)
        
        # Use speech recognition
        with sr.AudioFile(audio_file) as source:
            audio = recognizer.record(source)
            text = recognizer.recognize_google(audio)
            return text
            
    except Exception as e:
        return json.dumps({"error": str(e)})

def main():
    # Read input from stdin
    input_data = sys.stdin.read()
    try:
        data = json.loads(input_data)
        audio_data = data.get('audio')
        
        if not audio_data:
            print(json.dumps({"error": "No audio data provided"}))
            return
            
        result = convert_speech_to_text(audio_data)
        print(json.dumps({"text": result}))
        
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
