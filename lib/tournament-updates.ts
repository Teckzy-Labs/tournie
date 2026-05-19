import { Match, MatchStatus, Participant, Tournament } from '../types/bracket';

export function updateMatch(tournament: Tournament, matchId: string, updates: Partial<Match>): Tournament {
  return {
    ...tournament,
    matches: tournament.matches.map((match) => (
      match.id === matchId ? { ...match, ...updates } : match
    ))
  };
}

export function assignParticipant(
  tournament: Tournament,
  matchId: string,
  slot: 0 | 1,
  participant: Participant | null
): Tournament {
  const match = tournament.matches.find((candidate) => candidate.id === matchId);
  if (!match) return tournament;

  const participants: [Participant | null, Participant | null] = [...match.participants];
  participants[slot] = participant;

  return updateMatch(tournament, matchId, {
    participants
  });
}

export function completeMatch(
  tournament: Tournament,
  matchId: string,
  winnerId: string,
  scores: [number | null, number | null]
): Tournament {
  const completed = updateMatch(tournament, matchId, {
    state: 'COMPLETED' as MatchStatus,
    winnerId,
    scores
  });

  const source = completed.matches.find((match) => match.id === matchId);
  const winner = source?.participants.find((participant) => participant?.id === winnerId) || null;

  if (!source || !winner || !source.nextMatchId) {
    return completed;
  }

  const target = completed.matches.find((match) => match.id === source.nextMatchId);
  if (!target) return completed;

  const slot = target.participants[0] ? 1 : 0;
  return assignParticipant(completed, target.id, slot, winner);
}
