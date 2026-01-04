# tests/py/test_handlers.py
from core.handlers.chat import ChatHandler

def test_chat_handler_init():
    handler = ChatHandler()
    assert handler is not None
