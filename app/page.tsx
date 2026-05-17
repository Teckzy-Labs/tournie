'use client';

import React, { useState, useMemo } from 'react';
import { generateSingleElimination8, generateDoubleElimination4, generateComplexPlacementTournament, generateCompletedTournament } from '../lib/mock-data';
import { generateDynamicSingleElimination, generateDynamicDoubleElimination } from '../lib/bracket-generator';
import { TournamentBracket } from '../components/bracket/TournamentBracket';
import { Tournament } from '../types/bracket';

const tournaments: Record<string, Tournament> = {
  se8: {
    id: 'se8',
    name: 'Single Elimination (8 Players)',
    type: 'SINGLE_ELIMINATION',
    matches: generateSingleElimination8(),
  },
  de4: {
    id: 'de4',
    name: 'Double Elimination (4 Players)',
    type: 'DOUBLE_ELIMINATION',
    matches: generateDoubleElimination4(),
  },
  complex: {
    id: 'complex',
    name: 'Complex Placement (17th, 3rd)',
    type: 'MULTI_STAGE',
    matches: generateComplexPlacementTournament(),
    config: {
      classNames: {
        wrapper: 'bg-slate-900',
        connector: 'text-slate-700',
        connectorHighlighted: 'text-emerald-400'
      }
    }
  },
  compSE16: {
    id: 'compSE16',
    name: 'Completed SE (16P)',
    type: 'SINGLE_ELIMINATION',
    matches: generateCompletedTournament(16, false),
  },
  compDE12: {
    id: 'compDE12',
    name: 'Completed DE (12P)',
    type: 'DOUBLE_ELIMINATION',
    matches: generateCompletedTournament(12, true),
  }
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('se8');
  const [customPlayers, setCustomPlayers] = useState<number>(10);
  const [customFormat, setCustomFormat] = useState<'SE' | 'DE'>('SE');
  const [useCustomTheme, setUseCustomTheme] = useState<boolean>(false);
  const [showData, setShowData] = useState<boolean>(false);
  
  const currentTournament = useMemo(() => {
    if (activeTab === 'custom') {
      const isDouble = customFormat === 'DE';
      return {
        id: 'custom',
        name: `Custom Bracket (${customPlayers} Players, ${isDouble ? 'Double' : 'Single'} Elimination)`,
        type: isDouble ? 'DOUBLE_ELIMINATION' as const : 'SINGLE_ELIMINATION' as const,
        matches: isDouble 
          ? generateDynamicDoubleElimination(customPlayers) 
          : generateDynamicSingleElimination(customPlayers),
      };
    }
    return tournaments[activeTab];
  }, [activeTab, customPlayers, customFormat]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col overflow-hidden">
      <header className="border-b border-slate-200 bg-white z-10 px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between shrink-0">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-indigo-900 flex items-center gap-2 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Dynamic Bracket Lib
        </h1>
        <div className="flex overflow-x-auto pb-2 sm:pb-0 hide-scrollbar gap-2 items-center w-full sm:w-auto">
          {Object.values(tournaments).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === t.id 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.name}
            </button>
          ))}
          <div className={`flex shrink-0 items-center gap-2 px-2 py-1 rounded-md border transition-colors ${activeTab === 'custom' ? 'border-indigo-600 bg-indigo-50' : 'border-transparent bg-slate-100'}`}>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-2 py-1 rounded-md text-sm font-medium whitespace-nowrap ${
                activeTab === 'custom' ? 'text-indigo-700' : 'text-slate-600'
              }`}
            >
              Custom
            </button>
            <select
              value={customFormat}
              onChange={(e) => {
                setCustomFormat(e.target.value as 'SE' | 'DE');
                setActiveTab('custom');
              }}
              className="text-sm bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 py-1 px-1"
            >
              <option value="SE">Single Elim</option>
              <option value="DE">Double Elim</option>
            </select>
            <input 
              type="number" 
              min="2" 
              max="128"
              value={customPlayers}
              onChange={(e) => {
                setCustomPlayers(parseInt(e.target.value) || 2);
                setActiveTab('custom');
              }}
              className="w-16 px-2 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-500 hidden sm:inline">players</span>
          </div>
          <div className="flex items-center shrink-0 gap-2 px-3 py-1.5 sm:ml-2 border-l border-slate-200">
            <input 
              type="checkbox" 
              id="customTheme" 
              checked={useCustomTheme}
              onChange={(e) => setUseCustomTheme(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="customTheme" className="text-sm font-medium text-slate-700 cursor-pointer whitespace-nowrap">
              Use Custom Theme
            </label>
          </div>
          <button
            onClick={() => setShowData(!showData)}
            className="px-3 py-1.5 sm:ml-2 border shrink-0 border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            {showData ? 'Hide Data' : 'Show Data'}
          </button>
        </div>
      </header>

      <main className="flex-1 p-2 sm:p-6 flex flex-col min-h-0 bg-slate-50/50">
        <div className="mb-2 sm:mb-4 shrink-0">
          <h2 className="text-lg sm:text-2xl font-semibold mb-1">{currentTournament.name}</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Responsive SVG paths, dynamic layouts, and path tracking. Try hovering over a player!</p>
        </div>
        
        <div className="flex-1 flex gap-4 min-h-0">
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative">
            <TournamentBracket 
              tournament={currentTournament} 
              config={useCustomTheme ? {
                nodeWidth: 260,
                nodeHeight: 90,
                classNames: {
                  wrapper: 'bg-zinc-900',
                  connector: 'text-zinc-700',
                  connectorHighlighted: 'text-amber-500'
                },
                renderMatch: (props) => (
                  <div 
                    className="bg-zinc-800 border-2 border-zinc-700 rounded-lg h-full flex flex-col overflow-hidden text-zinc-100 hover:border-amber-500 transition-colors"
                    onDoubleClick={() => props.onDoubleClick?.(props.match)}
                  >
                    <div className="bg-zinc-900 px-2 py-1 text-xs text-amber-500 font-bold tracking-widest text-center">
                      🏆 {props.match.name}
                    </div>
                    <div className="flex-1 flex flex-col justify-around p-2">
                      {[0, 1].map(i => {
                        const p = props.match.participants[i];
                        const isWinner = props.match.winnerId === p?.id;
                        return (
                          <div key={i} className={`flex justify-between items-center ${isWinner ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}>
                            <div className="flex items-center gap-2">
                              {p && <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[10px]">🤖</div>}
                              <span>{p ? p.name : 'BYE'}</span>
                            </div>
                            <span>{props.match.scores[i] ?? '-'}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              } : undefined}
            />
          </div>
          
          {showData && (
            <div className="w-1/3 min-w-[300px] bg-slate-900 rounded-xl shadow-sm border border-slate-800 flex flex-col overflow-hidden">
              <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-sm font-medium text-slate-200">Current Bracket JSON</h3>
                <button 
                  onClick={() => setShowData(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <pre className="text-xs text-emerald-400 font-mono">
                  {JSON.stringify(currentTournament, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
