# tests/py/test_database.py
from core.database.schema import init_db
from pathlib import Path


def test_init_db():
    path = Path("/tmp/test.db")
    conn = init_db(path)
    assert conn is not None
    path.unlink()
