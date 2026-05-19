import React from 'react';

interface ExportControlsProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
}

export const ExportControls = React.memo(function ExportControls({
  onExportPDF,
  onExportExcel
}: ExportControlsProps) {
  return (
    <>
      <button onClick={onExportPDF} className="p-1.5 rounded-md text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors" title="Export PDF">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M9 15v-4" /><path d="M12 15v-4" /><path d="M15 15v-4" /></svg>
      </button>
      <button onClick={onExportExcel} className="p-1.5 rounded-md text-slate-600 hover:text-green-600 hover:bg-green-50 transition-colors" title="Export Excel">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
      </button>
    </>
  );
});
