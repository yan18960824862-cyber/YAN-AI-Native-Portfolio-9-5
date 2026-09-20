"use client";

import { useEffect, useRef, useState } from "react";
import { InteractiveProjectIcon } from "./InteractiveProjectIcon";

export type PosterProject = { number: string; id: string; title: string; chineseTitle: string; method: string; chineseMethod: string; src: string; anchor: number; side: "left" | "right"; size: "small" | "medium" | "large" };

export const posterProjects: PosterProject[] = [
  { number: "01", id: "space-field", title: "SPACE & FIELD", chineseTitle: "空间与场域主视觉", method: "AI CODING / GENERATIVE VISUAL / REAL-TIME", chineseMethod: "AI 编程 · 生成式视觉 · 实时生成", src: "/assets/project-marks/space-field.svg", anchor: .04, side: "left", size: "large" },
  { number: "02", id: "graduation-vj", title: "GRADUATION VJ", chineseTitle: "毕业展开幕式 VJ 视觉", method: "GENERATIVE VISUAL / AUDIO-REACTIVE / REAL-TIME", chineseMethod: "生成式视觉 · 音频响应 · 实时交互", src: "/assets/project-marks/graduation-vj.svg", anchor: .20, side: "right", size: "medium" },
  { number: "03", id: "scenova", title: "SCENOVA", chineseTitle: "三维扫描无人机", method: "DESIGN EXPLORATION / REFINEMENT / VISUALIZATION", chineseMethod: "方案探索 · 方案深化 · 产品可视化", src: "/assets/project-marks/morning-tea.svg", anchor: .37, side: "left", size: "medium" },
  { number: "04", id: "morning-tea", title: "MORNING TEA ARENA", chineseTitle: "《饮茶争先啦》早茶全运会", method: "CHARACTER GENERATION / IP VISUAL / CULTURAL PRODUCTS", chineseMethod: "角色生成 · IP 视觉 · 文创产品设计", src: "/assets/project-marks/scenova.svg", anchor: .54, side: "right", size: "large" },
  { number: "05", id: "liminal-maze", title: "TOKYO LIGHT & ART FESTIVAL", chineseTitle: "东京光影艺术节", method: "BLENDER 3D / AI VIDEO GENERATION", chineseMethod: "Blender 三维建模 · AI 视频生成", src: "/assets/project-marks/liminal-maze.svg", anchor: .71, side: "left", size: "medium" },
  { number: "06", id: "guozi", title: "GUOZI", chineseTitle: "二手玫瑰《果子》MV", method: "IMAGE GENERATION / VIDEO GENERATION / MUSIC-DRIVEN STORYTELLING", chineseMethod: "AI 生图 · AI 视频生成 · 音乐驱动叙事", src: "/assets/project-marks/guozi.svg", anchor: .88, side: "right", size: "large" },
];

export function LongPoster({ onSelect, activeProject }: { onSelect: (project: PosterProject) => void; activeProject?: string | null }) {
  const sectionRef = useRef<HTMLElement>(null); const [active, setActive] = useState(0);
  useEffect(() => { const update = () => { const section = sectionRef.current; if (!section) return; const rect = section.getBoundingClientRect(); const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, section.offsetHeight - innerHeight))); setActive(posterProjects.reduce((best, project, index) => Math.abs(project.anchor - progress) < Math.abs(posterProjects[best].anchor - progress) ? index : best, 0)); }; update(); addEventListener("scroll", update, { passive: true }); addEventListener("resize", update); return () => { removeEventListener("scroll", update); removeEventListener("resize", update); }; }, []);
  const visibleActive = activeProject ? posterProjects.findIndex((project) => project.id === activeProject) : active;
  return <section ref={sectionRef} id="work" className="long-poster" aria-label="Selected work long poster">
    <p className="poster-title">SELECTED WORK / CLICK A BEAD OBJECT</p>
    <nav className="poster-index" aria-label="Selected work index">{posterProjects.map((project, index) => <button key={project.id} className={visibleActive === index ? "is-active" : ""} onClick={() => document.getElementById(`poster-${project.id}`)?.scrollIntoView({ behavior: "smooth" })}>{project.number}</button>)}</nav>
    {posterProjects.map((project, index) => <article id={`poster-${project.id}`} className={`poster-object poster-object-${project.side} poster-object-${project.size} ${visibleActive === index ? "is-active" : ""}`} key={project.id} onPointerEnter={() => setActive(index)}>
      <button className="bead-object-button" onClick={() => onSelect(project)} aria-label={`Open ${project.title} project tag`}><InteractiveProjectIcon src={project.src} previewSrc={`/assets/project-marks/${project.id}-sticker.png`} /><span className="bead-object-label"><b>{project.number}</b><span className="project-title-en">{project.title}</span><span className="project-title-cn">{project.chineseTitle}</span><small>{project.method}</small><small>{project.chineseMethod}</small></span></button>
    </article>)}
  </section>;
}
