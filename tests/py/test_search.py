# tests/py/test_search.py
from core.search.exa import ExaSearch

def test_exa_search_init():
    tool = ExaSearch(api_key="test_key")
    assert tool is not None
    assert tool.api_key == "test_key"
