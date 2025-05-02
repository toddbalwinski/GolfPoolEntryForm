// components/GolferGrid.js
import React from 'react'

export default function GolferGrid({ golfers, picks, onToggle }) {
  return (
    <fieldset className="relative border border-dark-green rounded-lg pt-6 px-4 pb-4">
      <legend className="absolute -top-3 left-4 bg-white px-2 text-lg font-semibold text-dark-green">
        Select exactly 6 golfers (≤ $100 cap)
      </legend>

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
            <span className="text-dark-green">${g.salary} – {g.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
