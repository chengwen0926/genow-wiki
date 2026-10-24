"use client";
import { useEffect, useState } from "react";
import type { WikiHeading } from "@/lib/wiki";

export function TableOfContents({ headings }: { headings: WikiHeading[] }) {
  const [active, setActive] = useState(headings[0]?.id ?? "");
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current = headings[0]?.id ?? "";
        for (const heading of headings) {
          if ((document.getElementById(heading.id)?.getBoundingClientRect().top ?? Infinity) <= 140) current = heading.id;
        }
        setActive(current);
      });
    };
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", update); };
  }, [headings]);
  return <nav aria-label="本页目录" className="article-toc"><p>本页内容</p><ul>{headings.map((heading) => <li key={heading.id} style={{ paddingInlineStart: `${Math.max(0, heading.level - 2) * 12}px` }}>
    <a href={`#${heading.id}`} aria-current={active === heading.id ? "location" : undefined}>{heading.text}</a>
  </li>)}</ul></nav>;
}
