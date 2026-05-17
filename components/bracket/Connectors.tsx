import React from 'react';
import { Connector, LayoutNode } from '../../types/bracket';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface ConnectorsProps {
  connectors: Connector[];
  nodes: LayoutNode[];
  width: number;
  height: number;
  hoveredParticipantId: string | null;
  className?: string;
  highlightedClassName?: string;
}

export function Connectors({ connectors, nodes, width, height, hoveredParticipantId, className, highlightedClassName }: ConnectorsProps) {
  // Generate a step path for clean bracket lines
  const generatePath = (c: Connector) => {
    const midX = c.startX + (c.endX - c.startX) / 2;
    return `M ${c.startX} ${c.startY} L ${midX} ${c.startY} L ${midX} ${c.endY} L ${c.endX} ${c.endY}`;
  };

  const isConnectorHovered = (c: Connector) => {
    if (!hoveredParticipantId) return false;
    
    // Check if the source match contains the participant
    const sourceNode = nodes.find(n => n.id === c.sourceMatchId);
    // Check if the target match contains the participant
    const targetNode = nodes.find(n => n.id === c.targetMatchId);
    
    const sourceHasParticipant = sourceNode?.participants.some(p => p?.id === hoveredParticipantId);
    const targetHasParticipant = targetNode?.participants.some(p => p?.id === hoveredParticipantId);
    
    return sourceHasParticipant && targetHasParticipant;
  };

  return (
    <svg 
      className="absolute top-0 left-0 pointer-events-none" 
      style={{ width, height }}
    >
      {/* Draw unhighlighted paths first */}
      {connectors.map((c) => (
        <path
          key={c.id}
          d={generatePath(c)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn(
            "transition-colors duration-200",
            hoveredParticipantId && !isConnectorHovered(c) ? "text-slate-100 opacity-30" : (className || "text-slate-300"),
            hoveredParticipantId && isConnectorHovered(c) ? "text-indigo-500 z-10" : ""
          )}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {/* Draw highlighted paths on top */}
      {connectors.filter(isConnectorHovered).map((c) => (
        <path
          key={`${c.id}-highlight`}
          d={generatePath(c)}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className={highlightedClassName || "text-indigo-500"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
