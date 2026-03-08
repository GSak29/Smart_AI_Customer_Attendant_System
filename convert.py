import whisper

model = whisper.load_model("base")

result = model.transcribe("voice.wav", language="en")  # Tamil

print("Detected language:", result["language"])
print("Text:", result["text"])