// components/GolferGrid.js
import React from 'react'

export default function GolferGrid({ golfers, picks, onToggle }) {
  return (
    <div className="border border-dark-green rounded-lg p-4 space-y-4">
      {/* Moved label inside the bordered box */}
      <p className="text-lg font-semibold text-dark-green">
        Select Golfers
      </p>

      <div className="grid grid-cols-4 gap-4">
        {golfers.map((g) => (
          <label
            key={g.id}
            className="flex items-center border border-dark-green/50 rounded-lg p-3 hover:bg-dark-green/5"
          >
            <input
              type="checkbox"
              checked={picks.includes(g.id)}
              onChange={onToggle(g.id)}
              className="mr-3 w-5 h-5 text-dark-green"
            />
            <span className="text-dark-green">
              ${g.salary} – {g.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
