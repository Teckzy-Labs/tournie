import React, { useCallback } from 'react';
import { Match, Participant } from '../../types/bracket';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MatchNodeProps {
  match: Match;
  x: number;
  y: number;
  width: number;
  height: number;
  hoveredParticipantId: string | null;
  onHoverParticipant: (id: string | null) => void;
  onClick?: (match: Match) => void;
  onDoubleClick?: (match: Match) => void;
  config?: import('../../types/bracket').BracketConfig;
}

export const MatchNode = React.memo(function MatchNode({ match, x, y, width, height, hoveredParticipantId, onHoverParticipant, onClick, onDoubleClick, config }: MatchNodeProps) {
  const [p1, p2] = match.participants;
  const [s1, s2] = match.scores;

  const hasHoveredParticipant = hoveredParticipantId && match.participants.some(p => p?.id === hoveredParticipantId);
  const isDimmed = hoveredParticipantId && !hasHoveredParticipant;

  const handleClick = useCallback(() => {
    onClick?.(match);
  }, [match, onClick]);

  const handleDoubleClick = useCallback(() => {
    onDoubleClick?.(match);
  }, [match, onDoubleClick]);

  const renderParticipant = useCallback((p: Participant | null, score: number | null, isWinner: boolean) => {
    if (!p) {
      // If the match is completed and this participant is null, it means it's a BYE
      const isBye = match.state === 'COMPLETED';
      return (
        <div className="flex items-center justify-between px-3 py-1.5 opacity-50 bg-slate-50 border-b border-slate-100 last:border-0 h-10">
           <span className="text-sm text-slate-400 italic font-medium">{isBye ? 'BYE' : 'TBD'}</span>
        </div>
      );
    }
    
    const isThisHovered = hoveredParticipantId === p.id;

    return (
      <div 
        onMouseEnter={() => onHoverParticipant(p.id)}
        onMouseLeave={() => onHoverParticipant(null)}
        className={cn(
        "flex items-center justify-between px-3 py-1.5 h-10 border-b border-slate-100 last:border-0 transition-colors cursor-pointer",
        isWinner ? "bg-emerald-50/50 font-medium text-emerald-950" : "bg-white text-slate-700",
        p.status === 'eliminated' && "opacity-60 grayscale",
        isThisHovered && "bg-indigo-50"
      )}>
        <div className="flex items-center gap-2">
          {p.seed && <span className="text-xs text-slate-400 font-mono w-4">{p.seed}</span>}
          <span className={cn("text-sm truncate max-w-[120px]", isThisHovered && "text-indigo-700 font-semibold")}>{p.name}</span>
        </div>
        <div className={cn(
          "text-sm w-6 text-center rounded bg-slate-100/50",
          isWinner ? "font-bold text-emerald-700" : "text-slate-600",
          isThisHovered && "text-indigo-700 bg-indigo-100/50"
        )}>
          {score ?? '-'}
        </div>
      </div>
    );
  }, [hoveredParticipantId, match.state, onHoverParticipant]);

  if (config?.renderMatch) {
    return (
      <div id={match.id} style={{ position: 'absolute', left: x, top: y, width, height }}>
        {config.renderMatch({
          match,
          x, y, width, height,
          hoveredParticipantId,
          onHoverParticipant,
          onClick,
          onDoubleClick
        })}
      </div>
    );
  }

  const isLive = match.state === 'IN_PROGRESS';

  return (
    <div
      id={match.id}
      className={`absolute flex flex-col transition-all duration-200 z-10 ${isDimmed ? "opacity-30 grayscale" : "opacity-100"}`}
      style={{
        left: x,
        top: y,
        width,
        height
      }}
    >
      {/* External Header */}
      <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1 px-1">
        <span className="truncate">{match.tournamentRoundText} • {match.name}</span>
        {isLive && (
          <div className="flex items-center gap-1 text-red-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span>LIVE</span>
          </div>
        )}
      </div>
      
      {/* Match Card */}
      <div 
        className={`flex-1 flex flex-col bg-white rounded-lg shadow-sm border ${isLive ? 'border-red-400 shadow-[0_0_15px_rgba(248,113,113,0.3)]' : 'border-slate-200'} overflow-hidden hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer ${hasHoveredParticipant ? 'ring-1 ring-indigo-400' : ''}`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {renderParticipant(p1, s1, match.winnerId === p1?.id)}
        {renderParticipant(p2, s2, match.winnerId === p2?.id)}
      </div>
    </div>
  );
});
