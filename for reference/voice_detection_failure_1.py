import sounddevice as sd
from scipy.io.wavfile import write
import numpy as np
import speech_recognition as sr

# -----------------------------
# Settings
# -----------------------------
duration = 7  # seconds, you can increase if needed
fs = 44100    # Sample rate
filename = "temp.wav"

# -----------------------------
# Record audio
# -----------------------------
n = input("Can we start recording? (y/n): ")
if n.lower() == "y":
    print("Recording...")
    audio_data = sd.rec(int(duration * fs), samplerate=fs, channels=1)
    sd.wait()  # Wait until recording is finished
    print("Recording complete.")
    
    # Convert float32 audio to int16 for WAV format
    audio_data_int16 = np.int16(audio_data * 32767)
    write(filename, fs, audio_data_int16)
else:
    print("Recording cancelled.")
    exit()

# -----------------------------
# Speech recognition
# -----------------------------
r = sr.Recognizer()
try:
    with sr.AudioFile(filename) as source:
        audio = r.record(source)  # read the entire audio file
    try:
        # Try recognizing speech using Google
        text = r.recognize_google(audio)
        print("You said:", text)
    except sr.UnknownValueError:
        print("Could not understand the audio.")
    except sr.RequestError as e:
        print(f"Speech recognition service error: {e}")
except Exception as e:
    print(f"Error reading audio file: {e}")
