'use client';

import React, { useMemo, useState } from 'react';
import { Tournament } from '../../types/bracket';
import { calculateBracketLayout, NODE_HEIGHT, NODE_WIDTH } from '../../lib/bracket-layout';
import { MatchNode } from './MatchNode';
import { Connectors } from './Connectors';

interface TournamentBracketProps {
  tournament: Tournament;
}

export function TournamentBracket({ tournament }: TournamentBracketProps) {
  const [hoveredParticipantId, setHoveredParticipantId] = useState<string | null>(null);

  const { nodes, connectors } = useMemo(() => {
    return calculateBracketLayout(tournament.matches);
  }, [tournament.matches]);

  if (!nodes || nodes.length === 0) {
    return <div className="p-8 text-center text-slate-500">No bracket data available.</div>;
  }

  // Calculate required container dimensions
  const maxX = Math.max(...nodes.map(n => n.x)) + NODE_WIDTH;
  const maxY = Math.max(...nodes.map(n => n.y)) + NODE_HEIGHT;
  
  // Add some padding
  const containerWidth = maxX + 100;
  const containerHeight = maxY + 100;

  return (
    <div className="w-full h-full overflow-auto bg-slate-50/50 p-8 rounded-xl border border-slate-200 shadow-inner custom-scrollbar relative">
      <div 
        className="relative" 
        style={{ width: containerWidth, height: containerHeight }}
      >
        <Connectors 
            connectors={connectors} 
            nodes={nodes} 
            width={containerWidth} 
            height={containerHeight} 
            hoveredParticipantId={hoveredParticipantId} 
        />
        {nodes.map(node => (
          <MatchNode
            key={node.id}
            match={node}
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            hoveredParticipantId={hoveredParticipantId}
            onHoverParticipant={setHoveredParticipantId}
          />
        ))}
      </div>
    </div>
  );
}
