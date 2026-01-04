# tests/py/test_protocol_modes.py
from core.protocol.handler import ProtocolHandler

def test_handles_all_modes():
    handler = ProtocolHandler(session_id="test")
    assert handler.chat_handler is not None
    assert handler.plan_handler is not None
    assert handler.research_handler is not None
