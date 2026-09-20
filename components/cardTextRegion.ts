// All six SVG cards share a 1200 × 1680 template. Front text begins
// below y=760; the reverse is a full process note. Plane UV.y runs upward.
export function isCardTextRegion(face: "front" | "back", uv?: { x: number; y: number }) {
  if (!uv || uv.x < 0.06 || uv.x > 0.94) return false;
  return face === "front"
    ? uv.y >= 0.04 && uv.y <= 1 - 760 / 1680
    : uv.y >= 0.04 && uv.y <= 0.94;
}
