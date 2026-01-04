# core/handlers/chat.py
from core.models.minimax import MiniMaxProvider
from core.protocol.emitter import Emitter

class ChatHandler:
    def __init__(self):
        self.provider = MiniMaxProvider(api_key="test")

    async def handle(self, query: str, emitter: Emitter, request_id: str):
        emitter.start_request(request_id)

        messages = [{"role": "user", "content": query}]

        emitter.emit({"type": "content_delta", "text": f"Chat mode: {query}"})
        emitter.emit({"type": "complete"})
