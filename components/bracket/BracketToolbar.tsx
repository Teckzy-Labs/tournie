import React from 'react';
import { ExportControls } from './ExportControls';

interface BracketToolbarProps {
  zoomLocked: boolean;
  onToggleZoomLock: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetTransform: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
}

export const BracketToolbar = React.memo(function BracketToolbar({
  zoomLocked,
  onToggleZoomLock,
  onZoomIn,
  onZoomOut,
  onResetTransform,
  onExportPDF,
  onExportExcel
}: BracketToolbarProps) {
  return (
    <div className="absolute top-4 right-4 z-20 flex gap-1 bg-white/95 backdrop-blur shadow-sm border border-slate-200 p-1.5 rounded-lg opacity-100 transition-opacity">
      <button
        onClick={onToggleZoomLock}
        className={`p-1.5 rounded-md transition-colors ${zoomLocked ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'}`}
        title={zoomLocked ? 'Unlock Zoom' : 'Lock Zoom'}
      >
        {zoomLocked ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
        )}
      </button>
      <div className="w-px bg-slate-200 my-1 mx-0.5" />
      <button disabled={zoomLocked} onClick={() => onZoomIn()} className={`p-1.5 rounded-md transition-colors ${zoomLocked ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'}`} title="Zoom In">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
      </button>
      <button disabled={zoomLocked} onClick={() => onZoomOut()} className={`p-1.5 rounded-md transition-colors ${zoomLocked ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'}`} title="Zoom Out">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
      </button>
      <div className="w-px bg-slate-200 my-1 mx-0.5" />
      <button disabled={zoomLocked} onClick={() => onResetTransform()} className={`p-1.5 rounded-md transition-colors ${zoomLocked ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'}`} title="Fit to Screen">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v6h6M20 10V4h-6M10 20H4v-6M14 4h6v6" /></svg>
      </button>
      <div className="w-px bg-slate-200 my-1 mx-0.5" />
      <ExportControls onExportPDF={onExportPDF} onExportExcel={onExportExcel} />
    </div>
  );
});
