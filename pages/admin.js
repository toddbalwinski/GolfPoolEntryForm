// pages/admin.js
import { useState, useEffect } from 'react';

export default function Admin() {
  const [golfers, setGolfers] = useState([]);
  const [newGf, setNewGf]     = useState({ name: '', salary: 0 });
  // …

  useEffect(() => {
    // fetch existing golfers…
    fetch('/api/admin/golfers')
      .then(r => r.json())
      .then(({ golfers }) => setGolfers(golfers));
  }, []);

  const addGolfer = async () => {
    await fetch('/api/admin/golfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGf),
    });
    // refresh list
    const { golfers: updated } = await (await fetch('/api/admin/golfers')).json();
    setGolfers(updated);
    setNewGf({ name: '', salary: 0 });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* …Rules section above… */}

      <section>
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
                    onClick={async () => {
                      await fetch(`/api/admin/golfers?id=${g.id}`, { method: 'DELETE' });
                      setGolfers(golfers.filter(x => x.id !== g.id));
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* NEW GOLFER FORM */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <input
            placeholder="Name"
            value={newGf.name}
            onChange={e => setNewGf({ ...newGf, name: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Salary"
            value={newGf.salary}
            onChange={e => setNewGf({ ...newGf, salary: +e.target.value })}
            className="border p-2 rounded"
          />
        </div>
        <button
          className="bg-dark-green text-white px-4 py-2 rounded mt-2"
          onClick={addGolfer}
        >
          Add Golfer
        </button>
      </section>

      {/* …Reset Entries section… */}
    </div>
  );
}
