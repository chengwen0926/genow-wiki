import type { ReactNode } from "react";
import localFont from "next/font/local";
import type { WikiTreeNode } from "@/lib/wiki";
import { SidebarTree } from "./SidebarTree";
import { MobileNavigation, SearchButton, ThemeToggle } from "./ChromeControls";
import { SearchDialog } from "./SearchDialog";

const brandFont = localFont({
  src: "../public/fonts/modulo/Modulo.otf",
  weight: "400",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
});

export function Brand() { return <a className="brand" href="/" aria-label="Genow 帮助中心首页"><span className={`brand-wordmark ${brandFont.className}`}>Genow</span><span className="brand-divider"/><span>文档</span></a>; }

export function SiteFrame({ tree, activeSlug = "", children, toc, home = false }: { tree: WikiTreeNode[]; activeSlug?: string; children: ReactNode; toc?: ReactNode; home?: boolean }) {
  const navigation = <nav aria-label="文章导航"><a className="nav-home" href="/" aria-current={activeSlug === "" ? "page" : undefined}>帮助中心</a><SidebarTree nodes={tree} activeSlug={activeSlug}/></nav>;
  return <>
    <a className="skip-link" href="#main-content">跳转到正文</a>
    <header className="site-header" data-pagefind-ignore><div className="site-header-inner">
      <div className="header-brand">{!home && <MobileNavigation>{navigation}</MobileNavigation>}<Brand/></div>
      <nav className="header-links" aria-label="站点导航"><a href="/#start">快速开始</a><a href="/#explore">功能指南</a><a href="/#guides">全部文档</a><a href="/wiki/practice/troubleshooting/">常见问题</a></nav>
      <div className="header-actions"><SearchButton/><ThemeToggle/><a className="header-cta" href="/wiki/start/first-image/">开始阅读 <span aria-hidden="true">↗</span></a></div>
    </div></header>
    {home ? <main id="main-content" className="home-main">{children}</main> : <div className="wiki-layout">
      <aside className="wiki-sidebar" data-pagefind-ignore>
        <p className="sidebar-label">使用指南</p>
        <div className="sidebar-navigation">{navigation}</div>
        <div className="sidebar-footer"><span className="status-dot"/>Genow v2 使用指南</div>
      </aside>
      <main id="main-content" className="wiki-main">{children}</main>
      <aside className="right-sidebar" data-pagefind-ignore>{toc}<div className="toc-help">遇到问题？<a href="/wiki/practice/troubleshooting/">查看常见问题 <span aria-hidden="true">↗</span></a></div></aside>
    </div>}
    <SearchDialog/>
    <noscript><style>{`.search-trigger,.theme-toggle,.copy-link,.mobile-menu{display:none!important}@media(max-width:760px){.wiki-sidebar{display:flex;position:static;height:auto}.sidebar-navigation{overflow:visible}}`}</style></noscript>
  </>;
}
