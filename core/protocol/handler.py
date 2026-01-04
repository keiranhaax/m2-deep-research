# core/protocol/handler.py
import asyncio
import json
import sys
from core.handlers.chat import ChatHandler
from core.handlers.plan import PlanHandler
from core.handlers.research import ResearchHandler
from core.protocol.emitter import Emitter

class ProtocolHandler:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.emitter = Emitter(session_id)
        self.chat_handler = ChatHandler()
        self.plan_handler = PlanHandler()
        self.research_handler = ResearchHandler()

    async def handle_command(self, command: dict):
        cmd_type = command.get("type")

        if cmd_type == "heartbeat":
            self.emitter.emit({"type": "heartbeat_ack"})
            return

        if cmd_type == "set_mode":
            return

        request_id = command.get("requestId", "req_default")
        query = command.get("content", "")

        if cmd_type == "chat":
            await self.chat_handler.handle(query, self.emitter, request_id)
        elif cmd_type == "plan":
            await self.plan_handler.handle(query, self.emitter, request_id)
        elif cmd_type == "research":
            await self.research_handler.handle(query, self.emitter, request_id)
