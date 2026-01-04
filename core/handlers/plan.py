# core/handlers/plan.py
from core.protocol.emitter import Emitter

class PlanHandler:
    async def handle(self, query: str, emitter: Emitter, request_id: str):
        emitter.start_request(request_id)

        emitter.emit({
            "type": "content_delta",
            "text": f"📋 Research Plan\n\nQuery: {query}\n\nKey Questions:\n1. What is {query}?\n2. How does it work?\n\nSearch Strategy:\n- Query 1: '{query} definition' → Academic sources\n- Query 2: '{query} examples' → Practical applications\n\nExpected Output: Comprehensive analysis with citations\n\n[Approve to execute in Research Mode, or suggest modifications]"
        })
        emitter.emit({"type": "complete"})
