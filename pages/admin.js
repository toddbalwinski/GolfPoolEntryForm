// pages/admin.js
import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function Admin() {
  const [rules, setRules] = useState('');
  const [golfers, setGolfers] = useState([]);
  const [newGf, setNewGf] = useState({ name: '', salary: '' });
  const [loading, setLoading] = useState(true);
  const [csvUploading, setCsvUploading] = useState(false);

  useEffect(() => {
    async function loadAll() {
      // Fetch rules
      const stRes = await fetch('/api/admin/settings');
      const { settings } = await stRes.json();
      setRules(settings.rules || '');

      // Fetch golfers
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
    const salaryInt = parseInt(newGf.salary, 10);
    if (!newGf.name || isNaN(salaryInt)) {
      return alert('Please enter a valid name and numeric salary');
    }
    await fetch('/api/admin/golfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newGf.name, salary: salaryInt }),
    });
    // Refresh list
    const { golfers: updated } = await (await fetch('/api/admin/golfers')).json();
    setGolfers(updated);
    setNewGf({ name: '', salary: '' });
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

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: false,       // set to true if your CSV has a header row
      skipEmptyLines: true,
      complete: async (results) => {
        const golfersData = results.data
          .map((row) => ({
            name: row[0]?.trim(),
            salary: parseInt(row[1], 10),
          }))
          .filter((g) => g.name && !isNaN(g.salary));

        if (golfersData.length === 0) {
          return alert('No valid rows found.');
        }

        setCsvUploading(true);
        const res = await fetch('/api/admin/golfers/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ golfers: golfersData }),
        });
        setCsvUploading(false);

        if (!res.ok) {
          const { error } = await res.json();
          return alert('Upload failed: ' + error);
        }

        const { golfers: newList } = await res.json();
        setGolfers(newList);
        alert(`Imported ${golfersData.length} golfers.`);
      },
    });
  };

  if (loading)
    return <p className="p-6 text-center text-dark-green">Loading admin…</p>;

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

      {/* CSV Batch Upload */}
      <section className="space-y-2">
        <h2 className="font-semibold">Batch Upload Golfers (CSV)</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          disabled={csvUploading}
          className="border border-dark-green/50 p-2 rounded-lg"
        />
        {csvUploading && <p className="text-sm">Uploading…</p>}
      </section>

      {/* Golfers Table */}
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
        <div className="grid grid-cols-2 gap-4 mt-4">
          <input
            placeholder="Name"
            value={newGf.name}
            onChange={(e) => setNewGf({ ...newGf, name: e.target.value })}
            className="border border-dark-green/50 p-2 rounded-lg"
          />
          <input
            type="text"
            placeholder="Salary"
            inputMode="numeric"
            pattern="[0-9]*"
            value={newGf.salary}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '');
              setNewGf({ ...newGf, salary: digits });
            }}
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
