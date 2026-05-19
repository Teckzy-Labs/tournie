import React, { useMemo } from 'react';
import { LayoutGroup, LayoutNode, ViewportState } from '../../types/bracket';

interface BracketMinimapProps {
  nodes: LayoutNode[];
  groups: LayoutGroup[];
  canvasWidth: number;
  canvasHeight: number;
  viewport: ViewportState;
  onFocus: (x: number, y: number) => void;
}

const MINIMAP_WIDTH = 180;
const MINIMAP_HEIGHT = 120;

export const BracketMinimap = React.memo(function BracketMinimap({
  nodes,
  groups,
  canvasWidth,
  canvasHeight,
  viewport,
  onFocus
}: BracketMinimapProps) {
  const scale = useMemo(() => {
    return Math.min(MINIMAP_WIDTH / canvasWidth, MINIMAP_HEIGHT / canvasHeight);
  }, [canvasWidth, canvasHeight]);

  const viewportRect = {
    x: Math.max(0, viewport.x * scale),
    y: Math.max(0, viewport.y * scale),
    width: Math.min(MINIMAP_WIDTH, viewport.width * scale),
    height: Math.min(MINIMAP_HEIGHT, viewport.height * scale)
  };

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;
    onFocus(x, y);
  };

  return (
    <div className="absolute bottom-4 right-4 z-20 rounded-lg border border-slate-200 bg-white/95 shadow-sm p-2 backdrop-blur">
      <svg
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        viewBox={`0 0 ${MINIMAP_WIDTH} ${MINIMAP_HEIGHT}`}
        className="block cursor-crosshair"
        onClick={handleClick}
      >
        <rect width={MINIMAP_WIDTH} height={MINIMAP_HEIGHT} rx="6" className="fill-slate-50" />
        {groups.map((group) => (
          <rect
            key={group.id}
            x={group.x * scale}
            y={group.y * scale}
            width={group.width * scale}
            height={group.height * scale}
            rx="3"
            className="fill-slate-200/60 stroke-slate-300"
          />
        ))}
        {nodes.map((node) => (
          <rect
            key={node.id}
            x={node.x * scale}
            y={node.y * scale}
            width={Math.max(2, node.width * scale)}
            height={Math.max(2, node.height * scale)}
            rx="1"
            className="fill-indigo-500/70"
          />
        ))}
        <rect
          x={viewportRect.x}
          y={viewportRect.y}
          width={viewportRect.width}
          height={viewportRect.height}
          rx="3"
          className="fill-indigo-400/15 stroke-indigo-500"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
});
