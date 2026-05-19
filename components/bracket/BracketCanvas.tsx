import React, { useMemo } from 'react';
import { BracketConfig, Connector, LayoutGroup, LayoutNode, Match, ViewportState } from '../../types/bracket';
import { getRenderWindow } from '../../lib/virtualization';
import { BracketConnectors } from './BracketConnectors';
import { BracketGroups } from './BracketGroups';
import { BracketNodes } from './BracketNodes';

interface BracketCanvasProps {
  nodes: LayoutNode[];
  connectors: Connector[];
  groups: LayoutGroup[];
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  hoveredParticipantId: string | null;
  onHoverParticipant: (id: string | null) => void;
  onMatchClick: (match: Match) => void;
  onMatchDoubleClick: (match: Match) => void;
  config: BracketConfig;
  viewport: ViewportState;
  virtualizationEnabled: boolean;
}

export const BracketCanvas = React.memo(function BracketCanvas({
  nodes,
  connectors,
  groups,
  width,
  height,
  offsetX,
  offsetY,
  hoveredParticipantId,
  onHoverParticipant,
  onMatchClick,
  onMatchDoubleClick,
  config,
  viewport,
  virtualizationEnabled
}: BracketCanvasProps) {
  const renderWindow = useMemo(() => {
    const shiftedNodes = nodes.map((node) => ({
      ...node,
      x: node.x + offsetX,
      y: node.y + offsetY
    }));
    const shiftedConnectors = connectors.map((connector) => ({
      ...connector,
      startX: connector.startX + offsetX,
      startY: connector.startY + offsetY,
      endX: connector.endX + offsetX,
      endY: connector.endY + offsetY
    }));

    return getRenderWindow(
      shiftedNodes,
      shiftedConnectors,
      viewport,
      virtualizationEnabled,
      config.virtualizationPadding
    );
  }, [nodes, connectors, offsetX, offsetY, viewport, virtualizationEnabled, config.virtualizationPadding]);

  return (
    <div className="relative" style={{ width, height }}>
      <BracketGroups groups={groups} offsetX={offsetX} offsetY={offsetY} />
      <BracketConnectors
        connectors={renderWindow.connectors}
        nodes={renderWindow.nodes}
        width={width}
        height={height}
        offsetX={0}
        offsetY={0}
        hoveredParticipantId={hoveredParticipantId}
        className={config.classNames?.connector}
        highlightedClassName={config.classNames?.connectorHighlighted}
      />
      <BracketNodes
        nodes={renderWindow.nodes}
        offsetX={0}
        offsetY={0}
        hoveredParticipantId={hoveredParticipantId}
        onHoverParticipant={onHoverParticipant}
        onMatchClick={onMatchClick}
        onMatchDoubleClick={onMatchDoubleClick}
        config={config}
      />
    </div>
  );
});
