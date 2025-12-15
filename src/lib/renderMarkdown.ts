import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";

function remarkMermaid() {
  return (tree: any) => {
    visit(tree, "code", (node: any) => {
      if (node.lang === "mermaid") {
        node.type = "html";
        node.value = `<div class="mermaid">${node.value}</div>`;
      }
    });
  };
}

export async function renderMarkdownToHtml(markdown: string) {
  const file = await remark()
    .use(remarkGfm) // Support GitHub Flavored Markdown (tables, etc)
    .use(remarkMermaid) // Handle mermaid diagrams before turning to HTML
    // markdown -> html AST
    .use(remarkRehype, { allowDangerousHtml: true })
    // code highlighting
    .use(rehypePrettyCode, {
      theme: "github-dark",
      keepBackground: false,
    })
    // html AST -> string
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return String(file);
}
