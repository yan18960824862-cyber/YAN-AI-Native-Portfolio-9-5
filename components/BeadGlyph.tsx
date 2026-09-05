"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type GlyphPoint = { x: number; y: number; radius: number; color: string; seed: number };
type ParsedGlyph = { points: GlyphPoint[]; width: number; height: number };
const glyphCache = new Map<string, ParsedGlyph>();

function seeded(index: number) {
  const value = Math.sin(index * 9283.17 + 41.3) * 43758.5453;
  return value - Math.floor(value);
}

function parseSvg(text: string): ParsedGlyph {
  const documentNode = new DOMParser().parseFromString(text, "image/svg+xml");
  const svg = documentNode.querySelector("svg");
  const viewBox = (svg?.getAttribute("viewBox") ?? "0 0 100 100").split(/\s+/).map(Number);
  const [, , width, height] = viewBox;
  const points = Array.from(documentNode.querySelectorAll("circle, ellipse")).map((node, index) => {
    const cx = Number(node.getAttribute("cx") ?? 0);
    const cy = Number(node.getAttribute("cy") ?? 0);
    const rawTransform = node.getAttribute("transform");
    let position = { x: cx, y: cy };
    if (rawTransform && typeof DOMMatrix !== "undefined") {
      try {
        const transformed = new DOMPoint(cx, cy).matrixTransform(new DOMMatrix(rawTransform));
        position = { x: transformed.x, y: transformed.y };
      } catch { position = { x: cx, y: cy }; }
    }
    return {
      x: position.x,
      y: position.y,
      radius: Number(node.getAttribute("r") ?? node.getAttribute("rx") ?? node.getAttribute("ry") ?? 40),
      color: node.getAttribute("fill") ?? "#ff4fbe",
      seed: seeded(index + 1),
    };
  });
  return { points, width, height };
}

function useGlyph(src: string) {
  const [glyph, setGlyph] = useState<ParsedGlyph | null>(() => glyphCache.get(src) ?? null);
  useEffect(() => {
    let cancelled = false;
    const cached = glyphCache.get(src);
    if (cached) { queueMicrotask(() => { if (!cancelled) setGlyph(cached); }); return () => { cancelled = true; }; }
    fetch(src).then((response) => response.text()).then((text) => {
      const parsed = parseSvg(text);
      glyphCache.set(src, parsed);
      if (!cancelled) setGlyph(parsed);
    });
    return () => { cancelled = true; };
  }, [src]);
  return glyph;
}

export function BeadGlyph({
  src,
  position = [0, 0, 0],
  scale = 1,
  depth = 0.75,
  reveal = 1,
  explode = 0,
  wave = 0,
  speed = 1,
  gravity = 1,
  interaction = 0,
  pointer,
  muted = false,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  src: string;
  position?: [number, number, number];
  scale?: number;
  depth?: number;
  reveal?: number;
  explode?: number;
  wave?: number;
  speed?: number;
  gravity?: number;
  interaction?: number;
  pointer?: THREE.Vector2;
  muted?: boolean;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  onClick?: () => void;
}) {
  const glyph = useGlyph(src);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geometry = useMemo(() => {
    const next = new THREE.CylinderGeometry(0.112, 0.112, 1, 20, 1, false);
    next.rotateX(Math.PI / 2);
    return next;
  }, []);

  useEffect(() => {
    if (!mesh.current || !glyph) return;
    // Allocate the per-instance colour buffer explicitly.  This avoids a
    // renderer-dependent first paint where InstancedMesh falls back to black
    // before Three has created instanceColor for us.
    mesh.current.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(glyph.points.length * 3),
      3,
    );
    glyph.points.forEach((point, index) => {
      const sourceColor = muted ? "#b9bbb8" : point.color;
      const color = new THREE.Color(sourceColor === "none" ? "#ff4fbe" : sourceColor);
      mesh.current?.setColorAt(index, color);
    });
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [glyph, muted]);

  useFrame(({ clock, pointer: scenePointer, viewport }) => {
    if (!mesh.current || !glyph) return;
    const elapsed = clock.getElapsedTime() * speed;
    const fit = scale / Math.max(glyph.width, glyph.height);
    const pointerX = pointer?.x ?? scenePointer.x * viewport.width * 0.5;
    const pointerY = pointer?.y ?? scenePointer.y * viewport.height * 0.5;
    glyph.points.forEach((point, index) => {
      const localX = (point.x - glyph.width / 2) * fit;
      const localY = -(point.y - glyph.height / 2) * fit;
      const randomAngle = point.seed * Math.PI * 2;
      const randomForce = 0.5 + point.seed * 0.9;
      const waveZ = Math.sin(localX * 4.4 + elapsed * 2.2 + point.seed) * wave * 0.34;
      const distToPointer = Math.hypot(localX - pointerX, localY - pointerY);
      const pointerForce = Math.max(0, 1 - distToPointer / 0.8) * interaction;
      dummy.position.set(
        position[0] + localX + Math.cos(randomAngle) * explode * randomForce * 4.2 + (localX - pointerX) * pointerForce * 0.42,
        position[1] + localY + Math.sin(randomAngle) * explode * randomForce * 2.4 - explode * gravity * (1.4 + point.seed * 3.2) + (localY - pointerY) * pointerForce * 0.42,
        position[2] - (1 - reveal) * (3 + point.seed * 2) + waveZ + explode * (point.seed - 0.5) * 4 + pointerForce * 0.7,
      );
      const radiusScale = THREE.MathUtils.clamp(point.radius / 41, 0.66, 1.42);
      dummy.scale.set(radiusScale, radiusScale, Math.max(0.06, depth));
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  if (!glyph) return null;
  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, glyph.points.length]} castShadow receiveShadow frustumCulled={false} onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
      <meshPhysicalMaterial color="#ffffff" vertexColors roughness={0.38} clearcoat={0.26} clearcoatRoughness={0.42} metalness={0} />
    </instancedMesh>
  );
}
