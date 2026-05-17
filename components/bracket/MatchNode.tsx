import React from 'react';
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
  onDoubleClick?: (match: Match) => void;
  config?: import('../../types/bracket').BracketConfig;
}

export function MatchNode({ match, x, y, width, height, hoveredParticipantId, onHoverParticipant, onDoubleClick, config }: MatchNodeProps) {
  const [p1, p2] = match.participants;
  const [s1, s2] = match.scores;

  const hasHoveredParticipant = hoveredParticipantId && match.participants.some(p => p?.id === hoveredParticipantId);
  const isDimmed = hoveredParticipantId && !hasHoveredParticipant;

  const renderParticipant = (p: Participant | null, score: number | null, isWinner: boolean) => {
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
  };

  if (config?.renderMatch) {
    return (
      <div id={match.id} style={{ position: 'absolute', left: x, top: y, width, height }}>
        {config.renderMatch({
          match,
          x, y, width, height,
          hoveredParticipantId,
          onHoverParticipant,
          onDoubleClick
        })}
      </div>
    );
  }

  return (
    <div
      id={match.id}
      className={cn(
        "absolute group transition-opacity duration-200",
        isDimmed ? "opacity-30 grayscale" : "opacity-100"
      )}
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
    >
      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 px-1">
        {match.tournamentRoundText} • {match.name}
      </div>
      <div 
        className={cn(
          "flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all cursor-pointer",
          hasHoveredParticipant && "border-indigo-400 shadow-md ring-1 ring-indigo-400"
        )}
        onDoubleClick={() => onDoubleClick?.(match)}
      >
        {renderParticipant(p1, s1, match.winnerId === p1?.id)}
        {renderParticipant(p2, s2, match.winnerId === p2?.id)}
      </div>
    </div>
  );
}
