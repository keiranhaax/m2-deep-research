# tests/py/test_protocol_types.py
import json
from core.protocol.types import ProtocolEnvelope, Ready

def test_ready_event_serialization():
    ready = Ready(
        type="ready",
        protocol_version="1.0",
        capabilities=["chat", "plan", "research"]
    )
    data = ready.model_dump()
    assert data["type"] == "ready"
