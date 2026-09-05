"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

type Params = { speed: number; depth: number; beams: number; twist: number; pulse: number; glow: number; grain: number };
const defaults: Params = { speed: .72, depth: .78, beams: 14, twist: .34, pulse: .46, glow: .7, grain: .24 };

function Row({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return <label className="vj-control-row"><span>{label}</span><Slider aria-label={label} min={min} max={max} step={step} value={[value]} onValueChange={(v) => onChange(v[0] ?? value)} /><output>{Number.isInteger(step) ? value.toFixed(0) : value.toFixed(2)}</output></label>;
}

export function VJWorkbench() {
  const canvasRef = useRef<HTMLCanvasElement>(null); const stageRef = useRef<HTMLDivElement>(null);
  const [params, setParams] = useState(defaults); const paramsRef = useRef(params);
  useEffect(() => { paramsRef.current = params; }, [params]);
  const pointer = useRef({ x: 0, y: 0 });
  const controls = useMemo(() => [
    { key: "speed" as const, label: "SPEED", min: .1, max: 2, step: .01 },
    { key: "depth" as const, label: "SPACE DEPTH", min: .2, max: 1.5, step: .01 },
    { key: "beams" as const, label: "BEAM COUNT", min: 5, max: 28, step: 1 },
    { key: "twist" as const, label: "CAMERA TWIST", min: 0, max: 1.5, step: .01 },
    { key: "pulse" as const, label: "PULSE", min: 0, max: 1.3, step: .01 },
    { key: "glow" as const, label: "GLOW", min: .1, max: 1.4, step: .01 },
    { key: "grain" as const, label: "PARTICLE GRAIN", min: 0, max: 1, step: .01 },
  ], []);

  useEffect(() => {
    const canvas = canvasRef.current, stage = stageRef.current; if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let frame = 0, width = 1, height = 1;
    const resize = () => { const rect = stage.getBoundingClientRect(); const dpr = Math.min(devicePixelRatio || 1, 1.5); width = rect.width; height = rect.height; canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const observer = new ResizeObserver(resize); observer.observe(stage); resize();
    const draw = (timestamp: number) => {
      const p = paramsRef.current, m = pointer.current, time = timestamp * .001 * (p.speed + m.x * .45);
      ctx.clearRect(0, 0, width, height);
      const bg = ctx.createRadialGradient(width * .52, height * .47, 0, width * .5, height * .5, width * .72); bg.addColorStop(0, "#142d52"); bg.addColorStop(.42, "#07172d"); bg.addColorStop(1, "#020710"); ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
      const cx = width * (.5 + m.x * .09) + Math.sin(time * .38) * width * .025, cy = height * (.5 + m.y * .08), maxR = Math.hypot(width, height) * (.5 + p.depth * .18 + m.y * .09), count = Math.round(p.beams), twist = p.twist * Math.sin(time * .33) + time * p.twist * .08;
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (let beam = 0; beam < count; beam += 1) { const a = beam / count * Math.PI * 2 + twist, sway = Math.sin(time * 1.1 + beam * 1.73) * .09 * p.pulse, ex = cx + Math.cos(a + sway) * maxR, ey = cy + Math.sin(a + sway) * maxR * .72; const line = ctx.createLinearGradient(cx, cy, ex, ey); line.addColorStop(0, "rgba(255,255,255,0)"); line.addColorStop(.2, `rgba(116,204,255,${.12 + p.glow * .08})`); line.addColorStop(.72, `rgba(89,139,255,${.2 + p.glow * .14})`); line.addColorStop(1, "rgba(255,255,255,0)"); ctx.strokeStyle = line; ctx.lineWidth = .65 + p.glow * 1.25; ctx.shadowColor = "#6ecaff"; ctx.shadowBlur = 6 + p.glow * 18; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke(); }
      for (let ring = 0; ring < 28; ring += 1) { const phase = (ring / 28 + time * .085) % 1, perspective = Math.pow(phase, 2.1 - p.depth * .5), radius = perspective * maxR * (1 + Math.sin(time * 2.2 + ring * .72) * .045 * p.pulse); ctx.strokeStyle = `rgba(${130 + ring * 2},${195 + ring},255,${.04 + perspective * .3})`; ctx.lineWidth = .4 + perspective * (1.8 + p.glow); ctx.beginPath(); ctx.ellipse(cx, cy, radius, radius * .58, twist * .15, 0, Math.PI * 2); ctx.stroke(); }
      ctx.restore();
      const particles = Math.round(24 + p.grain * 180); ctx.fillStyle = "rgba(205,235,255,.5)";
      for (let i = 0; i < particles; i += 1) { const s = Math.sin(i * 91.7) * 43758.5453, s2 = Math.sin(i * 47.3 + 1.8) * 13758.5453, flicker = .2 + Math.abs(Math.sin(time * 2 + i)) * .8; ctx.globalAlpha = p.grain * flicker; ctx.fillRect((s - Math.floor(s)) * width, (s2 - Math.floor(s2)) * height, .5 + flicker, .5 + flicker); }
      ctx.globalAlpha = 1; const flare = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90); flare.addColorStop(0, `rgba(240,249,255,${.58 + p.glow * .15})`); flare.addColorStop(.16, `rgba(90,180,255,${.25 + p.glow * .15})`); flare.addColorStop(1, "rgba(0,60,150,0)"); ctx.fillStyle = flare; ctx.fillRect(cx - 90, cy - 90, 180, 180);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw); return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  return <div className="vj-workbench">
    <div ref={stageRef} className="vj-live-stage" onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); pointer.current = { x: (e.clientX - r.left) / r.width * 2 - 1, y: (e.clientY - r.top) / r.height * 2 - 1 }; }} onPointerLeave={() => { pointer.current = { x: 0, y: 0 }; }}><canvas ref={canvasRef} aria-label="Interactive reconstruction of the VJ visual" /><div className="vj-stage-hud"><span>LIVE / WEB STUDY</span><span>60 FPS TARGET</span></div><div className="vj-crosshair" /></div>
    <aside className="vj-controller"><div className="vj-controller-head"><div><p>SIMULATED LIVE CONTROLLER</p><h3>GRADUATION VJ / 01</h3></div><Button variant="outline" size="icon" aria-label="Reset parameters" onClick={() => setParams(defaults)}><RotateCcw size={15} /></Button></div>
      <p className="vj-controller-note">根据现有画面重建的网页控制示意。拖动任一参数都会直接改变左侧画面；鼠标横向影响速度，纵向影响空间深度。</p>
      <div className="vj-controls">{controls.map((c) => <Row key={c.key} label={c.label} value={params[c.key]} min={c.min} max={c.max} step={c.step} onChange={(v) => setParams((current) => ({ ...current, [c.key]: v }))} />)}</div>
      <div className="vj-status-grid"><span>RENDER</span><strong>ACTIVE</strong><span>INPUT</span><strong>POINTER + UI</strong><span>OUTPUT</span><strong>REAL TIME</strong></div>
    </aside>
  </div>;
}
