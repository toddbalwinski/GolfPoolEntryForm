// components/GolferGrid.js
import React from 'react'

export default function GolferGrid({ golfers, picks, onToggle }) {
  return (
    <fieldset className="relative border-2 border-dark-green rounded-lg bg-white p-4">
      <legend className="absolute -top-3 left-4 bg-white px-2 text-base font-semibold text-dark-green">
        Select Golfers
      </legend>

      <div
        className="
          grid
          grid-cols-1       /* 1 col on very small screens */
          sm:grid-cols-2    /* 2 cols @640px+ */
          md:grid-cols-3    /* 3 cols @768px+ */
          lg:grid-cols-4    /* 4 cols @1024px+ */
          gap-3
        "
      >
        {golfers.map((g) => (
          <label
            key={g.id}
            className="flex items-center border border-dark-green/50 rounded-lg p-2 hover:bg-dark-green/10"
          >
            <input
              type="checkbox"
              checked={picks.includes(g.id)}
              onChange={onToggle(g.id)}
              className="mr-2 w-4 h-4"
            />
            <span className="text-base">
              ${g.salary} – {g.name}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
