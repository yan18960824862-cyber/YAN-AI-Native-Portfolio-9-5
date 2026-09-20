"use client";

import { useId } from "react";

export const HERO_TOKEN_COLORS = ["#FB5FD0", "#2AEBEC", "#9174F5"];

// These are HTML text duplicates, not rasterized text. SVG supplies only
// the moving alpha mask; the native text/input remains the accessible source.
export function HeroInk({ text }: { text: string }) {
  const id = useId().replace(/:/g, "");
  return <span className="hero-ink" data-hero-ink aria-hidden="true">
    <svg className="hero-ink-defs" width="0" height="0" aria-hidden="true">
      <defs>
        <filter id={`${id}-soft`} x="-100%" y="-100%" width="300%" height="300%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        {HERO_TOKEN_COLORS.map((_, index) => <mask key={index} id={`${id}-${index}`} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width="1" height="1" style={{ maskType: "alpha" }}>
          <path data-hero-mask={index} fill="white" filter={`url(#${id}-soft)`} />
        </mask>)}
      </defs>
    </svg>
    {HERO_TOKEN_COLORS.map((color, index) => <span key={color} className="hero-ink-color" style={{ color, maskImage: `url(#${id}-${index})`, WebkitMaskImage: `url(#${id}-${index})`, textShadow: `0 0 3px ${color}66` }}>
      <span className="hero-ink-copy">{text}</span>
    </span>)}
  </span>;
}
