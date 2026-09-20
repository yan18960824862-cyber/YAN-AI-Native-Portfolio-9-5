import { Camera, Vector3 } from "three";

export type ScreenToken = { x: number; y: number; radius: number; colorIndex: number };

export function projectHeroToken(position: { x: number; y: number; z: number }, camera: Camera,
  viewport: { left: number; top: number; width: number; height: number }, colorIndex: number,
  target: ScreenToken, point: Vector3, edge: Vector3) {
  point.set(position.x, position.y, position.z).project(camera);
  if (!Number.isFinite(point.x) || point.z < -1 || point.z > 1) return false;
  // Project a real token radius along the camera's horizontal axis.
  const matrix = camera.matrixWorld.elements;
  edge.set(position.x + matrix[0] * 0.18, position.y + matrix[1] * 0.18, position.z + matrix[2] * 0.18).project(camera);
  target.x = viewport.left + (point.x + 1) * viewport.width / 2;
  target.y = viewport.top + (1 - point.y) * viewport.height / 2;
  target.radius = Math.min(150, Math.max(22, Math.abs(edge.x - point.x) * viewport.width / 2 * 2.2));
  target.colorIndex = colorIndex;
  return true;
}

export function tokenMaskCircle(token: ScreenToken, rect: { left: number; top: number; width: number; height: number }) {
  const x = token.x - rect.left, y = token.y - rect.top, r = token.radius;
  const margin = r + 30;
  if (x < -margin || y < -margin || x > rect.width + margin || y > rect.height + margin) return "";
  return `M${(x-r).toFixed(2)},${y.toFixed(2)}a${r.toFixed(2)},${r.toFixed(2)} 0 1,0 ${(r*2).toFixed(2)},0a${r.toFixed(2)},${r.toFixed(2)} 0 1,0 ${(-r*2).toFixed(2)},0`;
}
