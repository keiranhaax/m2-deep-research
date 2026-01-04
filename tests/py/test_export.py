# tests/py/test_export.py
from core.export.markdown import export_markdown


def test_export_markdown():
    content = "# Test"
    result = export_markdown(content, [])
    assert "# Test" in result
