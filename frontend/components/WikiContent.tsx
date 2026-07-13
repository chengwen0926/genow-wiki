"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type WikiContentProps = {
  markdown: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8002";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\s-]/gu, "")
    .trim()
    .replace(/[-\s]+/g, "-");
}

function flattenChildren(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(flattenChildren).join("");
  }
  if (children && typeof children === "object" && "props" in children) {
    return flattenChildren((children as { props?: { children?: ReactNode } }).props?.children);
  }
  return "";
}

function resolveContentUrl(url: string): string {
  if (url.startsWith("/media/")) {
    return `${API_URL}${url}`;
  }
  return url;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M8 6.5v11l9-5.5-9-5.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M7 6h3v12H7zM14 6h3v12h-3z" />
    </svg>
  );
}

type VideoCardProps = {
  src: string;
  label: string;
};

type ImageCardProps = ComponentPropsWithoutRef<"img">;

function ImageCard({ src, alt, className, ...props }: ImageCardProps) {
  const imageRef = useRef<HTMLImageElement>(null);

  async function toggleFullscreen() {
    const image = imageRef.current;
    if (!image) return;

    if (document.fullscreenElement === image) {
      await document.exitFullscreen();
      return;
    }

    if (image.requestFullscreen) {
      await image.requestFullscreen();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLImageElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    void toggleFullscreen();
  }

  return (
    <img
      ref={imageRef}
      src={src}
      alt={alt ?? ""}
      className={`wiki-image my-6 w-full rounded-[14px] bg-white/[0.02] object-cover shadow-[0_10px_28px_rgba(0,0,0,0.18)] ${className ?? ""}`}
      loading="lazy"
      role="button"
      tabIndex={0}
      aria-label={alt ? `放大查看图片：${alt}` : "放大查看图片"}
      onClick={() => void toggleFullscreen()}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}

function VideoCard({ src, label }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressPercent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;

    const syncPlayState = () => setIsPlaying(!video.paused);
    const syncTime = () => setCurrentTime(video.currentTime);
    const syncDuration = () => setDuration(video.duration || 0);

    const playAttempt = video.play();
    if (playAttempt instanceof Promise) {
      playAttempt.catch(() => {
        setIsPlaying(false);
      });
    }

    video.addEventListener("play", syncPlayState);
    video.addEventListener("pause", syncPlayState);
    video.addEventListener("timeupdate", syncTime);
    video.addEventListener("loadedmetadata", syncDuration);
    video.addEventListener("durationchange", syncDuration);

    return () => {
      video.removeEventListener("play", syncPlayState);
      video.removeEventListener("pause", syncPlayState);
      video.removeEventListener("timeupdate", syncTime);
      video.removeEventListener("loadedmetadata", syncDuration);
      video.removeEventListener("durationchange", syncDuration);
    };
  }, []);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    video.pause();
  }

  function handleSeek(value: string) {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = Number(value);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  async function toggleFullscreen() {
    const frame = frameRef.current;
    if (!frame) return;

    if (document.fullscreenElement === frame) {
      await document.exitFullscreen();
      return;
    }

    if (frame.requestFullscreen) {
      await frame.requestFullscreen();
    }
  }

  return (
    <div className="not-prose my-6">
      {label && <div className="mb-2 text-sm text-slate-400/78">{label}</div>}
      <div
        ref={frameRef}
        className="video-frame group overflow-hidden rounded-[16px] bg-white/[0.02] shadow-[0_14px_34px_rgba(0,0,0,0.22)]"
      >
        <div className="relative">
          <video
            ref={videoRef}
            playsInline
            muted
            loop
            autoPlay
            preload="metadata"
            className="video-element block w-full bg-black/50"
            onClick={toggleFullscreen}
          >
            <source src={src} type="video/mp4" />
            Your browser does not support embedded video playback.
          </video>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#04070d]/74 via-[#04070d]/26 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-3 pb-0.5 pt-9 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:px-4 sm:pb-1 sm:pt-10">
            <div className="video-controls-panel pointer-events-auto flex items-center gap-3 rounded-[14px] px-3 py-2.5">
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="video-control-button relative top-[3px] flex h-7 w-7 shrink-0 items-center justify-center self-center rounded-full text-slate-100/82 transition hover:text-white"
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>

              <div className="min-w-0 flex-1 self-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={Math.min(currentTime, duration || 0)}
                  onChange={(event) => handleSeek(event.target.value)}
                  className="video-progress-slider w-full"
                  style={
                    {
                      "--video-progress": `${progressPercent}%`,
                    } as React.CSSProperties
                  }
                  aria-label="Video progress"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WikiContent({ markdown }: WikiContentProps) {
  return (
    <div className="markdown-body prose prose-invert max-w-none prose-headings:font-semibold prose-headings:text-slate-50 prose-p:text-slate-200/90 prose-p:leading-8 prose-li:text-slate-200/90 prose-strong:text-slate-50 prose-code:text-sky-200 prose-pre:border prose-pre:border-white/10 prose-pre:bg-slate-950/65 prose-blockquote:border-sky-300/30 prose-blockquote:text-slate-300 prose-table:text-slate-200 prose-th:text-slate-50">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <span
              id={slugify(flattenChildren(children))}
              className="block h-0"
              aria-hidden="true"
            />
          ),
          h2: ({ children, ...props }) => (
            <h2 id={slugify(flattenChildren(children))} className="mt-10 mb-4 text-2xl" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 id={slugify(flattenChildren(children))} className="mt-8 mb-3 text-xl" {...props}>
              {children}
            </h3>
          ),
          p: ({ children, ...props }) => (
            <p className="mb-5 text-base leading-8" {...props}>
              {children}
            </p>
          ),
          img: ({ src, ...props }) => (
            <ImageCard
              src={typeof src === "string" ? resolveContentUrl(src) : src}
              {...props}
            />
          ),
          a: ({ children, href, ...props }) => {
            const isVideo = typeof href === "string" && href.toLowerCase().endsWith(".mp4");
            if (isVideo) {
              const label = flattenChildren(children);
              const resolvedHref = resolveContentUrl(href);
              return <VideoCard src={resolvedHref} label={label} />;
            }
            return (
              <a
                href={typeof href === "string" ? resolveContentUrl(href) : href}
                className="text-sky-300 underline decoration-sky-300/40 underline-offset-4"
                {...props}
              >
                {children}
              </a>
            );
          },
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className);
            if (isBlock) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded-md bg-white/[0.08] px-1.5 py-0.5 text-sm" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
