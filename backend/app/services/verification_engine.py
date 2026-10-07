def get_next_difficulty(current_difficulty: str, last_score_percent: float) -> str:
    if last_score_percent >= 80:
        if current_difficulty == "easy":
            return "medium"
        elif current_difficulty == "medium":
            return "hard"
        return "hard"
    elif last_score_percent < 50:
        if current_difficulty == "hard":
            return "medium"
        elif current_difficulty == "medium":
            return "easy"
        return "easy"
    return current_difficulty


def is_verified(score_percent: float) -> bool:
    return score_percent >= 80