import { Stage, Tournament } from '../types/bracket';

export function withStages(tournament: Tournament, stages: Stage[]): Tournament {
  return {
    ...tournament,
    type: 'MULTI_STAGE',
    stages
  };
}

export function getStageMatches(tournament: Tournament, stageId: string) {
  const stage = tournament.stages?.find((candidate) => candidate.id === stageId);
  if (!stage) return [];

  const ids = new Set(stage.matchIds);
  return tournament.matches.filter((match) => ids.has(match.id));
}
