# core/protocol/emitter.py
import sys
import json
import time
from typing import Any


class Emitter:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.request_id: str | None = None
        self.seq = 0

    def start_request(self, request_id: str):
        self.request_id = request_id
        self.seq = 0

    def emit(self, event: dict[str, Any]) -> None:
        """Emit event as single JSON line to stdout."""
        if self.request_id is None:
            raise RuntimeError("No active request")

        self.seq += 1
        envelope = {
            "sessionId": self.session_id,
            "requestId": self.request_id,
            "seq": self.seq,
            "timestamp": int(time.time() * 1000),
            "event": event,
        }

        line = json.dumps(envelope, ensure_ascii=False)
        sys.stdout.write(line + '\n')
        sys.stdout.flush()

    def emit_ready(self):
        """Emit ready event (no envelope)."""
        ready = {
            "type": "ready",
            "protocolVersion": "1.0",
            "capabilities": ["chat", "plan", "research"],
        }
        sys.stdout.write(json.dumps(ready) + '\n')
        sys.stdout.flush()
