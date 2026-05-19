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
  sources?: MatchSource[]; // Additive dependency model; nextMatchId remains supported
  tournamentRoundText: string; // e.g., "Quarter-Finals", "Round of 16"
  startTime?: string;
  state: MatchStatus;
  participants: [Participant | null, Participant | null]; // null means TBD
  scores: [number | null, number | null]; // Matches participant order
  winnerId?: string;
  isLoserBracket?: boolean; // For Double Elimination
  group?: string; // e.g. "Winners Bracket", "Losers Bracket", "3rd Place Match"
};

export type MatchSourceOutcome = 'winner' | 'loser';

export type MatchSource = {
  matchId: string;
  outcome: MatchSourceOutcome;
  slot?: 0 | 1;
};

export type StageType = 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss' | 'placement' | 'custom';

export type Stage = {
  id: string;
  name: string;
  type: StageType;
  matchIds: string[];
  metadata?: Record<string, string | number | boolean | null>;
  advancementRules?: AdvancementRule[];
};

export type AdvancementRule = {
  fromStageId: string;
  toStageId: string;
  qualifiers: number;
  seedStrategy?: 'preserve' | 'snake' | 'manual';
};

export type Tournament = {
  id: string;
  name: string;
  matches: Match[];
  type: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'MULTI_STAGE';
  stages?: Stage[];
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

export type ViewportState = {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  positionX: number;
  positionY: number;
};

export type ValidationSeverity = 'warning' | 'error';

export type ValidationIssue = {
  code: string;
  severity: ValidationSeverity;
  message: string;
  matchId?: string;
};

export type BracketLayoutStrategy = {
  id: string;
  calculateLayout: (matches: Match[], options?: import('../lib/bracket-layout').LayoutOptions) => {
    nodes: LayoutNode[];
    connectors: Connector[];
    groups: LayoutGroup[];
  };
};

export type BracketExporter = {
  id: string;
  label: string;
  export: (tournament: Tournament, element?: HTMLElement) => Promise<void> | void;
};

export type TournamentTypePlugin = {
  id: string;
  label: string;
  validate?: (tournament: Tournament) => ValidationIssue[];
};

export type ScoringSystemPlugin = {
  id: string;
  label: string;
  isComplete: (match: Match) => boolean;
};

export type ScheduleAssignment = {
  matchId: string;
  ringId?: string;
  startTime?: string;
  refereeId?: string;
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
  onClick?: (match: Match) => void;
  onDoubleClick?: (match: Match) => void;
}

export interface BracketConfig {
  /** Width of the match card */
  nodeWidth?: number;
  /** Height of the match card */
  nodeHeight?: number;
  
  /** Callbacks */
  onMatchClick?: (match: Match) => void;
  onMatchDoubleClick?: (match: Match) => void;

  /** Custom renderer for the match card */
  renderMatch?: (props: CustomMatchProps) => React.ReactNode;
  /** Custom renderer for the match details dialog */
  renderMatchDetailsDialog?: (match: Match, onClose: () => void) => React.ReactNode;

  /** Optional scalability controls */
  showMinimap?: boolean;
  enableVirtualization?: boolean;
  virtualizationPadding?: number;
  
  /** Theming/Styling Overrides */
  classNames?: {
    wrapper?: string;
    connector?: string;
    connectorHighlighted?: string;
  };
}
