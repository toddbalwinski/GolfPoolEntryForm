import golfers from '../data/golfers';

export default function GolferGrid() {
  return (
    <fieldset className="grid grid-cols-3 gap-2 border p-4">
      <legend>Select exactly 6 golfers (≤ $100 cap)</legend>
      {golfers.map(g => (
        <label key={g.id} className="flex items-center space-x-2">
          <input type="checkbox" name="golfers" value={g.id} />
          <span>${g.salary} – {g.name}</span>
        </label>
      ))}
    </fieldset>
  );
}