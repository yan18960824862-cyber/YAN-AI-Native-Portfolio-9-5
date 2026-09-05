"use client";

import { useEffect } from "react";

export type FolderProject = {
  number: string;
  id: string;
  category: string;
  title: string;
  chinese: string;
  copy: string[];
  cover: string;
};

export function ProjectFolder({ projects, activeId, onChange, onClose, onOpen }:{
  projects: FolderProject[];
  activeId: string;
  onChange: (id:string) => void;
  onClose: () => void;
  onOpen: (id:string) => void;
}) {
  const active = projects.find((project) => project.id === activeId) ?? projects[0];

  useEffect(() => {
    document.body.classList.add("folder-active");
    const onKey = (event:KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const index = projects.findIndex((project) => project.id === active.id);
        const direction = event.key === "ArrowRight" ? 1 : -1;
        onChange(projects[(index + direction + projects.length) % projects.length].id);
      }
    };
    addEventListener("keydown", onKey);
    return () => { document.body.classList.remove("folder-active"); removeEventListener("keydown", onKey); };
  }, [active.id, onChange, onClose, projects]);

  return <div className="project-folder-overlay" role="dialog" aria-modal="true" aria-label={`${active.title} project archive`}>
    <div className="project-folder">
      <header className="folder-tabs">
        <div className="folder-tab-list" role="tablist">{projects.map((project) => <button key={project.id} role="tab" aria-selected={project.id === active.id} className={project.id === active.id ? "is-active" : ""} onClick={() => onChange(project.id)}><span>{project.number}</span>{project.title}</button>)}</div>
        <button className="folder-close" onClick={onClose} aria-label="Close archive">×</button>
      </header>
      <article key={active.id} className={`folder-sheet folder-sheet-${active.id}`}>
        <div className="folder-visual"><img src={active.cover} alt={`${active.title} cover`} /></div>
        <div className="folder-copy"><p>{active.number} / {active.category}</p><h2>{active.title}</h2><h3>{active.chinese}</h3><div>{active.copy.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><button onClick={() => onOpen(active.id)}>OPEN PROJECT <span>↗</span></button></div>
      </article>
      <footer className="folder-foot"><span>PROJECT ARCHIVE / USE ← → TO SWITCH</span><span>{active.number} / {String(projects.length).padStart(2,"0")}</span></footer>
    </div>
  </div>;
}
