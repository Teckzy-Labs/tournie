import { Match, Participant } from '../types/bracket';

// Helper to calculate the next power of two
function nextPowerOfTwo(n: number) {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

export function generateDynamicSingleElimination(numPlayers: number): Match[] {
  if (numPlayers < 2) return [];

  const P = nextPowerOfTwo(numPlayers);
  const byes = P - numPlayers;
  const matches: Match[] = [];

  // Generate participants
  const participants: Participant[] = Array.from({ length: numPlayers }).map((_, i) => ({
    id: `p${i + 1}`,
    name: `Player ${i + 1}`,
    seed: i + 1,
    status: 'active'
  }));

  // Create leaf nodes (Round 1 matches)
  const numMatchesR1 = P / 2;
  const r1Matches: Match[] = [];
  
  // We need to distribute byes. Usually seed 1 gets a bye, then seed 2, etc.
  // For simplicity, we just assign byes to the first few matches.
  let pIndex = 0;
  for (let i = 0; i < numMatchesR1; i++) {
    const isBye = i < byes;
    const p1 = participants[pIndex++];
    const p2 = isBye ? null : participants[pIndex++];
    
    r1Matches.push({
      id: `m-1-${i}`,
      name: `R1 Match ${i + 1}`,
      tournamentRoundText: 'Round 1',
      state: isBye ? 'COMPLETED' : 'SCHEDULED',
      participants: [p1, p2],
      scores: [null, null],
      winnerId: isBye ? p1.id : undefined,
    });
  }

  // Now build the rest of the tree (Round 2 to Final)
  let currentRoundMatches = r1Matches;
  matches.push(...r1Matches);
  let roundNum = 2;

  while (currentRoundMatches.length > 1) {
    const nextRoundMatches: Match[] = [];
    for (let i = 0; i < currentRoundMatches.length; i += 2) {
      const match1 = currentRoundMatches[i];
      const match2 = currentRoundMatches[i + 1];
      
      const nextMatchId = `m-${roundNum}-${i/2}`;
      
      // Update previous matches to point to this one
      match1.nextMatchId = nextMatchId;
      match2.nextMatchId = nextMatchId;

      const isFinal = currentRoundMatches.length === 2;
      const roundText = isFinal ? 'Final' : currentRoundMatches.length === 4 ? 'Semi-Finals' : currentRoundMatches.length === 8 ? 'Quarter-Finals' : `Round ${roundNum}`;

      const newMatch: Match = {
        id: nextMatchId,
        name: isFinal ? 'Final' : `${roundText} M${i/2 + 1}`,
        tournamentRoundText: roundText,
        state: 'SCHEDULED',
        // If the previous match was a BYE, the winner automatically advances
        participants: [
          match1.winnerId ? match1.participants.find(p => p?.id === match1.winnerId) || null : null,
          match2.winnerId ? match2.participants.find(p => p?.id === match2.winnerId) || null : null,
        ],
        scores: [null, null],
      };
      
      nextRoundMatches.push(newMatch);
    }
    matches.push(...nextRoundMatches);
    currentRoundMatches = nextRoundMatches;
    roundNum++;
  }

  return matches;
}
