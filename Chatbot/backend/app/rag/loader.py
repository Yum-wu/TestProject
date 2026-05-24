"""
Document loader for RAG system.
Loads Markdown blog posts, parses frontmatter, and splits into chunks.
"""

import os
import re
from typing import List, Dict, Any
from pathlib import Path


def parse_frontmatter(content: str) -> tuple[Dict[str, Any], str]:
    """Parse YAML frontmatter from Markdown content. Return (metadata, body)."""
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)", content, re.DOTALL)
    if not match:
        return {}, content

    frontmatter_text = match.group(1)
    body = match.group(2).strip()

    metadata = {}
    for line in frontmatter_text.strip().split("\n"):
        if ":" in line:
            key, _, value = line.partition(":")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            # Parse lists like tags: [AI, Hermes Agent]
            if value.startswith("[") and value.endswith("]"):
                value = [v.strip().strip('"').strip("'") for v in value[1:-1].split(",")]
            metadata[key] = value

    return metadata, body


def load_markdown_files(articles_dir: str) -> List[Dict[str, Any]]:
    """Load all Markdown files from directory. Return list of {metadata, content, filepath}."""
    docs = []
    path = Path(articles_dir)
    if not path.exists():
        print(f"[RAG] Articles dir not found: {articles_dir}")
        return docs

    for fpath in sorted(path.rglob("*.md")):
        content = fpath.read_text(encoding="utf-8")
        metadata, body = parse_frontmatter(content)
        doc = {
            "metadata": {
                "source": fpath.name,
                "title": metadata.get("title", fpath.stem),
                "slug": metadata.get("slug", fpath.stem),
                "tags": metadata.get("tags", []),
                "category": metadata.get("category", ""),
                "filepath": str(fpath),
            },
            "content": body,
        }
        docs.append(doc)

    print(f"[RAG] Loaded {len(docs)} documents from {articles_dir}")
    return docs
