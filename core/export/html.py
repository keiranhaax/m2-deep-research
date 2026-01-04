# core/export/html.py
import html


def export_html(content: str, citations: list[dict]) -> str:
    escaped_content = html.escape(content)
    output = f"<html><body><pre>{escaped_content}</pre></body></html>"

    if citations:
        output = output.replace(
            "</body>",
            "<h2>Citations</h2><ul>"
            + "".join(
                f"<li><a href='{html.escape(c.get('url', ''))}'>{html.escape(c.get('title', 'Untitled'))}</a></li>"
                for c in citations
            )
            + "</ul></body>",
        )

    return output
