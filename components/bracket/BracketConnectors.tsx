import React, { useMemo } from 'react';
import { Connector, LayoutNode } from '../../types/bracket';
import { Connectors } from './Connectors';

interface BracketConnectorsProps {
  connectors: Connector[];
  nodes: LayoutNode[];
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  hoveredParticipantId: string | null;
  className?: string;
  highlightedClassName?: string;
}

export const BracketConnectors = React.memo(function BracketConnectors({
  connectors,
  nodes,
  width,
  height,
  offsetX,
  offsetY,
  hoveredParticipantId,
  className,
  highlightedClassName
}: BracketConnectorsProps) {
  const positionedConnectors = useMemo(
    () => connectors.map((connector) => ({
      ...connector,
      startX: connector.startX + offsetX,
      endX: connector.endX + offsetX,
      startY: connector.startY + offsetY,
      endY: connector.endY + offsetY
    })),
    [connectors, offsetX, offsetY]
  );

  return (
    <Connectors
      connectors={positionedConnectors}
      nodes={nodes}
      width={width}
      height={height}
      hoveredParticipantId={hoveredParticipantId}
      className={className}
      highlightedClassName={highlightedClassName}
    />
  );
});
