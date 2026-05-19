import React, { useMemo } from 'react';
import { Connector, LayoutNode } from '../../types/bracket';
import { routeConnectors } from '../../lib/layout-engine';
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

export const Connectors = React.memo(function Connectors({ connectors, nodes, width, height, hoveredParticipantId, className, highlightedClassName }: ConnectorsProps) {
  const participantIdsByNodeId = useMemo(() => {
    return new Map(
      nodes.map((node) => [
        node.id,
        new Set(node.participants.flatMap((participant) => participant?.id ? [participant.id] : []))
      ])
    );
  }, [nodes]);

  const connectorPaths = useMemo(() => {
    return routeConnectors(connectors);
  }, [connectors]);

  const highlightedConnectorIds = useMemo(() => {
    if (!hoveredParticipantId) return new Set<string>();

    return new Set(
      connectors
        .filter((connector) => {
          const sourceHasParticipant = participantIdsByNodeId.get(connector.sourceMatchId)?.has(hoveredParticipantId);
          const targetHasParticipant = participantIdsByNodeId.get(connector.targetMatchId)?.has(hoveredParticipantId);

          return sourceHasParticipant && targetHasParticipant;
        })
        .map((connector) => connector.id)
    );
  }, [connectors, hoveredParticipantId, participantIdsByNodeId]);

  const isConnectorHovered = (connector: Connector) => {
    return highlightedConnectorIds.has(connector.id);
  };

  const getConnectorClassName = (connector: Connector) => {
    if (hoveredParticipantId && !isConnectorHovered(connector)) {
      return 'text-slate-100 opacity-30';
    }

    if (hoveredParticipantId && isConnectorHovered(connector)) {
      return 'text-indigo-500 z-10';
    }

    return className || 'text-slate-300';
  };

  const highlightedConnectorPaths = useMemo(() => {
    return connectorPaths.filter(({ connector }) => highlightedConnectorIds.has(connector.id));
  }, [connectorPaths, highlightedConnectorIds]);

  return (
    <svg 
      className="absolute top-0 left-0 pointer-events-none" 
      style={{ width, height }}
    >
      {/* Draw unhighlighted paths first */}
      {connectorPaths.map(({ connector, path }) => (
        <path
          key={connector.id}
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn(
            "transition-colors duration-200",
            getConnectorClassName(connector)
          )}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {/* Draw highlighted paths on top */}
      {highlightedConnectorPaths.map(({ connector, path }) => (
        <path
          key={`${connector.id}-highlight`}
          d={path}
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
});
