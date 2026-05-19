import { ViewportState } from '../types/bracket';

export const DEFAULT_VIEWPORT_STATE: ViewportState = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  scale: 1,
  positionX: 0,
  positionY: 0
};

export function calculateVisibleRegion(
  scale: number,
  positionX: number,
  positionY: number,
  viewportWidth: number,
  viewportHeight: number
): ViewportState {
  const safeScale = scale || 1;

  return {
    x: -positionX / safeScale,
    y: -positionY / safeScale,
    width: viewportWidth / safeScale,
    height: viewportHeight / safeScale,
    scale: safeScale,
    positionX,
    positionY
  };
}

export function rectsIntersect(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
) {
  return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
}
