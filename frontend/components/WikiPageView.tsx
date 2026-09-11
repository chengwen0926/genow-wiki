import { SidebarTree } from "./SidebarTree";
import { WikiContent } from "./WikiContent";
import type { WikiPage, WikiTreeNode } from "@/lib/wiki";

export function WikiPageView({ tree, page }: { tree: WikiTreeNode[]; page: WikiPage }) {
  const headings = page.headings.filter((heading) => heading.level > 1);
  return (
    <main className="wiki-layout">
      <aside className="wiki-sidebar">
        <a className="brand" href="/">GENOW WIKI</a>
        <nav aria-label="文章导航"><SidebarTree nodes={tree} activeSlug={page.slug} /></nav>
      </aside>
      <article className="wiki-article">
        <header className="article-header">
          <h1>{page.title}</h1>
          {page.updatedAt && <p className="updated-at">更新于 <time dateTime={page.updatedAt}>{page.updatedAt.slice(0, 10)}</time></p>}
          {headings.length > 0 && <details className="article-toc">
            <summary>本文目录</summary>
            <nav aria-label="章节目录"><ul>{headings.map((heading) => (
              <li key={heading.id} style={{ paddingInlineStart: `${(heading.level - 2) * 12}px` }}>
                <a href={`#${heading.id}`}>{heading.text}</a>
              </li>
            ))}</ul></nav>
          </details>}
        </header>
        <WikiContent page={page} />
      </article>
    </main>
  );
}
