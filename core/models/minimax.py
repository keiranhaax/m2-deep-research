# core/models/minimax.py
import httpx
import json
from typing import AsyncIterator
from core.models.base import LLMProvider

class MiniMaxProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.minimax.chat/v1/text/chatcompletion_v2"

    async def stream_chat(self, messages: list[dict]) -> AsyncIterator[str]:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.base_url,
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={"messages": messages, "stream": True},
            )
            for line in response.iter_lines():
                if line:
                    yield line.decode()
