# tests/py/test_minimax.py
from core.models.minimax import MiniMaxProvider

def test_minimax_init():
    provider = MiniMaxProvider(api_key="test_key")
    assert provider.api_key == "test_key"
