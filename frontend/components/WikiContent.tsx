import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkHeadings } from "@/lib/markdown.mjs";
import type { WikiPage } from "@/lib/wiki";
import { ImageCard, VideoCard } from "./WikiMedia";

function textContent(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textContent).join("");
  if (children && typeof children === "object" && "props" in children) {
    return textContent((children as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

export function WikiContent({ page }: { page: WikiPage }) {
  return <div className="markdown-body">
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkHeadings]} components={{
      h1: ({ id }) => <span id={id} className="title-anchor" />,
      // Media links become block components and must not be nested inside a p.
      p: ({ children }) => <div className="markdown-paragraph">{children}</div>,
      img: ({ src, alt }) => typeof src === "string"
        ? <ImageCard src={src} alt={alt ?? ""} {...(page.images[src] ?? page.images[decodeURI(src)])} /> : null,
      a: ({ href, children }) => href && /\.mp4(?:[?#]|$)/i.test(href)
        ? <VideoCard src={href} label={textContent(children)} />
        : <a href={href}>{children}</a>,
    }}>{page.markdown}</ReactMarkdown>
  </div>;
}
