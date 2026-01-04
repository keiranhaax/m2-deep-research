# core/protocol/handler.py
import asyncio
import json
import sys
from core.handlers.chat import ChatHandler
from core.protocol.emitter import Emitter

class ProtocolHandler:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.emitter = Emitter(session_id)
        self.chat_handler = ChatHandler()

    async def handle_command(self, command: dict):
        if command.get("type") == "heartbeat":
            self.emitter.emit({"type": "heartbeat_ack"})
            return

        if command.get("type") == "chat":
            request_id = command.get("requestId", "req_default")
            query = command.get("content", "")
            await self.chat_handler.handle(query, self.emitter, request_id)
            return
