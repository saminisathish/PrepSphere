import json
import os
import subprocess
import uuid
from pathlib import Path

from app.ai.text_to_speech import text_to_speech


# --------------------------------------------------
# Paths
# --------------------------------------------------

RHUBARB_PATH = os.getenv(
    "RHUBARB_PATH",
    r"D:\PrepSphere\backend\bin\rhubarb.exe",
)

AUDIO_OUTPUT_DIR = (
    Path(__file__).resolve().parents[2] / "audio_output"
)


# --------------------------------------------------
# Rhubarb -> Avatar Viseme Mapping
# --------------------------------------------------

RHUBARB_TO_VISEME = {
    "A": "viseme_PP",
    "B": "viseme_kk",
    "C": "viseme_E",
    "D": "viseme_aa",
    "E": "viseme_oh",
    "F": "viseme_ou",
    "G": "viseme_FF",
    "H": "viseme_RR",
    "X": "viseme_sil",
}


# --------------------------------------------------
# Generate Viseme Timeline
# --------------------------------------------------

def generate_viseme_timeline(
    wav_path: str,
    dialog_text: str | None = None,
) -> list[dict]:
    """
    Runs Rhubarb Lip Sync on a WAV file and converts
    Rhubarb mouth shapes into avatar visemes.
    """

    wav_path = str(wav_path)

    rhubarb_output = wav_path + ".rhubarb.json"

    # --------------------------------------------------
    # Build Rhubarb command
    # --------------------------------------------------

    command = [
        RHUBARB_PATH,
        "-f",
        "json",
        "-o",
        rhubarb_output,
    ]

    # If dialogue text is provided, create a temporary
    # dialogue file because Rhubarb expects -d to point
    # to a dialogue file.
    dialogue_file = None

    if dialog_text:
        dialogue_file = wav_path + ".txt"

        with open(
            dialogue_file,
            "w",
            encoding="utf-8",
        ) as file:
            file.write(dialog_text)

        command.extend([
            "-d",
            dialogue_file,
        ])

    # WAV file must be the final input argument
    command.append(wav_path)

    # --------------------------------------------------
    # Run Rhubarb
    # --------------------------------------------------

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            raise RuntimeError(
                f"Rhubarb failed:\n{result.stderr}"
            )

        # --------------------------------------------------
        # Read Rhubarb JSON
        # --------------------------------------------------

        with open(
            rhubarb_output,
            "r",
            encoding="utf-8",
        ) as file:
            data = json.load(file)

        cues = []

        for cue in data.get("mouthCues", []):
            cues.append({
                "start": cue["start"],
                "end": cue["end"],
                "viseme": RHUBARB_TO_VISEME.get(
                    cue["value"],
                    "viseme_sil",
                ),
            })

        return cues

    finally:
        # --------------------------------------------------
        # Clean temporary files
        # --------------------------------------------------

        if os.path.exists(rhubarb_output):
            os.remove(rhubarb_output)

        if dialogue_file and os.path.exists(dialogue_file):
            os.remove(dialogue_file)


# --------------------------------------------------
# Piper + Rhubarb
# --------------------------------------------------

def synthesize_speech_with_visemes(text: str) -> dict:
    """
    Uses the existing PrepSphere Piper TTS function,
    then runs Rhubarb on the generated WAV file.

    Returns:

    {
        "audio_id": "...",
        "audio_path": "...",
        "visemes": [...],
        "filename": "..."
    }
    """

    # --------------------------------------------------
    # Generate speech using existing Piper implementation
    # --------------------------------------------------

    filename = text_to_speech(text)

    audio_path = AUDIO_OUTPUT_DIR / filename

    if not audio_path.exists():
        raise FileNotFoundError(
            f"Piper generated audio was not found: {audio_path}"
        )

    # --------------------------------------------------
    # Generate unique audio ID
    # --------------------------------------------------

    audio_id = uuid.uuid4().hex

    # --------------------------------------------------
    # Generate lip-sync timeline
    # --------------------------------------------------

    visemes = generate_viseme_timeline(
        str(audio_path),
        dialog_text=text,
    )

    # --------------------------------------------------
    # Return result
    # --------------------------------------------------

    return {
        "audio_id": audio_id,
        "audio_path": str(audio_path),
        "visemes": visemes,
        "filename": filename,
    }