import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";

// The table of contents and rendered headings share this transformer.
export function remarkHeadings() {
  return (tree) => {
    const used = new Set();
    visit(tree, "heading", (node) => {
      const base = toString(node).toLowerCase()
        .replace(/[^\p{L}\p{N}_\s-]/gu, "").trim().replace(/[-\s]+/g, "-") || "section";
      let id = base;
      let suffix = 1;
      while (used.has(id)) id = `${base}-${suffix++}`;
      used.add(id);
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } };
    });
  };
}

export function parseMarkdown(markdown) {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkHeadings);
  const tree = processor.runSync(processor.parse(markdown));
  const headings = [];
  visit(tree, "heading", (node) => {
    headings.push({ level: node.depth, text: toString(node), id: node.data.hProperties.id });
  });
  return { tree, headings };
}

export function pageHref(slug) {
  return `/wiki/${slug.split("/").map(encodeURIComponent).join("/")}/`;
}
