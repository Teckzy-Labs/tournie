import React, { useMemo, useState } from 'react';
import { Tournament, Match, BracketConfig } from '../../types/bracket';
import { calculateBracketLayout, DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from '../../lib/bracket-layout';
import { MatchNode } from './MatchNode';
import { Connectors } from './Connectors';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

interface TournamentBracketProps {
  tournament: Tournament;
  config?: BracketConfig;
}

export function TournamentBracket({ tournament, config: propsConfig = {} }: TournamentBracketProps) {
  const [hoveredParticipantId, setHoveredParticipantId] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [zoomLocked, setZoomLocked] = useState<boolean>(false);
  const bracketRef = React.useRef<HTMLDivElement>(null);
  
  const exportToPDF = async () => {
    if (!bracketRef.current) return;
    try {
      // html-to-image supports modern CSS features (like oklch/lab colors used by Tailwind v4)
      const imgData = await toPng(bracketRef.current, { 
        cacheBust: true, 
        quality: 1,
        pixelRatio: 2 
      });
      
      const img = new window.Image();
      img.onload = () => {
        const pdf = new jsPDF({
          orientation: img.width > img.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [img.width, img.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, img.width, img.height);
        pdf.save(`${tournament.name || 'Tournament'}_Bracket.pdf`);
      };
      img.src = imgData;
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const exportToExcel = () => {
    try {
      const rows = tournament.matches.map(m => ({
        ID: m.id,
        Name: m.name,
        Round: m.tournamentRoundText,
        Status: m.state,
        Participant_1: m.participants[0]?.name || 'TBD',
        Score_1: m.scores[0] ?? '',
        Participant_2: m.participants[1]?.name || 'TBD',
        Score_2: m.scores[1] ?? '',
        Winner: m.participants.find(p => p?.id === m.winnerId)?.name || ''
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bracket Data');
      XLSX.writeFile(wb, `${tournament.name || 'Tournament'}_Bracket.xlsx`);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };

  // Merge the config embedded in the tournament data with any props passed in
  const config = useMemo(() => {
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

  if (!nodes || nodes.length === 0) {
    return <div className="p-8 text-center text-slate-500">No bracket data available.</div>;
  }

  // Calculate required container dimensions based on groups bounding box if available, otherwise fallback
  let minX = 0, minY = 0, maxX = 0, maxY = 0;
  if (groups && groups.length > 0) {
    minX = Math.min(...groups.map(g => g.x));
    minY = Math.min(...groups.map(g => g.y));
    maxX = Math.max(...groups.map(g => g.x + g.width));
    maxY = Math.max(...groups.map(g => g.y + g.height));
  } else {
    maxX = Math.max(...nodes.map(n => n.x)) + (config.nodeWidth || DEFAULT_NODE_WIDTH);
    maxY = Math.max(...nodes.map(n => n.y)) + (config.nodeHeight || DEFAULT_NODE_HEIGHT);
  }

  // Add some padding
  const containerWidth = maxX - minX + 100;
  const containerHeight = maxY - minY + 100;

  // We need to shift everything if minX or minY is negative
  const offsetX = minX < 0 ? Math.abs(minX) + 50 : 50;
  const offsetY = minY < 0 ? Math.abs(minY) + 50 : 50;

  return (
    <div className={`w-full h-full relative overflow-hidden bg-slate-50/50 p-0 rounded-xl border border-slate-200 shadow-inner group/bracket flex flex-col ${config.classNames?.wrapper || ''}`}>
      <div className="flex-1 relative overflow-hidden" ref={bracketRef}>
      <TransformWrapper
        initialScale={1}
        minScale={0.3}
        maxScale={2}
        centerOnInit={false}
        initialPositionX={20}
        initialPositionY={20}
        wheel={{ step: 0.02, disabled: zoomLocked }}
        panning={{ disabled: false }}
        pinch={{ disabled: zoomLocked, step: 3 }}
        doubleClick={{ disabled: zoomLocked, mode: 'reset' }}
        limitToBounds={false}
      >
        {({ zoomIn, zoomOut, resetTransform, zoomToElement }) => (
          <>
            <div className="absolute top-4 right-4 z-20 flex gap-1 bg-white/95 backdrop-blur shadow-sm border border-slate-200 p-1.5 rounded-lg opacity-100 transition-opacity">
              <button
                onClick={() => setZoomLocked(!zoomLocked)}
                className={`p-1.5 rounded-md transition-colors ${zoomLocked ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'}`}
                title={zoomLocked ? "Unlock Zoom" : "Lock Zoom"}
              >
                {zoomLocked ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
                )}
              </button>
              <div className="w-px bg-slate-200 my-1 mx-0.5"></div>
              <button disabled={zoomLocked} onClick={() => zoomIn()} className={`p-1.5 rounded-md transition-colors ${zoomLocked ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'}`} title="Zoom In">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
              </button>
              <button disabled={zoomLocked} onClick={() => zoomOut()} className={`p-1.5 rounded-md transition-colors ${zoomLocked ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'}`} title="Zoom Out">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
              </button>
              <div className="w-px bg-slate-200 my-1 mx-0.5"></div>
              <button disabled={zoomLocked} onClick={() => resetTransform()} className={`p-1.5 rounded-md transition-colors ${zoomLocked ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'}`} title="Fit to Screen">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v6h6M20 10V4h-6M10 20H4v-6M14 4h6v6" /></svg>
              </button>
              <div className="w-px bg-slate-200 my-1 mx-0.5"></div>
              <button onClick={exportToPDF} className="p-1.5 rounded-md text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors" title="Export PDF">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15v-4"/><path d="M12 15v-4"/><path d="M15 15v-4"/></svg>
              </button>
              <button onClick={exportToExcel} className="p-1.5 rounded-md text-slate-600 hover:text-green-600 hover:bg-green-50 transition-colors" title="Export Excel">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </button>
            </div>

            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ padding: '80px' }}>
              <div
                className="relative"
                style={{ width: containerWidth, height: containerHeight }}
              >
                {groups?.map(group => (
                  <div
                    key={group.id}
                    className="absolute border border-slate-700/20 bg-slate-800/5 rounded-2xl pointer-events-none"
                    style={{
                      left: group.x + offsetX,
                      top: group.y + offsetY,
                      width: group.width,
                      height: group.height
                    }}
                  >
                    <div className="absolute -top-3 left-6 px-3 bg-slate-50/90 backdrop-blur rounded-full text-xs font-bold uppercase tracking-widest text-slate-500 border border-slate-200">
                      {group.title}
                    </div>
                  </div>
                ))}
                <Connectors
                  connectors={connectors.map(c => ({ ...c, startX: c.startX + offsetX, endX: c.endX + offsetX, startY: c.startY + offsetY, endY: c.endY + offsetY }))}
                  nodes={nodes}
                  width={containerWidth}
                  height={containerHeight}
                  hoveredParticipantId={hoveredParticipantId}
                  className={config.classNames?.connector}
                  highlightedClassName={config.classNames?.connectorHighlighted}
                />
                {nodes.map(node => (
                  <MatchNode
                    key={node.id}
                    match={node}
                    x={node.x + offsetX}
                    y={node.y + offsetY}
                    width={node.width}
                    height={node.height}
                    hoveredParticipantId={hoveredParticipantId}
                    onHoverParticipant={setHoveredParticipantId}
                    config={config}
                    onClick={(match) => {
                      config.onMatchClick?.(match);
                    }}
                    onDoubleClick={(match) => {
                      config.onMatchDoubleClick?.(match);
                      setSelectedMatch(match);
                      if (!zoomLocked) {
                        zoomToElement(match.id, 1.2, 500); // 1.2 scale, 500ms animation
                      }
                    }}
                  />
                ))}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
      </div>

      <div className="bg-white border-t border-slate-200 py-2 px-4 flex items-center justify-center shrink-0 z-10 shadow-sm relative">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          Made with <span className="text-rose-500">❤️</span> by <span className="font-bold text-indigo-600">AKASH Singh</span>
        </p>
      </div>

      {selectedMatch && (
        config.renderMatchDetailsDialog
          ? config.renderMatchDetailsDialog(selectedMatch, () => setSelectedMatch(null))
          : (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-indigo-900">{selectedMatch.name}</h3>
                    <p className="text-sm text-indigo-700/80">{selectedMatch.tournamentRoundText}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMatch(null)}
                    className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex flex-col gap-3">
                    {[0, 1].map((i) => {
                      const p = selectedMatch.participants[i];
                      const s = selectedMatch.scores[i];
                      const isWinner = selectedMatch.winnerId && p?.id === selectedMatch.winnerId;

                      return (
                        <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${isWinner ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center gap-3">
                            {p?.seed && <span className="text-xs font-mono text-slate-400 w-4">{p.seed}</span>}
                            <span className={`font-medium ${isWinner ? 'text-emerald-900' : 'text-slate-700'}`}>
                              {p ? p.name : 'TBD'}
                            </span>
                          </div>
                          <span className={`text-lg font-bold ${isWinner ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {s ?? '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-sm text-center text-slate-500 mt-4 pt-4 border-t border-slate-100">
                    Status: {selectedMatch.state}
                  </div>
                </div>
              </div>
            </div>
          )
      )}
    </div>
  );
}
