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

function GlyphObject({ beads }: { beads: Bead[] }) {
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<Array<THREE.Mesh | null>>([]);
  const pointer = useRef<THREE.Vector3 | null>(null);
  const base = useMemo(() => beads.map((bead) => new THREE.Vector3(bead.x, bead.y, 0)), [beads]);

  useFrame((_, delta) => {
    const ease = 1 - Math.exp(-delta * 8.5);
    meshes.current.forEach((mesh, index) => {
      if (!mesh) return;
      const origin = base[index];
      const target = origin.clone();
      if (pointer.current) {
        const dx = origin.x - pointer.current.x;
        const dy = origin.y - pointer.current.y;
        const distance = Math.hypot(dx, dy);
        const influence = THREE.MathUtils.smoothstep(0.34 - distance, 0, 0.34);
        if (influence > 0 && distance > 0.001) {
          target.x += (dx / distance) * influence * 0.075;
          target.y += (dy / distance) * influence * 0.075;
          target.z += influence * 0.12;
        }
      }
      mesh.position.lerp(target, ease);
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
      <GlyphObject beads={glyph.beads} />
    </Canvas>
  </div>;
}
