import sounddevice as sd
from scipy.io.wavfile import write

fs = 16000  # Sample rate
seconds = 5  # Recording duration

print("🎤 Speak now...")
audio = sd.rec(int(seconds * fs), samplerate=fs, channels=1)
sd.wait()
write("voice.wav", fs, audio)
print("✅ Recording saved as voice.wav")