import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Tournament, Match, BracketConfig, LayoutGroup, LayoutNode } from '../../types/bracket';
import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from '../../lib/bracket-layout';
import { calculateBracketLayout } from '../../lib/layout-engine';
import { DEFAULT_VIEWPORT_STATE } from '../../lib/viewport';
import { exportBracketToExcel, exportBracketToPDF } from '../../services/export';
import { BracketViewport } from './BracketViewport';
import { MatchDialog } from './MatchDialog';

interface TournamentBracketProps {
  tournament: Tournament;
  config?: BracketConfig;

  // NEW: viewMode to control behaviour
  // ToDo: Implement all view modes later
  viewMode?: 'interactive' | 'readonly' | 'broadcast';
  editMode?: boolean;
  virtualization?: boolean;
  renderStrategy?: 'svg' | 'canvas' | 'hybrid';
}

function getCanvasMetrics(
  nodes: LayoutNode[],
  groups: LayoutGroup[],
  nodeWidth?: number,
  nodeHeight?: number
) {
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;

  if (groups.length > 0) {
    minX = Math.min(...groups.map((group) => group.x));
    minY = Math.min(...groups.map((group) => group.y));
    maxX = Math.max(...groups.map((group) => group.x + group.width));
    maxY = Math.max(...groups.map((group) => group.y + group.height));
  } else {
    maxX = Math.max(...nodes.map((node) => node.x)) + (nodeWidth || DEFAULT_NODE_WIDTH);
    maxY = Math.max(...nodes.map((node) => node.y)) + (nodeHeight || DEFAULT_NODE_HEIGHT);
  }

  return {
    width: maxX - minX + 100,
    height: maxY - minY + 100,
    offsetX: minX < 0 ? Math.abs(minX) + 50 : 50,
    offsetY: minY < 0 ? Math.abs(minY) + 50 : 50
  };
}

export function TournamentBracket({ tournament, config: propsConfig = {}, virtualization = false }: TournamentBracketProps) {
  const [hoveredParticipantId, setHoveredParticipantId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [zoomLocked, setZoomLocked] = useState<boolean>(false);
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT_STATE);
  const bracketRef = useRef<HTMLDivElement>(null);

  const config = useMemo<BracketConfig>(() => {
    return {
      ...propsConfig,
      ...tournament.config,
      classNames: {
        ...propsConfig.classNames,
        ...tournament.config?.classNames
      }
    };
  }, [propsConfig, tournament.config]);

  const { nodes, connectors, groups } = useMemo(() => {
    return calculateBracketLayout(tournament.matches, {
      nodeWidth: config.nodeWidth,
      nodeHeight: config.nodeHeight
    });
  }, [tournament.matches, config.nodeWidth, config.nodeHeight]);

  const selectedMatch = useMemo(() => {
    if (!selectedMatchId) return null;
    return tournament.matches.find((match) => match.id === selectedMatchId) || null;
  }, [selectedMatchId, tournament.matches]);

  const canvasMetrics = useMemo(
    () => getCanvasMetrics(nodes, groups, config.nodeWidth, config.nodeHeight),
    [nodes, groups, config.nodeWidth, config.nodeHeight]
  );

  const handleToggleZoomLock = useCallback(() => {
    setZoomLocked((locked) => !locked);
  }, []);

  const handleExportPDF = useCallback(() => {
    if (!bracketRef.current) return;
    void exportBracketToPDF(bracketRef.current, tournament.name);
  }, [tournament.name]);

  const handleExportExcel = useCallback(() => {
    exportBracketToExcel(tournament);
  }, [tournament]);

  const handleMatchClick = useCallback((match: Match) => {
    config.onMatchClick?.(match);
  }, [config]);

  const handleMatchDoubleClick = useCallback((
    match: Match,
    zoomToElement: (id: string, scale?: number, animationTime?: number) => void
  ) => {
    config.onMatchDoubleClick?.(match);
    setSelectedMatchId(match.id);

    if (!zoomLocked) {
      zoomToElement(match.id, 1.2, 500);
    }
  }, [config, zoomLocked]);

  const handleCloseDialog = useCallback(() => {
    setSelectedMatchId(null);
  }, []);

  if (!nodes || nodes.length === 0) {
    return <div className="p-8 text-center text-slate-500">No bracket data available.</div>;
  }

  return (
    <div className={`w-full h-full relative overflow-hidden bg-slate-50/50 p-0 rounded-xl border border-slate-200 shadow-inner group/bracket flex flex-col ${config.classNames?.wrapper || ''}`}>
      <BracketViewport
        bracketRef={bracketRef}
        zoomLocked={zoomLocked}
        onToggleZoomLock={handleToggleZoomLock}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        nodes={nodes}
        connectors={connectors}
        groups={groups}
        width={canvasMetrics.width}
        height={canvasMetrics.height}
        offsetX={canvasMetrics.offsetX}
        offsetY={canvasMetrics.offsetY}
        hoveredParticipantId={hoveredParticipantId}
        onHoverParticipant={setHoveredParticipantId}
        onMatchClick={handleMatchClick}
        onMatchDoubleClick={handleMatchDoubleClick}
        onViewportChange={setViewport}
        viewport={viewport}
        showMinimap={config.showMinimap ?? true}
        virtualizationEnabled={virtualization || Boolean(config.enableVirtualization)}
        config={config}
      />

      <div className="bg-white border-t border-slate-200 py-2 px-4 flex items-center justify-center shrink-0 z-10 shadow-sm relative">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          Made with <span className="text-rose-500">❤️</span> by <span className="font-bold text-indigo-600">AKASH Singh</span>
        </p>
      </div>

      <MatchDialog match={selectedMatch} config={config} onClose={handleCloseDialog} />
    </div>
  );
}
