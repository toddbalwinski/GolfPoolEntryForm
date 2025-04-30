// pages/entries.js
import { useState, useEffect, Fragment } from 'react';
import { supabase } from '../lib/supabase';

export default function EntriesPage() {
  const [entries, setEntries]     = useState([]);
  const [golferMap, setGolferMap] = useState({});
  const [loading, setLoading]     = useState(true);
  const [clearing, setClearing]   = useState(false);

  useEffect(() => {
    async function loadData() {
      // fetch golfers for lookup
      const { data: golfers, error: gErr } = await supabase
        .from('golfers')
        .select('id,name,salary');
      if (gErr) {
        console.error('Error loading golfers', gErr);
      } else {
        const map = {};
        golfers.forEach((g) => {
          map[String(g.id)] = { name: g.name, salary: g.salary };
        });
        setGolferMap(map);
      }

      // fetch entries
      const { data: ents, error: eErr } = await supabase
        .from('entries')
        .select('first_name,last_name,email,entry_name,picks,created_at')
        .order('created_at', { ascending: false });
      if (eErr) {
        console.error('Error loading entries', eErr);
      } else {
        setEntries(ents);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const clearEntries = async () => {
    if (!confirm('Delete ALL entries?')) return;
    setClearing(true);
    const res = await fetch('/api/admin/entries/reset', { method: 'POST' });
    setClearing(false);
    if (!res.ok) {
      const { error } = await res.json();
      return alert('Failed to clear entries: ' + error);
    }
    setEntries([]);
    alert('All entries cleared');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-dark-green">
        <p>Loading entries…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-cream text-dark-green font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center">All Pool Entries</h1>

        <button
          onClick={clearEntries}
          disabled={clearing}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {clearing ? 'Clearing…' : 'Clear All Entries'}
        </button>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="bg-cream">
                <th className="border px-2 py-1">First</th>
                <th className="border px-2 py-1">Last</th>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">Entry</th>

                {[1, 2, 3, 4, 5, 6].flatMap((i) => (
                  <Fragment key={i}>
                    <th className="border px-2 py-1">Golfer {i}</th>
                    <th className="border px-2 py-1">Salary {i}</th>
                  </Fragment>
                ))}

                <th className="border px-2 py-1">Total Salary</th>
                <th className="border px-2 py-1">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {entries.length > 0 ? (
                entries.map((e, idx) => {
                  // compute total salary
                  const total = (e.picks || [])
                    .slice(0, 6)
                    .reduce((sum, pid) => {
                      const info = golferMap[pid];
                      return sum + (info?.salary || 0);
                    }, 0);

                  return (
                    <tr key={idx}>
                      <td className="border px-2 py-1">{e.first_name}</td>
                      <td className="border px-2 py-1">{e.last_name}</td>
                      <td className="border px-2 py-1">{e.email}</td>
                      <td className="border px-2 py-1">{e.entry_name}</td>

                      {[0, 1, 2, 3, 4, 5].map((slot) => {
                        const pid = e.picks?.[slot];
                        const info = golferMap[pid] || { name: '', salary: '' };
                        return (
                          <Fragment key={slot}>
                            <td className="border px-2 py-1">{info.name}</td>
                            <td className="border px-2 py-1">{info.salary}</td>
                          </Fragment>
                        );
                      })}

                      <td className="border px-2 py-1 font-semibold">{total}</td>
                      <td className="border px-2 py-1">{e.created_at}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4 + 2 * 6 + 2}
                    className="border px-2 py-1 text-center"
                  >
                    No entries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
