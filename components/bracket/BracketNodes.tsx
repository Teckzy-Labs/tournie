import React from 'react';
import { BracketConfig, LayoutNode, Match } from '../../types/bracket';
import { MatchNode } from './MatchNode';

interface BracketNodesProps {
  nodes: LayoutNode[];
  offsetX: number;
  offsetY: number;
  hoveredParticipantId: string | null;
  onHoverParticipant: (id: string | null) => void;
  onMatchClick: (match: Match) => void;
  onMatchDoubleClick: (match: Match) => void;
  config: BracketConfig;
}

export const BracketNodes = React.memo(function BracketNodes({
  nodes,
  offsetX,
  offsetY,
  hoveredParticipantId,
  onHoverParticipant,
  onMatchClick,
  onMatchDoubleClick,
  config
}: BracketNodesProps) {
  return (
    <>
      {nodes.map((node) => (
        <MatchNode
          key={node.id}
          match={node}
          x={node.x + offsetX}
          y={node.y + offsetY}
          width={node.width}
          height={node.height}
          hoveredParticipantId={hoveredParticipantId}
          onHoverParticipant={onHoverParticipant}
          config={config}
          onClick={onMatchClick}
          onDoubleClick={onMatchDoubleClick}
        />
      ))}
    </>
  );
});
