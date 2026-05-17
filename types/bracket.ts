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
  group?: string; // e.g. "Winners Bracket", "Losers Bracket", "3rd Place Match"
};

export type Tournament = {
  id: string;
  name: string;
  matches: Match[];
  type: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'MULTI_STAGE';
  config?: BracketConfig;
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

export type LayoutGroup = {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

// ==========================================
// CONFIGURATION TYPES
// ==========================================

export interface CustomMatchProps {
  match: Match;
  x: number;
  y: number;
  width: number;
  height: number;
  hoveredParticipantId: string | null;
  onHoverParticipant: (participantId: string | null) => void;
  onDoubleClick?: (match: Match) => void;
}

export interface BracketConfig {
  /** Width of the match card */
  nodeWidth?: number;
  /** Height of the match card */
  nodeHeight?: number;
  /** Custom renderer for the match card */
  renderMatch?: (props: CustomMatchProps) => React.ReactNode;
  /** Custom renderer for the match details dialog */
  renderMatchDetailsDialog?: (match: Match, onClose: () => void) => React.ReactNode;
  
  /** Theming/Styling Overrides */
  classNames?: {
    wrapper?: string;
    connector?: string;
    connectorHighlighted?: string;
  };
}
