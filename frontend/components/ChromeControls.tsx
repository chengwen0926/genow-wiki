"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icons";

export function SearchButton() {
  return <button type="button" className="search-trigger" aria-label="搜索文档" title="搜索文档（⌘K / Ctrl K）" onClick={() => window.dispatchEvent(new Event("docs-search"))}>
    <Icon name="search" size={15}/><span>搜索文档…</span><kbd>⌘ K</kbd>
  </button>;
}

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const sync = () => setDark(document.documentElement.dataset.theme === "dark");
    sync(); window.addEventListener("docs-theme", sync);
    return () => window.removeEventListener("docs-theme", sync);
  }, []);
  return <button type="button" className="icon-button theme-toggle" aria-label={dark ? "切换浅色模式" : "切换深色模式"} onClick={() => {
    const theme = dark ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("genow-docs-theme", theme); } catch {}
    window.dispatchEvent(new Event("docs-theme"));
  }}><Icon name={dark ? "moon" : "sun"} size={16}/></button>;
}

export function MobileNavigation({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <>
    <button type="button" className="icon-button mobile-menu" aria-label="打开文档导航" onClick={() => dialog.current?.showModal()}><Icon name="menu"/></button>
    <dialog ref={dialog} className="navigation-dialog" aria-label="文档导航" onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="drawer-heading"><span>文档导航</span><button className="icon-button" aria-label="关闭文档导航" onClick={() => dialog.current?.close()}>×</button></div>
      <div onClick={(e) => { if ((e.target as HTMLElement).closest("a")) dialog.current?.close(); }}>{children}</div>
    </dialog>
  </>;
}

export function CopyLink() {
  const [status, setStatus] = useState("");
  return <button className="copy-link" type="button" onClick={async () => {
    try { await navigator.clipboard.writeText(location.href); setStatus("已复制链接"); }
    catch { setStatus("请复制浏览器地址"); }
    setTimeout(() => setStatus(""), 2500);
  }}><Icon name="link" size={14}/><span aria-live="polite">{status || "复制链接"}</span></button>;
}
