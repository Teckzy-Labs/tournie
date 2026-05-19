import React from 'react';
import { LayoutGroup } from '../../types/bracket';

interface BracketGroupsProps {
  groups: LayoutGroup[];
  offsetX: number;
  offsetY: number;
}

export const BracketGroups = React.memo(function BracketGroups({
  groups,
  offsetX,
  offsetY
}: BracketGroupsProps) {
  return (
    <>
      {groups.map((group) => (
        <div
          key={group.id}
          className="absolute border border-slate-700/20 bg-slate-800/5 rounded-2xl pointer-events-none"
          style={{
            left: group.x + offsetX,
            top: group.y + offsetY,
            width: group.width,
            height: group.height
          }}
        >
          <div className="absolute -top-3 left-6 px-3 bg-slate-50/90 backdrop-blur rounded-full text-xs font-bold uppercase tracking-widest text-slate-500 border border-slate-200">
            {group.title}
          </div>
        </div>
      ))}
    </>
  );
});
