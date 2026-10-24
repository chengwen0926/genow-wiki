import { WikiContent } from "./WikiContent";
import { SiteFrame } from "./SiteFrame";
import { TableOfContents } from "./TableOfContents";
import { CopyLink } from "./ChromeControls";
import type { WikiPage, WikiTreeNode } from "@/lib/wiki";

export function WikiPageView({ tree, page, pages }: { tree: WikiTreeNode[]; page: WikiPage; pages: WikiPage[] }) {
  const headings = page.headings.filter((heading) => heading.level > 1);
  const visible = pages.filter((p) => !p.hidden);
  const index = visible.findIndex((p) => p.slug === page.slug);
  const previous = index > 0 ? visible[index - 1] : null;
  const next = index >= 0 ? visible[index + 1] : null;
  return <SiteFrame tree={tree} activeSlug={page.slug} toc={headings.length ? <TableOfContents headings={headings}/> : undefined}>
    <article className="wiki-article" data-pagefind-body={page.hidden ? undefined : ""}>
      <div className="article-eyebrow" data-pagefind-ignore><span>{page.groupTitle}</span><CopyLink/></div>
      <header className="article-header">
        <h1 data-pagefind-meta="title">{page.title}</h1>
        <p className="article-description">{page.description}</p>
        <span data-pagefind-meta="keywords" data-pagefind-ignore aria-hidden="true" className="sr-only">{page.keywords}</span>
        <div className="article-meta" data-pagefind-ignore><span>Genow v2</span><span>约 {Math.max(1, Math.ceil(page.markdown.length / 500))} 分钟</span>{page.updatedAt && <span>更新于 <time dateTime={page.updatedAt}>{page.updatedAt.slice(0, 10)}</time></span>}</div>
      </header>
      {page.group === "admin" && <div className="notice" data-pagefind-ignore>适用角色：平台管理员。业务功能是否可用，以当前账号权限为准。</div>}
      {headings.length > 0 && <details className="mobile-toc" data-pagefind-ignore><summary>本页内容</summary><ul>{headings.map((h) => <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>)}</ul></details>}
      <WikiContent page={page}/>
      <footer className="article-footer" data-pagefind-ignore><p>模型、参数和可用入口以当前账号界面为准。</p><nav className="page-pagination" aria-label="相邻文章">
        {previous ? <a href={previous.href}><span>← 上一篇</span><strong>{previous.title}</strong></a> : <span/>}
        {next && <a href={next.href}><span>下一篇 →</span><strong>{next.title}</strong></a>}
      </nav></footer>
    </article>
  </SiteFrame>;
}
