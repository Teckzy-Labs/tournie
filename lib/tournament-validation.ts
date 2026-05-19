import { Tournament, ValidationIssue } from '../types/bracket';
import { tournamentToMatchGraph } from './layout-engine';

export function validateTournament(tournament: Tournament): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const matchIds = new Set(tournament.matches.map((match) => match.id));
  const graph = tournamentToMatchGraph(tournament);

  tournament.matches.forEach((match) => {
    const targets = [match.nextMatchId, match.nextLooserMatchId].filter(Boolean) as string[];
    targets.forEach((targetId) => {
      if (!matchIds.has(targetId)) {
        issues.push({
          code: 'missing-target-match',
          severity: 'error',
          message: `Match ${match.id} points to missing match ${targetId}.`,
          matchId: match.id
        });
      }
    });

    match.sources?.forEach((source) => {
      if (!matchIds.has(source.matchId)) {
        issues.push({
          code: 'missing-source-match',
          severity: 'error',
          message: `Match ${match.id} depends on missing source ${source.matchId}.`,
          matchId: match.id
        });
      }
    });

    if (match.state === 'COMPLETED' && !match.winnerId) {
      issues.push({
        code: 'completed-match-missing-winner',
        severity: 'warning',
        message: `Completed match ${match.id} has no winnerId.`,
        matchId: match.id
      });
    }

    if (match.winnerId && !match.participants.some((participant) => participant?.id === match.winnerId)) {
      issues.push({
        code: 'invalid-winner',
        severity: 'error',
        message: `Match ${match.id} winnerId does not match a participant.`,
        matchId: match.id
      });
    }
  });

  issues.push(...detectCycles(graph.edges));
  issues.push(...detectDisconnectedMatches(tournament));

  return issues;
}

function detectCycles(edges: { sourceMatchId: string; targetMatchId: string }[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const adjacency = new Map<string, string[]>();

  edges.forEach((edge) => {
    adjacency.set(edge.sourceMatchId, [...(adjacency.get(edge.sourceMatchId) || []), edge.targetMatchId]);
  });

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(id: string): boolean {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;

    visiting.add(id);
    const hasCycle = (adjacency.get(id) || []).some(visit);
    visiting.delete(id);
    visited.add(id);

    return hasCycle;
  }

  Array.from(adjacency.keys()).forEach((id) => {
    if (visit(id)) {
      issues.push({
        code: 'cycle-detected',
        severity: 'error',
        message: `Cycle detected around match ${id}.`,
        matchId: id
      });
    }
  });

  return issues;
}

function detectDisconnectedMatches(tournament: Tournament): ValidationIssue[] {
  if (tournament.matches.length <= 1) return [];

  const connected = new Set<string>();
  tournament.matches.forEach((match) => {
    if (match.nextMatchId) {
      connected.add(match.id);
      connected.add(match.nextMatchId);
    }
    if (match.nextLooserMatchId) {
      connected.add(match.id);
      connected.add(match.nextLooserMatchId);
    }
    match.sources?.forEach((source) => {
      connected.add(match.id);
      connected.add(source.matchId);
    });
  });

  return tournament.matches
    .filter((match) => !connected.has(match.id))
    .map((match) => ({
      code: 'disconnected-match',
      severity: 'warning' as const,
      message: `Match ${match.id} is disconnected from the bracket graph.`,
      matchId: match.id
    }));
}
