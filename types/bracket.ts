export type Participant = {
  id: string;
  name: string;
  image?: string; // Optional avatar or logo
  seed?: number;
  status?: 'active' | 'eliminated' | 'winner';
};

export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';

export type Match = {
  id: string;
  name: string; // e.g., "Game 1", "Final"
  nextMatchId?: string; // ID of the match the winner goes to
  nextLooserMatchId?: string; // ID of the match the loser goes to (for double elimination)
  tournamentRoundText: string; // e.g., "Quarter-Finals", "Round of 16"
  startTime?: string;
  state: MatchStatus;
  participants: [Participant | null, Participant | null]; // null means TBD
  scores: [number | null, number | null]; // Matches participant order
  winnerId?: string;
  isLoserBracket?: boolean; // For Double Elimination
};

export type Tournament = {
  id: string;
  name: string;
  matches: Match[];
  type: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'MULTI_STAGE';
};

// Internal representation for layout calculation
export type LayoutNode = Match & {
  x: number;
  y: number;
  width: number;
  height: number;
  roundIndex: number;
};

// Represents a line connecting two matches
export type Connector = {
  id: string;
  sourceMatchId: string;
  targetMatchId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isLoserBracket?: boolean;
};
