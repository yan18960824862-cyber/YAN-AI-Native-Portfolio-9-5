"use client";

import { Play } from "lucide-react";
import { useState } from "react";

type InlineVideoProps = {
  src: string;
  poster: string;
  title: string;
  className?: string;
};

export function InlineVideo({ src, poster, title, className = "" }: InlineVideoProps) {
  const [isMounted, setIsMounted] = useState(false);

  if (isMounted) {
    return <video className={`inline-video ${className}`} src={src} poster={poster} title={title} controls playsInline preload="metadata" />;
  }

  return <button className={`inline-video-poster ${className}`} type="button" onClick={() => setIsMounted(true)} aria-label={`Play ${title}`}><img src={poster} alt={`${title} project cover`} /><span><Play size={15} fill="currentColor" /> PLAY FILM <b>▶</b></span></button>;
}
