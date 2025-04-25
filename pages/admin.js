// pages/admin.js
import { useState, useEffect } from 'react';

export default function Admin() {
  const [rules, setRules]     = useState('');
  const [golfers, setGolfers] = useState([]);
  const [newGf, setNewGf]     = useState({ name: '', salary: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      // fetch rules
      const stRes = await fetch('/api/admin/settings');
      const { settings } = await stRes.json();
      setRules(settings.rules || '');

      // fetch golfers
      const gfRes = await fetch('/api/admin/golfers');
      const { golfers: gfData } = await gfRes.json();
      setGolfers(gfData);

      setLoading(false);
    }
    loadAll();
  }, []);

  const saveRules = async () => {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'rules', value: rules }),
    });
    alert('Rules saved');
  };

  const addGolfer = async () => {
    await fetch('/api/admin/golfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGf),
    });
    // refresh golfers list
    const { golfers: updated } = await (await fetch('/api/admin/golfers')).json();
    setGolfers(updated);
    setNewGf({ name: '', salary: 0 });
  };

  const deleteGolfer = async (id) => {
    if (!confirm(`Delete golfer ID ${id}?`)) return;
    await fetch(`/api/admin/golfers?id=${id}`, { method: 'DELETE' });
    setGolfers(golfers.filter((g) => g.id !== id));
  };

  const resetEntries = async () => {
    if (!confirm('Clear all entries?')) return;
    await fetch('/api/admin/entries/reset', { method: 'POST' });
    alert('Entries cleared');
  };

  if (loading) return <p className="p-6">Loading admin…</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 font-sans text-dark-green">
      <h1 className="text-2xl font-bold">🏌️‍♂️ Golf Pool Admin</h1>

      {/* Rules Editor */}
      <section className="space-y-2">
        <h2 className="font-semibold">Rules Text</h2>
        <textarea
          rows={8}
          className="w-full border border-dark-green/50 p-2 rounded-lg"
          value={rules}
          onChange={(e) => setRules(e.target.value)}
        />
        <button
          className="bg-dark-green text-white px-4 py-2 rounded-lg"
          onClick={saveRules}
        >
          Save Rules
        </button>
      </section>

      {/* Golfers Table + Add */}
      <section className="space-y-4">
        <h2 className="font-semibold">Golfers</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-cream">
              <th className="border px-3 py-1">ID</th>
              <th className="border px-3 py-1">Name</th>
              <th className="border px-3 py-1">Salary</th>
              <th className="border px-3 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {golfers.map((g) => (
              <tr key={g.id}>
                <td className="border px-3 py-1">{g.id}</td>
                <td className="border px-3 py-1">{g.name}</td>
                <td className="border px-3 py-1">{g.salary}</td>
                <td className="border px-3 py-1">
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => deleteGolfer(g.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add New Golfer */}
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Name"
            value={newGf.name}
            onChange={(e) => setNewGf({ ...newGf, name: e.target.value })}
            className="border border-dark-green/50 p-2 rounded-lg"
          />
          <input
            type="number"
            placeholder="Salary"
            value={newGf.salary}
            onChange={(e) =>
              setNewGf({ ...newGf, salary: +e.target.value })
            }
            className="border border-dark-green/50 p-2 rounded-lg"
          />
        </div>
        <button
          className="bg-dark-green text-white px-4 py-2 rounded-lg"
          onClick={addGolfer}
        >
          Add Golfer
        </button>
      </section>

      {/* Reset Entries */}
      <section>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
          onClick={resetEntries}
        >
          Clear All Entries
        </button>
      </section>
    </div>
  );
}
