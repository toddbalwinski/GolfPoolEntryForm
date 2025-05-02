// components/GolferGrid.js
import React from 'react';

export default function GolferGrid({ golfers, picks, onToggle }) {
  return (
    <>
      <div className="mb-2 text-sm text-dark-green">Select Golfers</div>

      {/* outer wrapper: allows horizontal scrolling on small screens */}
      <div className="border border-dark-green/50 rounded-lg p-4 overflow-x-auto">
        {/* responsive grid: 1 col on xs, 2 on sm, 3 on md+ */}
        <div className="min-w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {golfers.map((g) => {
            const checked = picks.includes(g.id);
            return (
              <label
                key={g.id}
                className="flex items-center space-x-2 w-full"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={onToggle(g.id)}
                  className="h-4 w-4 text-dark-green border-dark-green/50 rounded"
                />
                <span className="font-mono text-dark-green">${g.salary}</span>
                <span className={checked ? 'font-semibold text-dark-green' : 'text-dark-green'}>
                  {g.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </>
  );
}
