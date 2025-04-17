// components/GolferGrid.js
import golfers from '../data/golfers';

export default function GolferGrid({ picks, onToggle }) {
  return (
    <fieldset className="grid grid-cols-5 gap-4 justify-items-center border p-4">
      <legend className="font-medium">
        Select exactly 6 golfers (≤ $100 cap)
      </legend>
      {golfers.map(g => {
        const checked = picks.includes(g.id);
        return (
          <label key={g.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="golfers"
              value={g.id}
              checked={checked}
              onChange={onToggle(g.id)}
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
