'use client';

import React, { useState, useMemo } from 'react';
import { generateSingleElimination8, generateDoubleElimination4 } from '../lib/mock-data';
import { generateDynamicSingleElimination } from '../lib/bracket-generator';
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
  }
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('se8');
  const [customPlayers, setCustomPlayers] = useState<number>(10);
  
  const currentTournament = useMemo(() => {
    if (activeTab === 'custom') {
      return {
        id: 'custom',
        name: `Custom Bracket (${customPlayers} Players)`,
        type: 'SINGLE_ELIMINATION' as const,
        matches: generateDynamicSingleElimination(customPlayers),
      };
    }
    return tournaments[activeTab];
  }, [activeTab, customPlayers]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10 px-6 py-4 flex flex-wrap gap-4 items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-indigo-900 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Dynamic Bracket Lib
        </h1>
        <div className="flex flex-wrap gap-2 items-center">
          {Object.values(tournaments).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === t.id 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.name}
            </button>
          ))}
          <div className={`flex items-center gap-2 px-2 py-1 rounded-md border transition-colors ${activeTab === 'custom' ? 'border-indigo-600 bg-indigo-50' : 'border-transparent bg-slate-100'}`}>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-2 py-1 rounded-md text-sm font-medium ${
                activeTab === 'custom' ? 'text-indigo-700' : 'text-slate-600'
              }`}
            >
              Custom
            </button>
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
            <span className="text-sm text-slate-500">players</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col overflow-hidden bg-slate-50/50">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-1">{currentTournament.name}</h2>
          <p className="text-slate-500 text-sm">Responsive SVG paths, dynamic layouts, and path tracking. Try hovering over a player!</p>
        </div>
        
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
          <TournamentBracket tournament={currentTournament} />
        </div>
      </main>
    </div>
  );
}
