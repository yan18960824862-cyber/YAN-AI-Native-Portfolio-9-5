"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Slider } from "@/components/ui/slider";
import { BeadGlyph } from "./BeadGlyph";

const chapters = [
  { id: "form", eyebrow: "Y / FORM · AI ROLE / NOT USED FOR TYPE GENERATION", title: "字，还是先自己排。", body: ["AI 能很快生成拼豆字，但生成出来的字通常太整齐，也太像模板。", "我先在 Figma 里整理出可以反复组合的拼豆模块，再自己调整每个字的重心、方向、疏密和叠色。确认字形后，再导出 SVG。"] },
  { id: "space", eyebrow: "A / SPACE · AI ROLE / TOOL BUILDING", title: "我不想每改一次字，就重新建一次模。", body: ["如果直接用 AI 生图，效果很难和原设计对准；用传统三维软件重新搭，字形一改，模型也要跟着重做。", "所以我用 AI 协助搭了一个 SVG 解析工具，让圆点的位置和颜色直接变成三维圆柱。字改了，立体效果也可以跟着更新。"] },
  { id: "motion", eyebrow: "N / MOTION · AI ROLE / MOTION CO-CODING", title: "我需要的是能继续改的运动，不是一段碰巧好看的视频。", body: ["AI 视频可以很快看到运动方向，但轨迹、节奏和镜头很难稳定复现。", "我用 AI 协助把波浪、爆炸、重力和鼠标反馈写成参数。换一个字形，原来的运动规则仍然可以继续使用。"] },
];

type Motion = { depth: number; wave: number; speed: number; gravity: number; interaction: number };

function Scene({ active, motion }: { active: number; motion: Motion }) {
  const { pointer, viewport } = useThree();
  const worldPointer = useMemo(() => new THREE.Vector2(), []);
  worldPointer.set(pointer.x * viewport.width * .5, pointer.y * viewport.height * .5);
  const sources = ["/assets/glyphs/yan-y.svg", "/assets/glyphs/yan-a.svg", "/assets/glyphs/yan-n.svg"];
  const scale = active === 0 ? 4.7 : active === 1 ? 4.15 : 3.85;
  return <>
    <ambientLight intensity={1.7} /><directionalLight position={[-4, 6, 8]} intensity={3.4} color="#fff8ed" /><directionalLight position={[5, 1, 5]} intensity={1.6} color="#b7eaff" />
    {active === 0 ? <>
      <BeadGlyph src={sources[0]} position={[-.2, .06, -.25]} scale={scale} depth={.42} muted />
      <BeadGlyph src={sources[0]} position={[.16, -.04, .42]} scale={scale} depth={.88} interaction={.62} pointer={worldPointer} />
    </> : <BeadGlyph src={sources[active]} scale={scale} depth={active === 1 ? motion.depth : .92} wave={active === 2 ? motion.wave : 0} speed={active === 2 ? motion.speed : 1} gravity={motion.gravity} explode={active === 2 ? Math.max(0, motion.gravity - 1) * .035 : 0} interaction={active === 2 ? motion.interaction : 0} pointer={worldPointer} />}
  </>;
}

function Param({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return <label className="method-param"><span>{label}</span><Slider aria-label={label} min={min} max={max} step={step} value={[value]} onValueChange={(v) => onChange(v[0] ?? value)} /><output>{value.toFixed(2)}</output></label>;
}

export function GlyphMethod() {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLElement | null>>([]);
  const [motion, setMotion] = useState<Motion>({ depth: .95, wave: .72, speed: 1.08, gravity: 1, interaction: .72 });
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(Number((visible.target as HTMLElement).dataset.chapter ?? 0));
    }, { threshold: [.35, .6, .82], rootMargin: "-10% 0px -10% 0px" });
    refs.current.forEach((el) => el && observer.observe(el)); return () => observer.disconnect();
  }, []);
  const update = (key: keyof Motion, value: number) => setMotion((current) => ({ ...current, [key]: value }));
  return <section className="method-story" aria-label="Space and Field method">
    <div className="method-visual"><div className="method-canvas" aria-hidden="true"><Canvas dpr={[1, 1.35]} camera={{ position: [0, 0, 8.8], fov: 40 }} gl={{ antialias: true, alpha: true }}><Scene active={active} motion={motion} /></Canvas></div>
      <nav className="method-nav">{chapters.map((c, i) => <button key={c.id} className={active === i ? "is-active" : ""} onClick={() => refs.current[i]?.scrollIntoView({ behavior: "smooth" })}>{String(i + 1).padStart(2, "0")} / {c.id.toUpperCase()}</button>)}</nav>
    </div>
    <div className="method-copy">{chapters.map((chapter, index) => <article key={chapter.id} ref={(el) => { refs.current[index] = el; }} data-chapter={index} className="method-chapter">
      <p className="method-eyebrow">{chapter.eyebrow}</p><h3>{chapter.title}</h3>{chapter.body.map((p) => <p key={p}>{p}</p>)}
      {index === 0 && <div className="svg-evidence"><span>REAL SVG DATA</span><code>{'<circle cx="614" cy="376" r="41" fill="#40D9E5" />'}</code><code>{'<circle cx="696" cy="861" r="41" fill="#FF4FBE" />'}</code></div>}
      {index === 1 && <div className="method-params single"><Param label="DEPTH" value={motion.depth} min={.12} max={1.9} step={.01} onChange={(v) => update("depth", v)} /></div>}
      {index === 2 && <div className="method-params"><Param label="WAVE" value={motion.wave} min={0} max={1.4} step={.01} onChange={(v) => update("wave", v)} /><Param label="SPEED" value={motion.speed} min={.2} max={2.4} step={.01} onChange={(v) => update("speed", v)} /><Param label="GRAVITY" value={motion.gravity} min={.4} max={2.6} step={.01} onChange={(v) => update("gravity", v)} /><Param label="INTERACTION" value={motion.interaction} min={0} max={1.5} step={.01} onChange={(v) => update("interaction", v)} /></div>}
    </article>)}</div>
  </section>;
}
