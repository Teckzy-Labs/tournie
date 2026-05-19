import React from 'react';
import { BracketConfig, Match } from '../../types/bracket';

interface MatchDialogProps {
  match: Match | null;
  config: BracketConfig;
  onClose: () => void;
}

export const MatchDialog = React.memo(function MatchDialog({
  match,
  config,
  onClose
}: MatchDialogProps) {
  if (!match) return null;

  if (config.renderMatchDetailsDialog) {
    return config.renderMatchDetailsDialog(match, onClose);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-indigo-900">{match.name}</h3>
            <p className="text-sm text-indigo-700/80">{match.tournamentRoundText}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-3">
            {[0, 1].map((i) => {
              const participant = match.participants[i];
              const score = match.scores[i];
              const isWinner = match.winnerId && participant?.id === match.winnerId;

              return (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${isWinner ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    {participant?.seed && <span className="text-xs font-mono text-slate-400 w-4">{participant.seed}</span>}
                    <span className={`font-medium ${isWinner ? 'text-emerald-900' : 'text-slate-700'}`}>
                      {participant ? participant.name : 'TBD'}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${isWinner ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {score ?? '-'}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-sm text-center text-slate-500 mt-4 pt-4 border-t border-slate-100">
            Status: {match.state}
          </div>
        </div>
      </div>
    </div>
  );
});
