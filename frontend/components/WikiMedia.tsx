"use client";

import { useEffect, useRef, useState } from "react";

export function ImageCard({ src, alt, width, height }: {
  src: string; alt: string; width?: number; height?: number;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return <div className="image-frame">
    <button type="button" className="image-button" aria-label={`放大查看：${alt || "图片"}`}
      onClick={() => dialogRef.current?.showModal()}>
      <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
    </button>
    <dialog ref={dialogRef} className="image-dialog" onClick={() => dialogRef.current?.close()}>
      <form method="dialog"><button className="image-close" aria-label="关闭图片">×</button></form>
      <img src={src} alt={alt} width={width} height={height} loading="lazy" />
    </dialog>
  </div>;
}

export function VideoCard({ src, label }: { src: string; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const pauseHidden = () => { if (document.hidden) video.pause(); };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setReady(true);
      else if (!document.fullscreenElement?.contains(video)) video.pause();
    });
    observer.observe(video);
    document.addEventListener("visibilitychange", pauseHidden);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", pauseHidden);
      video.pause();
    };
  }, []);
  return <div className="video-frame">
    <span className="media-label">{label}</span>
    <video ref={videoRef} src={ready ? src : undefined} controls playsInline muted preload="none"
      aria-label={label} onFocus={() => setReady(true)} onPointerDown={() => setReady(true)} />
    <noscript><a href={src}>{label}</a></noscript>
  </div>;
}
