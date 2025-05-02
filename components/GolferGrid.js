// components/GolferGrid.js
import React from 'react';

export default function GolferGrid({ golfers, picks, onToggle }) {
  return (
    <>
      <div className="mb-2 text-sm text-dark-green">Select Golfers</div>

      <div className="flex flex-wrap justify-end gap-4">
        {golfers.map((g) => {
          const checked = picks.includes(g.id);
          return (
            <label
              key={g.id}
              className="w-1/3 flex items-center space-x-2"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={onToggle(g.id)}
                className="h-4 w-4 text-dark-green border-dark-green/50 rounded"
              />
              <span className={checked ? 'font-semibold' : ''}>
                {g.name} (${g.salary})
              </span>
            </label>
          );
        })}
      </div>
    </>
  );
}
