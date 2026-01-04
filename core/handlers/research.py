# core/handlers/research.py
from core.protocol.emitter import Emitter
from core.search.exa import ExaSearch

class ResearchHandler:
    def __init__(self):
        self.search_tool = ExaSearch(api_key="test")

    async def handle(self, query: str, emitter: Emitter, request_id: str):
        emitter.start_request(request_id)

        emitter.emit({
            "type": "phase_status",
            "phase": "planning",
            "status": "working"
        })

        emitter.emit({
            "type": "tool_call",
            "tool": "exa",
            "query": query
        })

        result = await self.search_tool.search(query)

        emitter.emit({
            "type": "tool_result",
            "tool": "exa",
            "success": True,
            "summary": result["summary"]
        })

        emitter.emit({
            "type": "phase_status",
            "phase": "synthesizing",
            "status": "working"
        })

        emitter.emit({
            "type": "content_delta",
            "text": f"Research findings for: {query}\n\n{result['summary']}"
        })

        emitter.emit({"type": "complete"})
