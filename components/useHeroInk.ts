"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { Camera, Vector3 } from "three";
import { projectHeroToken, tokenMaskCircle, type ScreenToken } from "./heroProjection";

type Body = { translation: () => { x: number; y: number; z: number } };
export type HeroFrame = (bodies: Map<number, Body>, camera: Camera, canvas: HTMLCanvasElement, time: number) => void;

export function useHeroInk(ui: RefObject<HTMLDivElement | null>): HeroFrame {
  const slots = useRef<Array<{ element: HTMLElement; paths: SVGPathElement[]; masks: SVGMaskElement[]; copies: HTMLElement[]; input: HTMLInputElement | null }>>([]);
  const lastFrame = useRef(-Infinity);
  const point = useRef(new Vector3());
  const edge = useRef(new Vector3());
  const projected = useRef<ScreenToken[]>([]);

  useEffect(() => {
    slots.current = Array.from(ui.current?.querySelectorAll<HTMLElement>("[data-hero-ink]") ?? []).map(element => ({
      element,
      paths: Array.from(element.querySelectorAll<SVGPathElement>("[data-hero-mask]")),
      masks: Array.from(element.querySelectorAll<SVGMaskElement>("mask")),
      copies: Array.from(element.querySelectorAll<HTMLElement>(".hero-ink-copy")),
      input: element.parentElement?.querySelector("input") ?? null,
    }));
    return () => { slots.current = []; };
  }, [ui]);

  return useCallback((bodies, camera, canvas, time) => {
    if (document.hidden || time - lastFrame.current < 1 / 30 || slots.current.length === 0) return;
    lastFrame.current = time;
    const viewport = canvas.getBoundingClientRect();
    if (viewport.bottom < 0 || viewport.top > innerHeight) return;
    camera.updateMatrixWorld();
    let count = 0;
    bodies.forEach((body, id) => {
      const target = projected.current[count] ?? { x: 0, y: 0, radius: 0, colorIndex: 0 };
      if (projectHeroToken(body.translation(), camera, viewport, id % 3, target, point.current, edge.current)) {
        projected.current[count++] = target;
      }
    });
    // Batch layout reads before writes. Rects include camera-driven UI movement,
    // breathing transforms, responsive layout and the page scroll position.
    const layouts = slots.current.map(slot => ({ slot, rect: slot.element.getBoundingClientRect(), scroll: slot.input?.scrollLeft ?? 0, editing: slot.input === document.activeElement }));
    for (const { slot, rect, scroll, editing } of layouts) {
      const paths = ["", "", ""];
      if (!editing) for (let i = 0; i < count; i++) {
        const token = projected.current[i];
        paths[token.colorIndex] += tokenMaskCircle(token, rect);
      }
      slot.paths.forEach((path, index) => {
        if (path.getAttribute("d") !== paths[index]) path.setAttribute("d", paths[index]);
        slot.masks[index].setAttribute("width", String(rect.width));
        slot.masks[index].setAttribute("height", String(rect.height));
      });
      slot.copies.forEach(copy => { copy.style.transform = `translateX(${-scroll}px)`; });
    }
  }, []);
}
