"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { SidebarTree } from "@/components/SidebarTree";
import { WikiContent } from "@/components/WikiContent";
import {
  fetchWikiPage,
  fetchWikiTree,
  type WikiHeading,
  type WikiPageResponse,
  type WikiTreeNode,
} from "@/lib/api";

function formatUpdatedTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

export default function HomePage() {
  const [tree, setTree] = useState<WikiTreeNode[]>([]);
  const [page, setPage] = useState<WikiPageResponse | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        setLoading(true);
        setError(null);
        const treeResponse = await fetchWikiTree();
        if (cancelled) return;

        setTree(treeResponse.tree);
        const nextSlug = treeResponse.default_slug;
        if (!nextSlug) {
          setPage(null);
          setActiveSlug(null);
          return;
        }

        setActiveSlug(nextSlug);
        const nextPage = await fetchWikiPage(nextSlug);
        if (!cancelled) {
          setPage(nextPage);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load the wiki.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSelectPage(slug: string) {
    try {
      setActiveSlug(slug);
      setLoading(true);
      setError(null);
      const nextPage = await fetchWikiPage(slug);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load page.");
    } finally {
      setLoading(false);
    }
  }

  function handleHeadingClick(event: MouseEvent<HTMLAnchorElement>, headingId: string) {
    event.preventDefault();
    const target = document.getElementById(headingId);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${headingId}`);
  }

  return (
    <main className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#030407] p-4 md:p-6">
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          backgroundColor: "rgba(3, 4, 7, 0.24)",
        }}
      />

      <div className="relative z-10 flex h-full w-full max-w-[1440px] flex-col">
        <section className="mx-auto grid h-full w-full max-w-[1340px] flex-1 gap-5 lg:grid-cols-[360px_minmax(0,960px)]">
          <aside className="glass-login-panel animate-enter flex min-h-[260px] flex-col overflow-hidden rounded-[48px] [animation-delay:120ms]">
            <div className="panel-divider border-b px-8 py-8">
              <h1 className="text-3xl font-semibold text-white">GENOW WIKI</h1>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
              {tree.length > 0 ? (
                <SidebarTree nodes={tree} activeSlug={activeSlug} onSelect={handleSelectPage} />
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
                  No wiki pages found in `content/`.
                </div>
              )}
            </div>
          </aside>

          <article className="glass-login-panel animate-enter flex min-h-[260px] min-w-0 flex-col overflow-hidden rounded-[48px] [animation-delay:220ms]">
            <div className="panel-divider border-b px-8 py-8">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <h2 className="text-3xl font-semibold text-white">
                    {page?.title ?? "Loading wiki..."}
                  </h2>
                </div>
                <div className="flex max-w-[420px] flex-col items-end">
                  <div className="flex flex-wrap justify-end gap-2">
                    {page?.headings?.slice(0, 8).map((heading: WikiHeading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        onClick={(event) => handleHeadingClick(event, heading.id)}
                        className="panel-chip rounded-full px-3 py-1.5 text-xs transition hover:border-sky-300/30 hover:bg-sky-300/[0.08] hover:text-white"
                      >
                        {heading.text}
                      </a>
                    ))}
                  </div>
                  {page && (
                    <p className="mt-2 text-right text-[10px] text-slate-500">
                      Last updated {formatUpdatedTime(page.updated_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-8 py-7 md:py-8">
              {loading && !page ? (
                <div className="space-y-4">
                  <div className="h-5 w-32 rounded-full bg-white/10" />
                  <div className="h-4 w-full rounded-full bg-white/[0.06]" />
                  <div className="h-4 w-[88%] rounded-full bg-white/[0.06]" />
                  <div className="h-4 w-[92%] rounded-full bg-white/[0.06]" />
                </div>
              ) : error ? (
                <div className="rounded-3xl border border-rose-300/20 bg-rose-400/10 px-5 py-4 text-sm text-rose-100">
                  {error}
                </div>
              ) : page ? (
                <WikiContent markdown={page.content} />
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 px-5 py-4 text-sm text-slate-400">
                  Choose a page from the directory to start browsing.
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
