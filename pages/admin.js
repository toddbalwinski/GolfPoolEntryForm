// pages/admin.js
import { useState, useEffect } from 'react';

export default function Admin() {
  const [golfers, setGolfers] = useState([]);
  const [rules, setRules]     = useState('');
  const [newGf, setNewGf]     = useState({ id: '', name: '', salary: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdmin() {
      const gfRes = await fetch('/api/admin/golfers');
      const { golfers: gfData } = await gfRes.json();
      setGolfers(gfData);

      const stRes = await fetch('/api/admin/settings');
      const { settings } = await stRes.json();
      setRules(settings.rules || '');
      setLoading(false);
    }
    loadAdmin();
  }, []);

  const upsertGolfer = async () => {
    await fetch('/api/admin/golfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGf),
    });
    // refresh
    const { golfers: gfData } = await (await fetch('/api/admin/golfers')).json();
    setGolfers(gfData);
    setNewGf({ id: '', name: '', salary: 0 });
  };

  const deleteGolfer = async (id) => {
    if (!confirm(`Delete ${id}?`)) return;
    await fetch(`/api/admin/golfers?id=${id}`, { method: 'DELETE' });
    setGolfers(golfers.filter((g) => g.id !== id));
  };

  const saveRules = async () => {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'rules', value: rules }),
    });
    alert('Rules saved');
  };

  const resetEntries = async () => {
    if (!confirm('Clear all entries?')) return;
    await fetch('/api/admin/entries/reset', { method: 'POST' });
    alert('Entries cleared');
  };

  if (loading) return <p className="p-6">Loading admin…</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">🏌️‍♂️ Golf Pool Admin</h1>

      {/* Rules Editor */}
      <section className="space-y-2">
        <h2 className="font-semibold">Rules Text</h2>
        <textarea
          rows={6}
          className="w-full border p-2 rounded"
          value={rules}
          onChange={(e) => setRules(e.target.value)}
        />
        <button
          className="bg-dark-green text-white px-4 py-2 rounded"
          onClick={saveRules}
        >
          Save Rules
        </button>
      </section>

      {/* Golfers Table + Add */}
      <section className="space-y-2">
        <h2 className="font-semibold">Golfers</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-cream">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Salary</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {golfers.map((g) => (
              <tr key={g.id}>
                <td className="border px-2 py-1">{g.id}</td>
                <td className="border px-2 py-1">{g.name}</td>
                <td className="border px-2 py-1">{g.salary}</td>
                <td className="border px-2 py-1">
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

        <div className="grid grid-cols-3 gap-4">
          <input
            placeholder="slug‑id"
            value={newGf.id}
            onChange={(e) => setNewGf({ ...newGf, id: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            placeholder="Name"
            value={newGf.name}
            onChange={(e) => setNewGf({ ...newGf, name: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Salary"
            value={newGf.salary}
            onChange={(e) =>
              setNewGf({ ...newGf, salary: +e.target.value })
            }
            className="border p-2 rounded"
          />
        </div>
        <button
          className="bg-dark-green text-white px-4 py-2 rounded"
          onClick={upsertGolfer}
        >
          Add / Update Golfer
        </button>
      </section>

      {/* Reset Entries */}
      <section>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded"
          onClick={resetEntries}
        >
          Clear All Entries
        </button>
      </section>
    </div>
  );
}
