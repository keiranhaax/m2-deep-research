# tests/py/test_plan_handler.py
from core.handlers.plan import PlanHandler

def test_plan_handler():
    handler = PlanHandler()
    assert handler is not None
