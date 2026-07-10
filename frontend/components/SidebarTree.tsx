"use client";

import type { WikiTreeNode } from "@/lib/api";

type SidebarTreeProps = {
  nodes: WikiTreeNode[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
  depth?: number;
};

export function SidebarTree({
  nodes,
  activeSlug,
  onSelect,
  depth = 0,
}: SidebarTreeProps) {
  return (
    <div className="space-y-2">
      {nodes.map((node) => {
        if (node.type === "directory") {
          return (
            <div key={`${depth}-${node.name}`} className="space-y-2">
              <div
                className="px-3 text-[11px] uppercase tracking-[0.24em] text-slate-400/80"
                style={{ paddingLeft: `${depth * 14 + 12}px` }}
              >
                {node.title}
              </div>
              <SidebarTree
                nodes={node.children}
                activeSlug={activeSlug}
                onSelect={onSelect}
                depth={depth + 1}
              />
            </div>
          );
        }

        const isActive = activeSlug === node.slug;

        return (
          <button
            key={node.slug}
            type="button"
            onClick={() => node.slug && onSelect(node.slug)}
            className={`group flex w-full items-center gap-3 rounded-[22px] px-4 py-3.5 text-left transition-all ${
              isActive
                ? "bg-white/[0.08] text-slate-50 shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
                : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.07]"
            }`}
            style={{ marginLeft: `${depth * 10}px`, width: `calc(100% - ${depth * 10}px)` }}
          >
            <span
              className={`h-2 w-2 rounded-full transition-colors ${
                isActive ? "bg-sky-300" : "bg-slate-500 group-hover:bg-slate-300"
              }`}
            />
            <span className="text-sm leading-5">{node.title}</span>
          </button>
        );
      })}
    </div>
  );
}
