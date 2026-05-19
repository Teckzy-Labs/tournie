import { BracketExporter, BracketLayoutStrategy, ScoringSystemPlugin, TournamentTypePlugin } from '../types/bracket';

export type BracketPluginRegistry = {
  layoutStrategies: BracketLayoutStrategy[];
  exporters: BracketExporter[];
  tournamentTypes: TournamentTypePlugin[];
  scoringSystems: ScoringSystemPlugin[];
};

export function createPluginRegistry(overrides: Partial<BracketPluginRegistry> = {}): BracketPluginRegistry {
  return {
    layoutStrategies: overrides.layoutStrategies || [],
    exporters: overrides.exporters || [],
    tournamentTypes: overrides.tournamentTypes || [],
    scoringSystems: overrides.scoringSystems || []
  };
}
