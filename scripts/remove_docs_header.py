import os


def remove_first_four_lines(directory):
    """
    Recursively walks through the directory, finds .md files,
    and removes the first 4 lines from them.
    """
    print(f"Processing directory: {directory}")
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        lines = f.readlines()

                    if len(lines) > 4:
                        new_content = "".join(lines[4:])
                        with open(file_path, "w", encoding="utf-8") as f:
                            f.write(new_content)
                        print(f"Processed: {file_path}")
                    else:
                        print(f"Skipped (less than 5 lines): {file_path}")

                except Exception as e:
                    print(f"Error processing {file_path}: {e}")


if __name__ == "__main__":
    docs_dir = os.path.join(os.getcwd(), "src/data/docs")
    if os.path.exists(docs_dir):
        remove_first_four_lines(docs_dir)
        print("Done.")
    else:
        print(f"Directory not found: {docs_dir}")
