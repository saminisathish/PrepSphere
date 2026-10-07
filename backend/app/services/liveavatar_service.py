import os
import requests

LIVEAVATAR_API_URL = "https://api.liveavatar.com"


def create_liveavatar_session() -> str:
    api_key = os.getenv("LIVEAVATAR_API_KEY", "").strip()
    avatar_id = os.getenv("LIVEAVATAR_AVATAR_ID", "").strip()
    is_sandbox = (
        os.getenv("LIVEAVATAR_IS_SANDBOX", "false").strip().lower()
        == "true"
    )

    if not api_key:
        raise RuntimeError("LIVEAVATAR_API_KEY is missing.")

    if not avatar_id:
        raise RuntimeError("LIVEAVATAR_AVATAR_ID is missing.")

    print(
        "LiveAvatar key loaded:",
        bool(api_key),
        "prefix:",
        api_key[:3] + "***"
    )

    payload = {
        "mode": "FULL",
        "avatar_id": avatar_id,
        "avatar_persona": {
            "language": "en"
        },
        "is_sandbox": is_sandbox,
    }

    response = requests.post(
        f"{LIVEAVATAR_API_URL}/v1/sessions/token",
        headers={
            "X-API-KEY": api_key,
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )

    if response.status_code == 401:
        raise RuntimeError(
            "LiveAvatar rejected LIVEAVATAR_API_KEY. "
            "Create/use a valid LiveAvatar Developer API key."
        )

    if not response.ok:
        try:
            error = response.json()
        except Exception:
            error = response.text

        raise RuntimeError(
            f"LiveAvatar API error ({response.status_code}): {error}"
        )

    data = response.json()

    session_token = data.get("data", {}).get("session_token")

    if not session_token:
        raise RuntimeError(
            f"LiveAvatar session_token missing: {data}"
        )

    return session_token