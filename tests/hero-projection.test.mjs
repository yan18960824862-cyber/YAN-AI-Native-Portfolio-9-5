import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createServer } from 'vite';
import { PerspectiveCamera, Vector3 } from 'three';

const vite = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true } });
after(() => vite.close());
const { projectHeroToken, tokenMaskCircle } = await vite.ssrLoadModule('/components/heroProjection.ts');
const camera = new PerspectiveCamera(38, 2, 0.1, 100);
camera.position.z = 5;
camera.updateMatrixWorld();
const viewport = { left: 20, top: 30, width: 800, height: 400 };
const project = position => {
  const token = {};
  const visible = projectHeroToken(position, camera, viewport, 1, token, new Vector3(), new Vector3());
  return { token, visible };
};

test('world projection follows the actual token and viewport offset', () => {
  const { token, visible } = project({ x: 0, y: 0, z: 0 });
  assert.ok(visible);
  assert.equal(token.x, 420);
  assert.equal(token.y, 230);
  assert.equal(token.colorIndex, 1);
  const moved = project({ x: 1, y: 1, z: 0 }).token;
  assert.ok(moved.x > token.x && moved.y < token.y);
  assert.equal(project({ x: 0, y: 0, z: 6 }).visible, false);
});

test('mask tracks local text coordinates and excludes distant tokens', () => {
  const token = { x: 100, y: 80, radius: 22, colorIndex: 0 };
  const rect = { left: 90, top: 70, width: 200, height: 20 };
  assert.match(tokenMaskCircle(token, rect), /^M-12.00,10.00/);
  assert.equal(tokenMaskCircle({ ...token, x: 1000 }, rect), '');
  assert.notEqual(tokenMaskCircle(token, rect), tokenMaskCircle(token, { ...rect, left: 100 }));
});
