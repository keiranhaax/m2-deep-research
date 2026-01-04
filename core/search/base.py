# core/search/base.py
from abc import ABC, abstractmethod

class SearchTool(ABC):
    @abstractmethod
    async def search(self, query: str) -> dict:
        """Execute search and return results."""
        pass
