# core/database/session.py
import time
from pathlib import Path

from core.database.schema import init_db


class SessionManager:
    def __init__(self, db_path: Path):
        self.db = init_db(db_path)

    def create_session(self, session_id: str):
        now = int(time.time() * 1000)
        self.db.execute(
            "INSERT OR REPLACE INTO sessions (id, created_at, updated_at) VALUES (?, ?, ?)",
            (session_id, now, now),
        )
        self.db.commit()

    def save_request(
        self, request_id: str, session_id: str, mode: str, user_content: str
    ):
        now = int(time.time() * 1000)
        self.db.execute(
            "INSERT INTO requests (id, session_id, mode, user_content, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (request_id, session_id, mode, user_content, "streaming", now),
        )
        self.db.commit()
