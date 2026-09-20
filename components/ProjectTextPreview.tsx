"use client";

import type { ProjectReadingDetails } from "@/data/projects";
import styles from "./ProjectTextPreview.module.css";

type PreviewProject = ProjectReadingDetails & { title: string; chinese: string; copy: string };

export function ProjectTextPreview({ project, open, onKeepOpen, onLeave, onClose }: {
  project: PreviewProject;
  open: boolean;
  onKeepOpen: () => void;
  onLeave: () => void;
  onClose: () => void;
}) {
  return <aside
    id="project-text-preview"
    className={styles.panel}
    data-open={open}
    aria-hidden={!open}
    inert={!open}
    aria-label={`${project.title} 项目信息`}
    onPointerEnter={onKeepOpen}
    onPointerLeave={(event) => { if (!event.currentTarget.contains(document.activeElement)) onLeave(); }}
    onFocus={onKeepOpen}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget) && !event.currentTarget.matches(":hover")) onLeave(); }}
  >
    <div className={styles.heading}>
      <span>PROJECT NOTES / 项目信息</span>
      <button type="button" onClick={onClose} aria-label="关闭文字预览">×</button>
    </div>
    <h2>{project.title}</h2>
    <p className={styles.subtitle}>{project.chinese}</p>
    <p>{project.copy}</p>
    <section><h3>PROCESS / WORKFLOW · 工作流</h3><ol>{project.workflow.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol></section>
    <section><h3>ROLE · 职责</h3><p>{project.role}</p></section>
    <section><h3>TOOLS / TECHNOLOGY · 工具与技术</h3><ul className={styles.tools}>{project.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul></section>
  </aside>;
}
