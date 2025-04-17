import { useState } from 'react';
import golfers from '../data/golfers';
import GolferGrid from '../components/GolferGrid';

export default function Home() {
  const [error, setError] = useState();
  const handleSubmit = async e => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const first     = formData.get('first');
    const last      = formData.get('last');
    const email     = formData.get('email');
    const entryName = formData.get('entryName');
    const picked    = golfers
      .filter(g => formData.getAll('golfers').includes(g.id))
      .map(g => g.id);

    // client‑side validation
    const total = golfers
      .filter(g=>picked.includes(g.id))
      .reduce((sum,g)=>sum+g.salary,0);
    if (picked.length !== 6) {
      return setError('Please pick exactly 6 golfers.');
    }
    if (total > 100) {
      return setError(`Salary cap exceeded: $${total}`);
    }

    // submit
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ first, last, email, entryName, picks: picked })
    });
    if (!res.ok) {
      const { error } = await res.json();
      return setError(error);
    }
    alert('Entry submitted! Thank you.');
    form.reset();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl mb-4">Golf Pool Entry</h1>
      {error && <p className="text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input name="first" placeholder="First Name" required className="border p-2" />
          <input name="last"  placeholder="Last Name"  required className="border p-2" />
        </div>
        <input name="email" type="email" placeholder="Email Address" required className="border p-2 w-full" />
        <input name="entryName" placeholder="Entry Name" required className="border p-2 w-full" />

        <GolferGrid />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit Entry
        </button>
      </form>
    </div>
  );
}