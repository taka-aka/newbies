import json
import os

TOKEN_FILE = "token_db.json"

def save_token(token):
    with open(TOKEN_FILE, "w", encoding="utf-8") as f:
        json.dump({"token": token}, f, ensure_ascii=False, indent=2)

def load_tokens():
    if os.path.exists(TOKEN_FILE):
        try:
            with open(TOKEN_FILE, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if not content:
                    return []  # 空ファイルなら空リストを返す
                return json.loads(content)
        except json.JSONDecodeError:
            return []  # JSON 壊れてたら空リストで復旧
    return []
