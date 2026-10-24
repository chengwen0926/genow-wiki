"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";

type Match = { url: string; title: string; excerpt: string };
type Result = Match & { pageTitle: string };
type PageData = { url: string; excerpt: string; meta: { title: string }; sub_results: Match[] };
type SearchAPI = { search: (query: string) => Promise<{ results: { data: () => Promise<PageData> }[] }> };
let engine: Promise<SearchAPI> | undefined;
function loadSearch(): Promise<SearchAPI> {
  const path = "/pagefind/pagefind.js";
  return engine ??= import(/* webpackIgnore: true */ path).catch((error) => { engine = undefined; throw error; });
}

function Excerpt({ text }: { text: string }) {
  // Render only the known highlight marker as markup. Everything else is text.
  const decode = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
  return <>{text.split(/(<mark>.*?<\/mark>)/g).map((part, i) => part.startsWith("<mark>")
    ? <mark key={i}>{decode(part.slice(6, -7))}</mark> : decode(part))}</>;
}

export function SearchDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  useEffect(() => {
    const open = () => {
      if (dialog.current?.open) return;
      trigger.current = document.activeElement as HTMLElement;
      dialog.current?.showModal(); setOpened(true); input.current?.focus();
    };
    const keyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); if (dialog.current?.open) dialog.current.close(); else open();
      }
    };
    window.addEventListener("docs-search", open); window.addEventListener("keydown", keyboard);
    return () => { window.removeEventListener("docs-search", open); window.removeEventListener("keydown", keyboard); };
  }, []);
  useEffect(() => {
    if (!opened || !query.trim()) { setResults([]); setStatus("idle"); return; }
    let cancelled = false;
    setStatus("loading"); setResults([]); setActive(0);
    const timer = setTimeout(async () => {
      try {
        const search = await (await loadSearch()).search(query.trim());
        const pages = await Promise.all(search.results.slice(0, 8).map((result) => result.data()));
        if (cancelled) return;
        const matches = pages.flatMap((page) => (page.sub_results?.length ? [...page.sub_results].sort((a, b) => Number(b.title.includes(query.trim())) - Number(a.title.includes(query.trim()))).slice(0, 2) : [{ url: page.url, title: page.meta.title, excerpt: page.excerpt }])
          .map((match) => ({ ...match, pageTitle: page.meta.title })));
        setResults(matches); setTotal(search.results.length); setStatus("ready");
      } catch { if (!cancelled) setStatus("error"); }
    }, 180);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, opened]);
  useEffect(() => { document.getElementById(`search-result-${active}`)?.scrollIntoView({ block: "nearest" }); }, [active]);
  return <dialog ref={dialog} className="search-dialog" aria-label="搜索帮助文档" onClose={() => { setOpened(false); trigger.current?.focus(); }} onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
    <div className="search-input-row"><Icon name="search" size={20}/><input ref={input} autoComplete="off" spellCheck={false} placeholder="搜索功能、操作或问题…" aria-label="搜索文档" value={query}
      role="combobox" aria-autocomplete="list" aria-expanded={results.length > 0} aria-controls="search-results" aria-activedescendant={results.length ? `search-result-${active}` : undefined}
      onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => {
        if (e.nativeEvent.isComposing || !results.length) return;
        if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setActive((i) => (i + (e.key === "ArrowDown" ? 1 : -1) + results.length) % results.length); }
        if (e.key === "Enter") { e.preventDefault(); window.location.assign(results[active].url); }
      }}/><button className="search-close" aria-label="关闭搜索" onClick={() => dialog.current?.close()}>Esc</button></div>
    <div className="search-body">
      {status === "idle" && <div className="search-empty"><p>你想了解什么？</p><div className="suggested-searches">{["参考图", "视频", "工作流", "权限"].map((word) => <button key={word} onClick={() => { setQuery(word); input.current?.focus(); }}>{word}<span>↗</span></button>)}</div></div>}
      <p className="search-status" role="status">{status === "loading" ? "正在查找…" : status === "error" ? "暂时无法搜索，请使用左侧目录，或稍后重新打开搜索。" : status === "ready" ? results.length ? `找到 ${total} 篇相关文档${total > 8 ? "，显示前 8 篇" : ""}` : "没有找到相关文档。试试更短的关键词，如“视频”或“模板”。" : ""}</p>
      <ul id="search-results" role="listbox" aria-label="搜索结果" className="search-results">{results.map((result, i) => <li key={`${result.url}-${i}`} role="presentation"><a id={`search-result-${i}`} role="option" aria-selected={active === i} href={result.url} onMouseEnter={() => setActive(i)}>
        <Icon name="file" size={17}/><div>{result.title !== result.pageTitle && <span className="result-page">{result.pageTitle}</span>}<strong>{result.title}</strong><p><Excerpt text={result.excerpt}/></p></div><span aria-hidden="true">↗</span>
      </a></li>)}</ul>
    </div>
    <footer className="search-footer"><span><kbd>↑</kbd><kbd>↓</kbd> 选择</span><span><kbd>↵</kbd> 打开</span><span>搜索全部使用指南</span></footer>
  </dialog>;
}
