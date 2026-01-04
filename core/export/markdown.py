# core/export/markdown.py
def export_markdown(content: str, citations: list[dict]) -> str:
    output = content

    if citations:
        output += "\n\n## Citations\n"
        for i, c in enumerate(citations, 1):
            output += f"{i}. {c.get('title', 'Untitled')} - {c.get('url', '')}\n"

    return output
