# core/search/exa.py
from core.search.base import SearchTool

class ExaSearch(SearchTool):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def search(self, query: str) -> dict:
        return {
            "tool": "exa",
            "query": query,
            "results": [],
            "summary": "Exa search placeholder"
        }
