import { Match, MatchSource, Tournament } from '../../types/bracket';

export type MatchGraphNode = {
  id: string;
  match: Match;
};

export type MatchGraphEdge = {
  id: string;
  sourceMatchId: string;
  targetMatchId: string;
  outcome: 'winner' | 'loser';
  slot?: 0 | 1;
};

export type MatchGraph = {
  nodes: MatchGraphNode[];
  edges: MatchGraphEdge[];
};

function sourcesForTarget(target: Match, matches: Match[]): MatchSource[] {
  if (target.sources?.length) return target.sources;

  return matches.flatMap((source) => {
    const sources: MatchSource[] = [];

    if (source.nextMatchId === target.id) {
      sources.push({ matchId: source.id, outcome: 'winner' });
    }

    if (source.nextLooserMatchId === target.id) {
      sources.push({ matchId: source.id, outcome: 'loser' });
    }

    return sources;
  });
}

export function tournamentToMatchGraph(tournament: Tournament): MatchGraph {
  const nodes = tournament.matches.map((match) => ({ id: match.id, match }));
  const edges = tournament.matches.flatMap((target) => {
    return sourcesForTarget(target, tournament.matches).map((source) => ({
      id: `${source.matchId}-${source.outcome}-${target.id}`,
      sourceMatchId: source.matchId,
      targetMatchId: target.id,
      outcome: source.outcome,
      slot: source.slot
    }));
  });

  return { nodes, edges };
}

export function applySourceCompatibility(matches: Match[]): Match[] {
  return matches.map((match) => {
    if (match.sources?.length) return match;

    const sources = matches.flatMap((source): MatchSource[] => {
      const nextSources: MatchSource[] = [];

      if (source.nextMatchId === match.id) {
        nextSources.push({ matchId: source.id, outcome: 'winner' });
      }

      if (source.nextLooserMatchId === match.id) {
        nextSources.push({ matchId: source.id, outcome: 'loser' });
      }

      return nextSources;
    });

    return sources.length > 0 ? { ...match, sources } : match;
  });
}
