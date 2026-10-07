import subprocess
import uuid
import os

PIPER_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "piper")
PIPER_EXE = os.path.join(PIPER_DIR, "piper.exe")
VOICE_MODEL = os.path.join(PIPER_DIR, "en_US-lessac-medium.onnx")
AUDIO_OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "audio_output")

os.makedirs(AUDIO_OUTPUT_DIR, exist_ok=True)


def text_to_speech(text: str) -> str:
    """
    Converts text to speech using Piper, saves as a .wav file,
    and returns the filename (not full path) so it can be served back to the frontend.
    """
    filename = f"{uuid.uuid4().hex}.wav"
    output_path = os.path.join(AUDIO_OUTPUT_DIR, filename)

    process = subprocess.run(
        [PIPER_EXE, "--model", VOICE_MODEL, "--output_file", output_path],
        input=text.encode("utf-8"),
        capture_output=True,
    )

    if process.returncode != 0:
        raise RuntimeError(f"Piper failed: {process.stderr.decode('utf-8', errors='ignore')}")

    return filename