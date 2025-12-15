import os
import re
import sys
import time
from urllib.parse import urljoin

from bs4 import BeautifulSoup
from markdownify import markdownify as md
from playwright.sync_api import sync_playwright

# --- CONFIGURATION ---
BASE_URL = "https://deepwiki.com"
IMAGES_DIR_NAME = "images"
# ---------------------


def scrape_deepwiki(start_url, output_dir, project_path):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    images_full_path = os.path.join(output_dir, IMAGES_DIR_NAME)
    if not os.path.exists(images_full_path):
        os.makedirs(images_full_path)

    with sync_playwright() as p:
        print("🚀 Launching browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 1080},
            color_scheme="light",
        )
        page = context.new_page()

        # 1. Visit Overview to get the file list
        print(f"🔍 Visiting: {start_url}")

        # FIX 1: Use 'domcontentloaded' instead of 'networkidle' (much faster/reliable)
        try:
            page.goto(start_url, wait_until="domcontentloaded", timeout=15000)
            # FIX 2: Explicitly wait for the sidebar/links to appear
            page.wait_for_selector(
                'a[href*="/' + project_path.strip("/") + '/"]', timeout=10000
            )
        except Exception as e:
            print(f"⚠️ Initial load warning: {e}. Attempting to proceed...")

        # Extract links
        soup = BeautifulSoup(page.content(), "html.parser")
        links_to_scrape = []
        seen_urls = set()

        # Grab all documentation links
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if project_path in href and "github.com" not in href:
                full_url = urljoin(BASE_URL, href).split("#")[0]
                if full_url not in seen_urls:
                    seen_urls.add(full_url)
                    title = a.get_text(strip=True) or href.split("/")[-1]
                    links_to_scrape.append((title, full_url))

        if not links_to_scrape:
            # Fallback: if we found no links, maybe the page structure is different or empty
            # We add just the start_url to try scraping at least that.
            print(
                "⚠️ No sidebar links found. Attempting to scrape just the overview page."
            )
            links_to_scrape.append(("Overview", start_url))

        print(f"✅ Found {len(links_to_scrape)} pages.")
        print(f"📂 Output Directory: {output_dir}")
        print("Starting capture...\n")

        # 2. Iterate through pages
        for i, (title, url) in enumerate(links_to_scrape):
            print(f"[{i + 1}/{len(links_to_scrape)}] Processing: {title}")

            try:
                # FIX 3: Relaxed wait condition for individual pages
                page.goto(url, wait_until="domcontentloaded", timeout=20000)

                # Wait specifically for content to appear (the most important signal)
                try:
                    page.wait_for_selector("div.prose", state="visible", timeout=10000)
                    # Small buffer to ensure Mermaid JS has time to render the SVG geometry
                    time.sleep(1.5)
                except:
                    print("    ⚠️ Content selector timed out, scraping current state...")

                # --- STEP A: HANDLE DIAGRAMS ---
                diagram_selector = "div.group.relative.cursor-pointer"
                diagrams = page.locator(diagram_selector).all()

                diagram_replacements = {}
                filename_slug = url.strip("/").split("/")[-1]

                if diagrams:
                    print(f"    └── 📸 Screenshotting {len(diagrams)} diagrams...")

                    for idx, diagram in enumerate(diagrams):
                        placeholder_id = f"__DIAGRAM_PLACEHOLDER_{idx}__"
                        image_filename = f"{filename_slug}_diagram_{idx + 1}.png"
                        save_path = os.path.join(images_full_path, image_filename)

                        try:
                            if diagram.is_visible():
                                diagram.scroll_into_view_if_needed()
                                diagram.screenshot(path=save_path)
                                # Inject ID so we can swap it later
                                diagram.evaluate(
                                    f"(el, id) => el.setAttribute('id', id)",
                                    placeholder_id,
                                )
                                diagram_replacements[placeholder_id] = (
                                    f"{IMAGES_DIR_NAME}/{image_filename}"
                                )
                        except Exception as e:
                            print(f"       ⚠️ Diagram screenshot failed: {e}")

                # --- STEP B: EXTRACT TEXT ---
                html_content = page.content()
                page_soup = BeautifulSoup(html_content, "html.parser")

                content = page_soup.select_one("div.prose")
                if not content:
                    content = page_soup.find("main")

                if content:
                    # 1. Replace diagram divs with Images
                    for placeholder_id, rel_path in diagram_replacements.items():
                        target_div = content.find(id=placeholder_id)
                        if target_div:
                            new_img = page_soup.new_tag(
                                "img", src=rel_path, alt="Architecture Diagram"
                            )
                            p_wrapper = page_soup.new_tag("p")
                            p_wrapper.append(new_img)
                            target_div.replace_with(p_wrapper)

                    # 2. Convert to Markdown
                    md_text = md(str(content), heading_style="ATX")

                    # 3. Cleanup
                    md_text = re.sub(
                        r"```\s*(!\[Architecture Diagram\]\(.*\))\s*```",
                        r"\1",
                        md_text,
                        flags=re.DOTALL,
                    )
                    md_text = re.sub(r"\n\s*\n", "\n\n", md_text)

                    # 4. Save
                    file_path = os.path.join(output_dir, f"{filename_slug}.md")
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(f"# {title}\n\n")
                        f.write(f"> Source: {url}\n\n")
                        f.write(md_text)
                else:
                    print(f"    ❌ Content div not found")

            except Exception as e:
                print(f"    ❌ Page processing failed: {e}")

        browser.close()
        print(f"\n✨ DONE! Docs saved to: {os.path.abspath(output_dir)}")


def main():
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        if "/" in arg:
            parts = arg.split("/")
            username = parts[0]
            repo_name = parts[1]
        else:
            print("❌ Invalid format. Usage: python v3_fixed.py username/repo_name")
            return
    else:
        print("Enter details to scrape:")
        username = input("Username (e.g. tashifkhan): ").strip()
        repo_name = input("Repository Name (e.g. agentic-browser): ").strip()

    if not username or not repo_name:
        print("❌ Error: Username and Repo Name are required.")
        return

    base_docs_dir = "docs"
    repo_dir = os.path.join(base_docs_dir, repo_name)

    if os.path.exists(repo_dir):
        output_dir = os.path.join(repo_dir, username)
    else:
        output_dir = repo_dir

    start_url = f"https://deepwiki.com/{username}/{repo_name}/1-overview"
    project_path = f"/{username}/{repo_name}/"

    scrape_deepwiki(start_url, output_dir, project_path)


if __name__ == "__main__":
    main()
