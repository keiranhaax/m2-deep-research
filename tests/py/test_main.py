# tests/py/test_main.py
def test_main_exists():
    import core.__main__
    assert hasattr(core.__main__, 'main')
