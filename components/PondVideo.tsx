"use client";

import { useEffect, useRef, useState } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
// Phones held upright would otherwise see a narrow cover-crop slice of the
// 16:9 cut, so they get a purpose-framed 9:16 encode instead.
const PORTRAIT = "(max-width: 820px) and (orientation: portrait)";

type Layout = { allowMotion: boolean; portrait: boolean };

export function PondVideo() {
  // Null until the media queries are known, so the server never renders the
  // video, reduced-motion visitors never download it, and no phone ever
  // downloads the heavier landscape cut.
  const [layout, setLayout] = useState<Layout | null>(null);
  const [ready, setReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const motion = window.matchMedia(REDUCED_MOTION);
    const portrait = window.matchMedia(PORTRAIT);
    const sync = () =>
      setLayout({ allowMotion: !motion.matches, portrait: portrait.matches });

    sync();
    motion.addEventListener("change", sync);
    portrait.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      portrait.removeEventListener("change", sync);
    };
  }, []);

  const src = layout?.portrait ? "/bg-portrait.mp4" : "/bg.mp4";
  const poster = layout?.portrait
    ? "/bg-poster-portrait.jpg"
    : "/bg-poster.jpg";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setReady(video.readyState >= 3);
    // Safari/iOS can defer autoplay until play() is called on a muted element.
    void video.play().catch(() => {});
  }, [src]);

  return (
    <div className="pond pond--video">
      <div className="pond__still" />

      {layout?.allowMotion ? (
        <video
          key={src}
          ref={videoRef}
          className={`pond__video${ready ? " is-ready" : ""}`}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          onCanPlay={() => setReady(true)}
        />
      ) : null}
    </div>
  );
}
