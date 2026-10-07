from faster_whisper import WhisperModel

# "base" model — good balance of speed and accuracy for CPU. Loaded once, reused across requests.
_model = None


def get_model():
    global _model
    if _model is None:
        _model = WhisperModel("base", device="cpu", compute_type="int8")
    return _model


def transcribe_audio(file_path: str) -> str:
    model = get_model()
    segments, _ = model.transcribe(file_path)
    text = " ".join(segment.text for segment in segments)
    return text.strip()