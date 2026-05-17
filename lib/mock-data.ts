import { Match } from '../types/bracket';

// Helper to generate participants
const p = (id: string, name: string, seed?: number) => ({ id, name, seed, status: 'active' as const });

// Helper to generate an 8-player Single Elimination Bracket
export const generateSingleElimination8 = (): Match[] => {
  return [
    // Quarter-Finals (Round 1)
    {
      id: 'm1', name: 'Game 1', nextMatchId: 'm5', tournamentRoundText: 'Quarter-Finals',
      state: 'COMPLETED', participants: [p('p1', 'Player 1', 1), p('p8', 'Player 8', 8)], scores: [2, 0], winnerId: 'p1'
    },
    {
      id: 'm2', name: 'Game 2', nextMatchId: 'm5', tournamentRoundText: 'Quarter-Finals',
      state: 'COMPLETED', participants: [p('p4', 'Player 4', 4), p('p5', 'Player 5', 5)], scores: [1, 2], winnerId: 'p5'
    },
    {
      id: 'm3', name: 'Game 3', nextMatchId: 'm6', tournamentRoundText: 'Quarter-Finals',
      state: 'COMPLETED', participants: [p('p3', 'Player 3', 3), p('p6', 'Player 6', 6)], scores: [2, 1], winnerId: 'p3'
    },
    {
      id: 'm4', name: 'Game 4', nextMatchId: 'm6', tournamentRoundText: 'Quarter-Finals',
      state: 'COMPLETED', participants: [p('p2', 'Player 2', 2), p('p7', 'Player 7', 7)], scores: [2, 0], winnerId: 'p2'
    },
    // Semi-Finals (Round 2)
    {
      id: 'm5', name: 'Game 5', nextMatchId: 'gf', nextLooserMatchId: '3rd', tournamentRoundText: 'Semi-Finals',
      state: 'IN_PROGRESS', participants: [p('p1', 'Player 1', 1), p('p5', 'Player 5', 5)], scores: [1, 0]
    },
    {
      id: 'm6', name: 'Game 6', nextMatchId: 'gf', nextLooserMatchId: '3rd', tournamentRoundText: 'Semi-Finals',
      state: 'SCHEDULED', participants: [p('p3', 'Player 3', 3), p('p2', 'Player 2', 2)], scores: [null, null]
    },
    // Final (Round 3)
    {
      id: 'gf', name: 'Grand Final', tournamentRoundText: 'Grand Final',
      state: 'SCHEDULED', participants: [null, null], scores: [null, null]
    },
    // 3rd Place Match (Sub bracket)
    {
      id: '3rd', name: '3rd Place Match', tournamentRoundText: '3rd Place',
      state: 'SCHEDULED', participants: [null, null], scores: [null, null]
    }
  ];
};

export const generateComplexPlacementTournament = (): Match[] => {
    return [
        // Main Bracket
        {
            id: 'sf1', name: 'Semi Final 1', nextMatchId: 'f1', nextLooserMatchId: '3rd', tournamentRoundText: 'Semifinals',
            state: 'COMPLETED', participants: [p('p1', 'Player 1'), p('p2', 'Player 2')], scores: [3, 1], winnerId: 'p1', group: 'Championship Bracket'
        },
        {
            id: 'sf2', name: 'Semi Final 2', nextMatchId: 'f1', nextLooserMatchId: '3rd', tournamentRoundText: 'Semifinals',
            state: 'COMPLETED', participants: [p('p3', 'Player 3'), p('p4', 'Player 4')], scores: [0, 3], winnerId: 'p4', group: 'Championship Bracket'
        },
        {
            id: 'f1', name: 'Final', tournamentRoundText: 'Final',
            state: 'SCHEDULED', participants: [p('p1', 'Player 1'), p('p4', 'Player 4')], scores: [null, null], group: 'Championship Bracket'
        },
        // 3rd Place Match (Disconnected from Winners Final nextMatchId, but fed by Losers of SF)
        {
            id: '3rd', name: '3rd Place Match', tournamentRoundText: 'Placement',
            state: 'SCHEDULED', participants: [p('p2', 'Player 2'), p('p3', 'Player 3')], scores: [null, null], group: '3rd Place Bracket'
        },
        // 17th Place Standalone Bracket (completely disconnected)
        {
            id: '17th-sf1', name: '17th Place SF1', nextMatchId: '17th-f', tournamentRoundText: '17th Place Semis',
            state: 'COMPLETED', participants: [p('p17', 'Player 17'), p('p18', 'Player 18')], scores: [2, 1], winnerId: 'p17', group: '17th Place Bracket'
        },
        {
            id: '17th-sf2', name: '17th Place SF2', nextMatchId: '17th-f', tournamentRoundText: '17th Place Semis',
            state: 'COMPLETED', participants: [p('p19', 'Player 19'), p('p20', 'Player 20')], scores: [0, 2], winnerId: 'p20', group: '17th Place Bracket'
        },
        {
            id: '17th-f', name: '17th Place Final', tournamentRoundText: '17th Place Final',
            state: 'SCHEDULED', participants: [p('p17', 'Player 17'), p('p20', 'Player 20')], scores: [null, null], group: '17th Place Bracket'
        }
    ];
};

export const generateDoubleElimination4 = (): Match[] => {
    // A simplified 4-player double elimination
    return [
        // Winner Bracket R1
        {
            id: 'wb1', name: 'WB Game 1', nextMatchId: 'wb3', nextLooserMatchId: 'lb1', tournamentRoundText: 'WB Round 1',
            state: 'COMPLETED', participants: [p('p1', 'Player 1'), p('p4', 'Player 4')], scores: [2, 0], winnerId: 'p1'
        },
        {
            id: 'wb2', name: 'WB Game 2', nextMatchId: 'wb3', nextLooserMatchId: 'lb1', tournamentRoundText: 'WB Round 1',
            state: 'COMPLETED', participants: [p('p2', 'Player 2'), p('p3', 'Player 3')], scores: [1, 2], winnerId: 'p3'
        },
        // Winner Bracket Final
        {
            id: 'wb3', name: 'WB Final', nextMatchId: 'gf', nextLooserMatchId: 'lb2', tournamentRoundText: 'WB Final',
            state: 'COMPLETED', participants: [p('p1', 'Player 1'), p('p3', 'Player 3')], scores: [2, 1], winnerId: 'p1'
        },
        // Loser Bracket R1
        {
            id: 'lb1', name: 'LB Game 1', nextMatchId: 'lb2', tournamentRoundText: 'LB Round 1', isLoserBracket: true,
            state: 'COMPLETED', participants: [p('p4', 'Player 4'), p('p2', 'Player 2')], scores: [0, 2], winnerId: 'p2'
        },
        // Loser Bracket Final
        {
            id: 'lb2', name: 'LB Final', nextMatchId: 'gf', tournamentRoundText: 'LB Final', isLoserBracket: true,
            state: 'COMPLETED', participants: [p('p2', 'Player 2'), p('p3', 'Player 3')], scores: [2, 1], winnerId: 'p2'
        },
        // Grand Final
        {
            id: 'gf', name: 'Grand Final', tournamentRoundText: 'Grand Final',
            state: 'SCHEDULED', participants: [p('p1', 'Player 1'), p('p2', 'Player 2')], scores: [null, null]
        }
    ];
}
