"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { BeadGlyph } from "./BeadGlyph";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const ease = (v: number) => v * v * (3 - 2 * v);
const hash = (i: number) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };

function WhiteBeadSea({ impact, progress, reducedMotion }: { impact: boolean; progress: number; reducedMotion: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const material = useRef<THREE.MeshPhysicalMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geometry = useMemo(() => { const g = new THREE.CylinderGeometry(0.155, 0.155, 1, 18); g.rotateX(Math.PI / 2); return g; }, []);
  const { pointer, viewport } = useThree();
  const mobile = typeof window !== "undefined" && window.innerWidth < 760;
  const columns = mobile ? 18 : 28;
  const rows = mobile ? 26 : 18;
  const impactStarted = useRef<number | null>(null);
  const beads = useMemo(() => {
    const result: Array<{ x: number; y: number; seed: number }> = [];
    for (let row = 0; row < rows; row += 1) for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column;
      result.push({ x: (column / (columns - 1) - 0.5) * 11.8, y: (row / (rows - 1) - 0.5) * 7.6, seed: hash(index + 2) });
    }
    return result;
  }, [columns, rows]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const now = clock.getElapsedTime();
    if (impact && impactStarted.current === null) impactStarted.current = now;
    const impactAge = impactStarted.current === null ? -1 : now - impactStarted.current;
    const pointerX = pointer.x * viewport.width * 0.5;
    const pointerY = pointer.y * viewport.height * 0.5;
    const clearForYan = ease(range(progress, 0.2, 0.4));
    beads.forEach((bead, index) => {
      const hover = reducedMotion ? 0 : Math.max(0, 1 - Math.hypot(bead.x - pointerX, bead.y - pointerY) / 1.55);
      const impactDistance = Math.hypot(bead.x + 0.35, bead.y - 0.1);
      const wave = impactAge < 0 || reducedMotion ? 0 : Math.exp(-Math.abs(impactDistance - impactAge * 2.85) * 2.4) * Math.max(0, 1 - impactAge / 4.8);
      const scatter = (hover * 0.2 + wave * 0.12) * (0.6 + bead.seed);
      dummy.position.set(bead.x + (bead.x - pointerX) * scatter * 0.1, bead.y + (bead.y - pointerY) * scatter * 0.1, -hover * 2.6 - wave * 1.9 - clearForYan * 6.5);
      dummy.scale.set(1, 1, Math.max(0.12, 1.72 - hover * 1.38 - wave * 1.2));
      dummy.rotation.z = (bead.seed - 0.5) * 0.06;
      dummy.updateMatrix(); mesh.current?.setMatrixAt(index, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (material.current) material.current.opacity = 1 - ease(range(progress, 0.3, 0.46));
  });
  return <instancedMesh ref={mesh} args={[geometry, undefined, beads.length]} castShadow receiveShadow frustumCulled={false}>
    <meshPhysicalMaterial ref={material} color="#fffefa" roughness={0.42} clearcoat={0.2} transparent />
  </instancedMesh>;
}

function SeedBead({ impact, setImpact, progress, reducedMotion }: { impact: boolean; setImpact: (v: boolean) => void; progress: number; reducedMotion: boolean }) {
  const mesh = useRef<THREE.Mesh>(null); const pushed = useRef(0);
  useFrame(({ clock, pointer }) => {
    if (!mesh.current) return;
    const time = clock.getElapsedTime();
    const hoverDistance = Math.hypot(pointer.x + 0.56, pointer.y - 0.02);
    const autoPush = time > 1.1 ? Math.min(1, (time - 1.1) / 1.6) : 0;
    pushed.current = THREE.MathUtils.damp(pushed.current, reducedMotion ? 1 : Math.max(autoPush, hoverDistance < 0.22 ? 1 : 0), 3.4, 1 / 60);
    if (pushed.current > 0.74 && !impact) setImpact(true);
    const fall = ease(range(progress, 0.66, 0.92));
    mesh.current.position.set(-3.35 + pushed.current * 3.05, Math.sin(time * 1.4) * 0.05 - fall * 5, 2.5 - pushed.current * 1.8 + fall * 0.8);
    mesh.current.rotation.z += 0.012 + pushed.current * 0.022;
    mesh.current.scale.setScalar(Math.max(0.001, 1 - ease(range(progress, 0.28, 0.42))));
  });
  return <mesh ref={mesh} castShadow onPointerMove={() => setImpact(true)} onClick={() => setImpact(true)} position={[-3.35, 0, 2.5]} rotation={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[0.2, 0.2, 0.78, 24]} />
    <meshPhysicalMaterial color="#ff4fbe" roughness={0.34} clearcoat={0.3} />
  </mesh>;
}

function World({ progress, reducedMotion }: { progress: number; reducedMotion: boolean }) {
  const [impact, setImpact] = useState(false);
  const activeImpact = impact || progress > 0.07;
  const reveal = reducedMotion ? (progress > 0.24 ? 1 : 0) : ease(range(progress, 0.27, 0.49));
  const explode = reducedMotion ? 0 : ease(range(progress, 0.64, 0.9));
  const wave = reducedMotion ? 0 : Math.sin(range(progress, 0.38, 0.68) * Math.PI) * 0.9;
  return <>
    <ambientLight intensity={1.75} />
    <directionalLight position={[-4, 7, 8]} intensity={3.7} color="#fff8ee" castShadow />
    <directionalLight position={[6, 1, 4]} intensity={1.9} color="#b8edff" />
    <WhiteBeadSea impact={activeImpact} progress={progress} reducedMotion={reducedMotion} />
    <SeedBead impact={impact} setImpact={setImpact} progress={progress} reducedMotion={reducedMotion} />
    <BeadGlyph src="/assets/glyphs/yan-y.svg" position={[-2.75, .15, .75]} scale={3.25} depth={1.05} reveal={reveal} explode={explode} wave={wave} gravity={1.2} />
    <BeadGlyph src="/assets/glyphs/yan-a.svg" position={[0, .05, .9]} scale={2.9} depth={1.05} reveal={reveal} explode={explode} wave={wave * .9} speed={1.1} gravity={1.16} />
    <BeadGlyph src="/assets/glyphs/yan-n.svg" position={[2.55, .03, .82]} scale={2.75} depth={1.05} reveal={reveal} explode={explode} wave={wave * 1.08} speed={.95} gravity={1.24} />
  </>;
}

export function BeadWorld({ progress }: { progress: number }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => { const media = matchMedia("(prefers-reduced-motion: reduce)"); const update = () => setReducedMotion(media.matches); update(); media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []);
  return <Canvas dpr={typeof window !== "undefined" && window.innerWidth < 760 ? [1, 1.2] : [1, 1.5]} camera={{ position: [0, 0, 11], fov: 43 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} shadows>
    <World progress={progress} reducedMotion={reducedMotion} />
  </Canvas>;
}
