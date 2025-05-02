// components/GolferGrid.js
import React from 'react';

export default function GolferGrid({ golfers, picks, onToggle }) {
  return (
    <>
      <div className="mb-2 text-sm text-dark-green">Select Golfers</div>

      {/* outer wrapper: allows horizontal scrolling on small screens */}
      <div className="border border-dark-green/50 rounded-lg p-4 overflow-x-auto">
        {/* responsive grid: 1 col xs, 2 col sm, 3 col md, 4 col lg */}
        <div className="min-w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {golfers.map((g) => {
            const checked = picks.includes(g.id);
            return (
              <label
                key={g.id}
                className="flex items-center space-x-2 w-full text-sm"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={onToggle(g.id)}
                  className="h-4 w-4 text-dark-green border-dark-green/50 rounded"
                />
                {/* salary then a dash */}
                <span className="font-mono text-dark-green">
                  ${g.salary} -
                </span>
                {/* golfer name */}
                <span
                  className={
                    checked
                      ? 'font-semibold text-dark-green'
                      : 'text-dark-green'
                  }
                >
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
