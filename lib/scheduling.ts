import { ScheduleAssignment, Tournament } from '../types/bracket';

export function applyScheduleAssignments(
  tournament: Tournament,
  assignments: ScheduleAssignment[]
): Tournament {
  const assignmentByMatchId = new Map(assignments.map((assignment) => [assignment.matchId, assignment]));

  return {
    ...tournament,
    matches: tournament.matches.map((match) => {
      const assignment = assignmentByMatchId.get(match.id);
      if (!assignment) return match;

      return {
        ...match,
        startTime: assignment.startTime || match.startTime
      };
    })
  };
}
