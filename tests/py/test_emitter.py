# tests/py/test_emitter.py
import json
import sys
from io import StringIO
from core.protocol.emitter import Emitter

def test_emit_ready():
    old_stdout = sys.stdout
    sys.stdout = StringIO()

    emitter = Emitter("sess_test")
    emitter.emit_ready()

    output = sys.stdout.getvalue()
    data = json.loads(output.strip())

    sys.stdout = old_stdout
    assert data["type"] == "ready"
    assert data["protocolVersion"] == "1.0"
