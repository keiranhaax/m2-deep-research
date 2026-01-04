# tests/py/test_research_handler.py
from core.handlers.research import ResearchHandler

def test_research_handler():
    handler = ResearchHandler()
    assert handler is not None
