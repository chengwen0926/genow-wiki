import type { WikiTreeNode } from "@/lib/wiki";
import { pageHref } from "@/lib/markdown.mjs";

export function SidebarTree({ nodes, activeSlug }: { nodes: WikiTreeNode[]; activeSlug: string }) {
  return <ul className="sidebar-tree">{nodes.map((node) => <li key={node.slug ?? node.name}>
    {node.type === "directory" ? <details className="nav-group" open>
      <summary>{node.title}<span className="chevron" aria-hidden="true">⌄</span></summary>
      <SidebarTree nodes={node.children} activeSlug={activeSlug}/>
    </details> : <a href={pageHref(node.slug)} aria-current={node.slug === activeSlug ? "page" : undefined}>{node.title}</a>}
  </li>)}</ul>;
}
