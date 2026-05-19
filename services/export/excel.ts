import * as XLSX from 'xlsx';
import { Tournament } from '../../types/bracket';

export function exportBracketToExcel(tournament: Tournament) {
  try {
    const rows = tournament.matches.map((match) => ({
      ID: match.id,
      Name: match.name,
      Round: match.tournamentRoundText,
      Status: match.state,
      Participant_1: match.participants[0]?.name || 'TBD',
      Score_1: match.scores[0] ?? '',
      Participant_2: match.participants[1]?.name || 'TBD',
      Score_2: match.scores[1] ?? '',
      Winner: match.participants.find((participant) => participant?.id === match.winnerId)?.name || ''
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bracket Data');
    XLSX.writeFile(wb, `${tournament.name || 'Tournament'}_Bracket.xlsx`);
  } catch (error) {
    console.error('Error exporting Excel:', error);
  }
}
