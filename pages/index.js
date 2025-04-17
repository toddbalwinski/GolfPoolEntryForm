// import { useState, useMemo } from 'react';
import golfers from '../data/golfers';
import GolferGrid from '../components/GolferGrid';

export default function Home() {
  const [picks, setPicks] = useState([]);
  const [error, setError] = useState(null);

  // Compute total salary of selected golfers
  const totalSalary = useMemo(() =>
    picks.reduce((sum, id) => {
      const g = golfers.find(g => g.id === id);
      return sum + (g?.salary || 0);
    }, 0)
  , [picks]);

  const handleToggle = id => e => {
    setError(null);
    if (e.target.checked) {
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first, last, email, entryName, picks })
    });

    if (!res.ok) {
      const { error } = await res.json();
      return setError(error);
    }

    alert('Entry submitted! Thank you.');
    setPicks([]);
    e.target.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cream text-dark-green font-sans">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-8">
        <h1 className="text-3xl font-bold text-dark-green mb-6 text-center">
          Golf Pool Entry
        </h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <p className="mb-4 text-sm">
          Picks: <strong>{picks.length}/6</strong> &nbsp;|&nbsp;
          Total Salary: <strong>${totalSalary}</strong>/100
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <input
              name="first"
              placeholder="First Name"
              required
              className="border border-dark-green/50 rounded-lg p-3 placeholder-dark-green/70 focus:outline-none focus:ring-2 focus:ring-dark-green"
            />
            <input
              name="last"
              placeholder="Last Name"
              required
              className="border border-dark-green/50 rounded-lg p-3 placeholder-dark-green/70 focus:outline-none focus:ring-2 focus:ring-dark-green"
            />
          </div>

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            required
            className="w-full border border-dark-green/50 rounded-lg p-3 placeholder-dark-green/70 focus:outline-none focus:ring-2 focus:ring-dark-green"
          />

          <input
            name="entryName"
            placeholder="Entry Name"
            required
            className="w-full border border-dark-green/50 rounded-lg p-3 placeholder-dark-green/70 focus:outline-none focus:ring-2 focus:ring-dark-green"
          />

          <GolferGrid picks={picks} onToggle={handleToggle} />

          <button
            type="submit"
            disabled={picks.length !== 6 || totalSalary > 100}
            className="w-full bg-dark-green hover:bg-dark-green/90 text-white font-medium rounded-lg px-6 py-3 transition disabled:opacity-50"
          >
            Submit Entry
          </button>
        </form>
      </div>
    </div>
  );
}
