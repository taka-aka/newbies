import json
import os

DATA_FILE = "like.json"

def load_like():
    """好感度を読み込む"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if not content:
                    return 0
                return json.loads(content).get("like", 0)
        except json.JSONDecodeError:
            return 0
    return 0

def save_like(like):
    """好感度を保存"""
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump({"like": like}, f, ensure_ascii=False, indent=2)
