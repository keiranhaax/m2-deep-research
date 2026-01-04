# core/__main__.py
import asyncio
import json
import sys
from core.protocol.handler import ProtocolHandler

async def main():
    handler = ProtocolHandler(session_id="sess_default")

    handler.emitter.emit_ready()

    for line in sys.stdin:
        if line.strip():
            try:
                command = json.loads(line)
                await handler.handle_command(command)
            except json.JSONDecodeError:
                continue

if __name__ == "__main__":
    asyncio.run(main())
