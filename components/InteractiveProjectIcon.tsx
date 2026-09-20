"use client";

import { useState } from "react";
import styles from "./InteractiveProjectIcon.module.css";

export function InteractiveProjectIcon({ src, previewSrc }: { src: string; previewSrc: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      className={styles.icon}
      data-hovered={hovered}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img src={src} alt="" />
      <span className={styles.preview} aria-hidden="true">
        <img src={previewSrc} alt="" draggable={false} style={{ filter: "none" }} />
      </span>
    </span>
  );
}
