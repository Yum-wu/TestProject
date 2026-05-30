#!/usr/bin/env python3
"""Sync blog posts to Aureon via API."""
import os
import sys
import yaml
from pathlib import Path
import requests


def parse_frontmatter(content: str):
    """Parse YAML frontmatter from markdown."""
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            metadata = yaml.safe_load(parts[1])
            body = parts[2].strip()
            return metadata, body
    return {}, content


def detect_language(content: str, frontmatter_lang: str = None) -> str:
    """Detect document language."""
    if frontmatter_lang in ("zh", "en"):
        return frontmatter_lang
    import re
    cjk_count = len(re.findall(r"[一-鿿]", content[:500]))
    return "zh" if cjk_count > 20 else "en"


def main():
    aureon_url = os.getenv("AUREON_API_URL")
    api_key = os.getenv("AUREON_API_KEY")

    if not aureon_url:
        print("Error: AUREON_API_URL not set")
        sys.exit(1)

    posts_dir = Path("client/src/content/posts")
    if not posts_dir.exists():
        print("Posts directory not found")
        sys.exit(0)

    count = 0
    for md_file in posts_dir.rglob("*.md"):
        content = md_file.read_text(encoding="utf-8")
        metadata, body = parse_frontmatter(content)
        lang = detect_language(body, metadata.get("lang"))

        files = {"file": (md_file.name, body.encode("utf-8"), "text/markdown")}
        data = {
            "language": lang,
            "title": metadata.get("title", md_file.stem),
        }

        # 添加 API Key（如果配置了）
        if api_key:
            data["api_key"] = api_key

        try:
            response = requests.post(
                f"{aureon_url}/api/rag/upload",
                files=files, data=data, timeout=30
            )
            if response.status_code == 200:
                count += 1
                print(f"✓ Synced: {md_file.name} ({lang})")
            else:
                print(f"✗ Failed: {md_file.name} - {response.status_code}")
        except Exception as e:
            print(f"✗ Error: {md_file.name} - {e}")

    print(f"\nTotal synced: {count} files")


if __name__ == "__main__":
    main()
