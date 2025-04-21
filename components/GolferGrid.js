// components/GolferGrid.js
export default function GolferGrid({ golfers, picks, onToggle }) {
  return (
    <fieldset className="grid grid-cols-4 gap-4 justify-items-center border border-dark-green/50 rounded-lg p-4">
      <legend className="col-span-4 text-sm font-semibold text-dark-green mb-2">
        Select exactly 6 golfers (≤ $100 cap)
      </legend>
      {golfers.map((g) => {
        const checked = picks.includes(g.id);
        return (
          <label
            key={g.id}
            className="flex items-center space-x-2 text-sm select-none"
          >
            <input
              type="checkbox"
              name="golfers"
              value={g.id}
              checked={checked}
              onChange={onToggle(g.id)}
              className="h-4 w-4 text-dark-green border-gray-300 rounded focus:ring-dark-green"
            />
            <span className={checked ? 'font-semibold' : ''}>
              ${g.salary} – {g.name}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
