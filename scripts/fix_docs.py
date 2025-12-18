import os
import re


def fix_content(content):
    # 1. Remove "Relevant source files" sections
    # Matches "Relevant source files" followed by a list of markdown links
    content = re.sub(
        r"^Relevant source files\n(\n\* \[[^\]]+\]\([^\)]+\))*\n",
        "",
        content,
        flags=re.MULTILINE,
    )

    # 2. Fix double code fences
    # Matches nested backticks like ```\n```python\n...\n```\n```
    content = re.sub(
        r"```\s*\n```(\w*)\n([\s\S]*?)\n```\s*\n```", r"```\1\n\2\n```", content
    )

    # 3. Unwrap images
    # Matches images inside code blocks: ```\n![...](...)\n```
    content = re.sub(r"```\s*\n(!\[[^\]]*\]\([^\)]+\))\n```", r"\1", content)

    # 4. Remove AI Source Citations
    # Matches "Sources:" or "**Sources**:" until end of line
    content = re.sub(r"^(\*\*Sources\*\*|Sources):.*$", "", content, flags=re.MULTILINE)

    # 5. Clean up extra whitespace/newlines caused by removals
    content = re.sub(r"\n{3,}", "\n\n", content)

    return content.strip() + "\n"


def process_docs(docs_dir):
    for root, dirs, files in os.walk(docs_dir):
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(root, file)
                print(f"Processing {file_path}...")

                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                fixed_content = fix_content(content)

                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(fixed_content)


if __name__ == "__main__":
    DOCS_DIR = "/Users/taf/Projects/Dashboard/src/data/docs"
    process_docs(DOCS_DIR)
