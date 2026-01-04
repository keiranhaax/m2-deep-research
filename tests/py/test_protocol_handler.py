# tests/py/test_protocol_handler.py
from core.protocol.handler import ProtocolHandler

def test_protocol_handler_init():
    handler = ProtocolHandler(session_id="test")
    assert handler.session_id == "test"
