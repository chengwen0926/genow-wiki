import type { WikiTreeNode } from "@/lib/wiki";
import { pageHref } from "@/lib/markdown.mjs";

export function SidebarTree({ nodes, activeSlug }: { nodes: WikiTreeNode[]; activeSlug: string }) {
  return (
    <ul className="sidebar-tree">
      {nodes.map((node) => (
        <li key={node.slug ?? node.name}>
          {node.type === "directory" ? <>
            <span className="directory-title">{node.title}</span>
            <SidebarTree nodes={node.children} activeSlug={activeSlug} />
          </> : (
            <a href={pageHref(node.slug)} aria-current={node.slug === activeSlug ? "page" : undefined}>
              <span className="nav-dot" aria-hidden="true" />{node.title}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
