// components/GolferGrid.js
import golfers from '../data/golfers';

export default function GolferGrid({ picks, onToggle }) {
  return (
    <fieldset className="grid grid-cols-3 gap-2 border p-4">
      <legend className="font-medium">
        Select exactly 6 golfers (≤ $100 cap)
      </legend>
      {picks.map(g => {
        const checked = picks.includes(g.id);
        return (
          <label key={g.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="picks"
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
