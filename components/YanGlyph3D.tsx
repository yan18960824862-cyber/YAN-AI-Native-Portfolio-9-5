"use client";

import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Bead = { x: number; y: number; radius: number; color: string };

function transformedCenter(node: Element, x: number, y: number) {
  const transform = node.getAttribute("transform") ?? "";
  const matrix = transform.match(/matrix\(([^)]+)\)/);
  if (matrix) {
    const [a, b, c, d, e, f] = matrix[1].trim().split(/[\s,]+/).map(Number);
    return { x: a * x + c * y + e, y: b * x + d * y + f };
  }
  return { x, y };
}

function parseGlyph(svg: string) {
  const document = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = document.documentElement;
  const viewBox = (root.getAttribute("viewBox") ?? "0 0 1 1").split(/\s+/).map(Number);
  const [, , width, height] = viewBox;
  const beads = Array.from(root.querySelectorAll("circle, ellipse")).map((node) => {
    const x = Number(node.getAttribute("cx") ?? 0);
    const y = Number(node.getAttribute("cy") ?? 0);
    const center = transformedCenter(node, x, y);
    const radius = Number(node.getAttribute("r") ?? node.getAttribute("rx") ?? 1);
    return {
      x: ((center.x / width) - 0.5) * 2 * (width / height),
      y: -((center.y / height) - 0.5) * 2,
      radius: (radius / height) * 2,
      color: node.getAttribute("fill") ?? "#ffffff",
    };
  });
  return { beads, aspect: width / height };
}

function GlyphObject({ beads, label }: { beads: Bead[]; label: string }) {
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<Array<THREE.Mesh | null>>([]);
  const pointer = useRef<THREE.Vector3 | null>(null);
  const base = useMemo(() => beads.map((bead) => new THREE.Vector3(bead.x, bead.y, 0)), [beads]);
  const hoverOffsets = useRef<number[]>([]);
  const phases = useMemo(() => {
    const left = Math.min(...beads.map((bead) => bead.x));
    const right = Math.max(...beads.map((bead) => bead.x));
    const top = Math.max(...beads.map((bead) => bead.y));
    const bottom = Math.min(...beads.map((bead) => bead.y));
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    const maxDistance = Math.max(...beads.map((bead) => Math.hypot(bead.x - centerX, bead.y - centerY)), 0.001);
    return beads.map((bead, index) => {
      // Use 0–100 spatial coordinates: parsed SVG positions are normalized,
      // and Three.js Y points upward, opposite to the downward Y wave.
      if (label === "Y") return -((top - bead.y) / (top - bottom || 1)) * 100 * 0.15;
      if (label === "N") {
        const distanceFromLeft = ((bead.x - left) / (right - left || 1)) * 100;
        // Negative spatial phase delays the right side as time advances.
        return -distanceFromLeft * 0.14;
      }
      const normalizedDistance = Math.hypot(bead.x - centerX, bead.y - centerY) / maxDistance;
      // Fixed seeded variation, computed only with the bead data. Negative
      // distance phase makes the pulse travel from the center outward.
      const seed = Math.sin((index + 1) * 127.1) * 43758.5453;
      const randomPhase = ((seed - Math.floor(seed)) - 0.5) * 0.24;
      return -normalizedDistance * 8 + randomPhase;
    });
  }, [beads, label]);
  const scaleLimits = useMemo(() => {
    if (label !== "A") return [];
    return beads.map((bead, index) => {
      let limit = 1.15;
      beads.forEach((neighbor, neighborIndex) => {
        if (index === neighborIndex) return;
        const spacing = Math.hypot(bead.x - neighbor.x, bead.y - neighbor.y);
        const radii = bead.radius + neighbor.radius;
        if (radii > 0) limit = Math.min(limit, spacing / radii);
      });
      // Existing SVG overlaps cannot be removed without changing its layout.
      // Crowded beads breathe inward so animation never enlarges those overlaps.
      return Math.max(1, limit);
    });
  }, [beads, label]);

  useFrame(({ clock }, delta) => {
    const ease = 1 - Math.exp(-delta * 8.5);
    const time = clock.elapsedTime;
    const speed = label === "A" ? 1.2 : label === "Y" ? 1.5 : 1.6;
    const amplitude = label === "A" ? 0.135 : label === "Y" ? 0.17 : 0.18;
    meshes.current.forEach((mesh, index) => {
      if (!mesh) return;
      const origin = base[index];
      const animationOffsetZ = Math.sin(time * speed + phases[index]) * amplitude;
      let hoverTargetZ = 0;
      if (pointer.current) {
        const dx = origin.x - pointer.current.x;
        const dy = origin.y - pointer.current.y;
        const distance = Math.hypot(dx, dy);
        const influence = THREE.MathUtils.smoothstep(0.34 - distance, 0, 0.34);
        hoverTargetZ = influence * 0.12;
      }
      const hoverOffsetZ = THREE.MathUtils.lerp(hoverOffsets.current[index] ?? 0, hoverTargetZ, ease);
      hoverOffsets.current[index] = hoverOffsetZ;
      mesh.position.z = origin.z + animationOffsetZ + hoverOffsetZ;
      if (label === "A") {
        const breath = (Math.sin(time * speed + phases[index]) + 1) / 2;
        // The same radial pulse drives depth and size, with the existing
        // spacing guard preventing crowded beads from growing into neighbors.
        mesh.scale.setScalar(THREE.MathUtils.lerp(0.85, scaleLimits[index], breath));
      }
    });
  });

  const updatePointer = (event: ThreeEvent<PointerEvent>) => {
    if (!group.current) return;
    pointer.current = group.current.worldToLocal(event.point.clone());
  };

  return <group ref={group} rotation={[-0.2, 0.25, -0.015]}>
    <mesh position={[0, 0, -0.16]} onPointerMove={updatePointer} onPointerLeave={() => { pointer.current = null; }}>
      <planeGeometry args={[4, 3]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
    {beads.map((bead, index) => {
      const depth = bead.radius * 2.9;
      return <mesh
        key={`${bead.x}-${bead.y}-${index}`}
        ref={(mesh) => { meshes.current[index] = mesh; }}
        position={[bead.x, bead.y, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerMove={updatePointer}
      >
        <cylinderGeometry args={[bead.radius, bead.radius, depth, 28]} />
        <meshPhysicalMaterial
          color={bead.color}
          emissive={bead.color}
          emissiveIntensity={0.32}
          metalness={0}
          roughness={0.42}
          clearcoat={0.12}
          clearcoatRoughness={0.5}
          opacity={1}
          transparent={false}
        />
      </mesh>;
    })}
  </group>;
}

export function YanGlyph3D({ src, label }: { src: string; label: string }) {
  const [glyph, setGlyph] = useState<{ beads: Bead[]; aspect: number } | null>(null);

  useEffect(() => {
    let active = true;
    fetch(src).then((response) => response.text()).then((svg) => {
      if (active) setGlyph(parseGlyph(svg));
    }).catch(() => setGlyph(null));
    return () => { active = false; };
  }, [src]);

  if (!glyph) return <img src={src} alt={label} />;

  return <div className="yan-glyph-canvas" style={{ aspectRatio: glyph.aspect }} role="img" aria-label={label}>
    <Canvas
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 1.75]}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.NoToneMapping;
        gl.toneMappingExposure = 1;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <OrthographicCamera
        makeDefault
        left={-glyph.aspect * 1.15}
        right={glyph.aspect * 1.15}
        top={1.15}
        bottom={-1.15}
        near={0.1}
        far={20}
        position={[0, 0, 5]}
      />
      <ambientLight intensity={0.30} />
      <hemisphereLight args={["#ffffff", "#f8f7f3", 0.35]} />
      <directionalLight position={[-3, 4, 6]} intensity={1.85} color="#ffffff" />
      <directionalLight position={[4, -2, 3]} intensity={0.35} color="#fff8fc" />
      <GlyphObject beads={glyph.beads} label={label} />
    </Canvas>
  </div>;
}
