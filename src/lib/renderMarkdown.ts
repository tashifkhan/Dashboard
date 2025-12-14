import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

export async function renderMarkdownToHtml(markdown: string) {
  const file = await remark()
    .use(remarkGfm) // Support GitHub Flavored Markdown (tables, etc)
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
