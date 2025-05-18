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
          grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
          gap-3
        "
      >
        {golfers.map((g) => {
          const isPicked = picks.includes(g.id)
          return (
            <label
              key={g.id}
              className={`
                flex items-center
                border 
                rounded-lg 
                p-2 
                hover:black/40
                ${isPicked ? 'border-dark-green black/20' : 'border-dark-green/50'}
              `}
            >
              <input
                type="checkbox"
                checked={isPicked}
                onChange={onToggle(g.id)}
                className="mr-2 w-4 h-4"
              />
              <span
                className={`
                  text-sm
                  ${isPicked ? 'font-bold' : 'font-sm'}
                `}
              >
                ${g.salary} – {g.name}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}