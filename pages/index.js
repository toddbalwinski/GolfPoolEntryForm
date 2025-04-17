// pages/index.js
import { useState, useMemo } from 'react';
import golfers from '../data/golfers';
import GolferGrid from '../components/GolferGrid';

export default function Home() {
  const [picks, setPicks] = useState([]);        // track picked IDs
  const [error, setError] = useState();

  // compute total salary
  const totalSalary = useMemo(() => 
    picks.reduce((sum, id) => {
      const g = golfers.find(g=>g.id===id);
      return sum + (g?.salary || 0);
    }, 0)
  , [picks]);

  const handleToggle = id => e => {
    setError(undefined);
    if (e.target.checked) {
      // only allow up to 6
      if (picks.length < 6) {
        setPicks([...picks, id]);
      }
    } else {
      setPicks(picks.filter(pid => pid !== id));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (picks.length !== 6) {
      return setError('Please pick exactly 6 golfers.');
    }
    if (totalSalary > 100) {
      return setError(`Salary cap exceeded: $${totalSalary}`);
    }
    const { first, last, email, entryName } = Object.fromEntries(new FormData(e.target));
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ first, last, email, entryName, picks })
    });
    if (!res.ok) {
      const { error } = await res.json();
      return setError(error);
    }
    alert('Entry submitted! Thank you.');
    setPicks([]);            // reset state
    e.target.reset();        // reset form fields
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl mb-4">Golf Pool Entry</h1>
      {error && <p className="text-red-600">{error}</p>}

      {/* Live Counter */}
      <p className="mb-2">
        Picks: <strong>{picks.length}/6</strong> &nbsp;|&nbsp;
        Total Salary: <strong>${totalSalary}</strong>/100
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input name="first"     placeholder="First Name" required className="border p-2" />
          <input name="last"      placeholder="Last Name"  required className="border p-2" />
        </div>
        <input name="email"       type="email" placeholder="Email"      required className="border p-2 w-full" />
        <input name="entryName"   placeholder="Entry Name"         required className="border p-2 w-full" />

        {/* pass picks + toggle into the grid */}
        <GolferGrid picks={picks} onToggle={handleToggle} />

        <button
          type="submit"
          disabled={picks.length !== 6 || totalSalary > 100}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Submit Entry
        </button>
      </form>
    </div>
  );
}