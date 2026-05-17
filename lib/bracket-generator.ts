import { Match, Participant } from '../types/bracket';

// Helper to calculate the next power of two
function nextPowerOfTwo(n: number) {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

export function generateDynamicSingleElimination(numPlayers: number, includeThirdPlace: boolean = true): Match[] {
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

  // Add a 3rd place match if we have semi-finals and flag is true
  if (includeThirdPlace) {
    const finalMatch = matches.find(m => m.name === 'Final');
    if (finalMatch) {
      const sfMatches = matches.filter(m => m.nextMatchId === finalMatch.id);
      if (sfMatches.length === 2) {
        const thirdPlaceMatch: Match = {
          id: '3rd-place',
          name: '3rd Place Match',
          tournamentRoundText: '3rd Place',
          state: 'SCHEDULED',
          participants: [null, null], // populated dynamically by layout if needed or kept empty for UI
          scores: [null, null],
        };
        sfMatches[0].nextLooserMatchId = thirdPlaceMatch.id;
        sfMatches[1].nextLooserMatchId = thirdPlaceMatch.id;
        matches.push(thirdPlaceMatch);
      }
    }
  }

  return matches;
}

export function generateDynamicDoubleElimination(numPlayers: number): Match[] {
  if (numPlayers < 2) return [];

  // 1. Generate the Winner Bracket (WB) which is just a Single Elimination bracket.
  const wbMatches = generateDynamicSingleElimination(numPlayers, false);
  wbMatches.forEach(m => {
    m.name = 'WB ' + m.name;
    m.tournamentRoundText = 'WB ' + m.tournamentRoundText;
  });

  // Extract rounds from WB to easily wire losers
  // We'll group WB matches by depth to figure out who drops where.
  const wbRounds: Match[][] = [];
  const finalMatch = wbMatches.find(m => !m.nextMatchId)!;
  
  let currentRound = wbMatches.filter(m => !wbMatches.some(other => other.nextMatchId === m.id));
  while (currentRound.length > 0) {
    wbRounds.push(currentRound);
    currentRound = currentRound.map(m => wbMatches.find(n => n.id === m.nextMatchId)).filter(Boolean) as Match[];
    // deduplicate
    currentRound = Array.from(new Set(currentRound.map(m => m.id))).map(id => currentRound.find(m => m.id === id)!);
  }

  const lbMatches: Match[] = [];
  
  // Basic LB generation for powers of 2. For non-powers, byes naturally flow down.
  // LB R1 gets losers of WB R1.
  let prevLbMatches: Match[] = [];
  let lbRoundNum = 1;

  for (let i = 0; i < wbRounds.length - 1; i++) {
    const wbDropMatches = wbRounds[i];
    
    // Create drop matches where WB losers drop in.
    // If it's the very first round of WB, losers play each other.
    // In subsequent rounds, WB losers play LB winners.
    
    if (i === 0) {
       // First round of LB: WB R1 losers play each other
       const r1LbMatches: Match[] = [];
       for (let j = 0; j < wbDropMatches.length; j += 2) {
         const m1 = wbDropMatches[j];
         const m2 = wbDropMatches[j + 1];
         
         const lbMatch: Match = {
           id: `lb-${lbRoundNum}-${j/2}`,
           name: `LB R${lbRoundNum} M${j/2 + 1}`,
           tournamentRoundText: `LB Round ${lbRoundNum}`,
           state: 'SCHEDULED',
           participants: [null, null], // Will be filled by losers of m1, m2
           scores: [null, null],
           isLoserBracket: true
         };
         m1.nextLooserMatchId = lbMatch.id;
         if (m2) m2.nextLooserMatchId = lbMatch.id;
         r1LbMatches.push(lbMatch);
       }
       lbMatches.push(...r1LbMatches);
       prevLbMatches = r1LbMatches;
       lbRoundNum++;
    } else {
       // Subsequent rounds: Losers from WB round `i` play winners of previous LB round.
       // Note: WB matches halve each round. LB matches also halve every *two* rounds.
       // This is a simplified DE generation that might not perfectly match standard DE topology for odd numbers,
       // but serves as a dynamic demonstration.
       
       // Step A: WB losers join the LB (Minor round)
       const dropLbMatches: Match[] = [];
       for (let j = 0; j < wbDropMatches.length; j++) {
         const wbM = wbDropMatches[j];
         const lbM = prevLbMatches[j % prevLbMatches.length]; // Simple matching
         
         const lbMatch: Match = {
           id: `lb-${lbRoundNum}-${j}`,
           name: `LB R${lbRoundNum} M${j + 1}`,
           tournamentRoundText: `LB Round ${lbRoundNum}`,
           state: 'SCHEDULED',
           participants: [null, null],
           scores: [null, null],
           isLoserBracket: true
         };
         wbM.nextLooserMatchId = lbMatch.id;
         if (lbM) lbM.nextMatchId = lbMatch.id;
         dropLbMatches.push(lbMatch);
       }
       lbMatches.push(...dropLbMatches);
       prevLbMatches = dropLbMatches;
       lbRoundNum++;
       
       // Step B: LB survivors play each other (Major round)
       if (dropLbMatches.length > 1) {
           const majorLbMatches: Match[] = [];
           for (let j = 0; j < dropLbMatches.length; j += 2) {
             const m1 = dropLbMatches[j];
             const m2 = dropLbMatches[j + 1];
             if (!m2) continue;
             
             const lbMatch: Match = {
               id: `lb-${lbRoundNum}-${j/2}`,
               name: `LB R${lbRoundNum} M${j/2 + 1}`,
               tournamentRoundText: `LB Round ${lbRoundNum}`,
               state: 'SCHEDULED',
               participants: [null, null],
               scores: [null, null],
               isLoserBracket: true
             };
             m1.nextMatchId = lbMatch.id;
             m2.nextMatchId = lbMatch.id;
             majorLbMatches.push(lbMatch);
           }
           lbMatches.push(...majorLbMatches);
           prevLbMatches = majorLbMatches;
           lbRoundNum++;
       }
    }
  }

  // Grand Final
  const grandFinal: Match = {
    id: `gf`,
    name: `Grand Final`,
    tournamentRoundText: `Grand Final`,
    state: 'SCHEDULED',
    participants: [null, null],
    scores: [null, null]
  };
  
  finalMatch.nextMatchId = grandFinal.id;
  if (prevLbMatches.length > 0) {
    prevLbMatches[0].nextMatchId = grandFinal.id;
  }

  return [...wbMatches, ...lbMatches, grandFinal];
}
