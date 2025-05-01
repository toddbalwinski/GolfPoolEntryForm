// pages/index.js
import { useState, useEffect, useMemo } from 'react';
import GolferGrid from '../components/GolferGrid';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [bgImage, setBgImage] = useState('/images/quail-hollow.jpg');
  const [rules, setRules]     = useState('');
  const [golfers, setGolfers] = useState([]);
  const [picks, setPicks]     = useState([]);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // active background
      const { data: bgSetting } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'background_image')
        .single();
      if (bgSetting?.value) setBgImage(bgSetting.value);

      // rules HTML
      const { data: rSetting } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'rules')
        .single();
      setRules(rSetting?.value || '');

      // golfers list
      const { data: gf } = await supabase
        .from('golfers')
        .select('*')
        .order('name', { ascending: true });
      setGolfers(gf || []);

      setLoading(false);
    }
    loadData();
  }, []);

  const totalSalary = useMemo(
    () =>
      picks.reduce((sum, id) => {
        const g = golfers.find((g) => g.id === id);
        return sum + (g?.salary || 0);
      }, 0),
    [picks, golfers]
  );

  const handleToggle = (id) => (e) => {
    setError(null);
    setPicks((prev) =>
      e.target.checked
        ? (prev.length < 6 ? [...prev, id] : prev)
        : prev.filter((p) => p !== id)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (picks.length !== 6) {
      return setError('Please pick exactly 6 golfers.');
    }
    if (totalSalary > 100) {
      return setError(`Salary cap exceeded: $${totalSalary}`);
    }

    const { first, last, email, entryName } = Object.fromEntries(
      new FormData(e.target)
    );
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first, last, email, entryName, picks }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      return setError(error);
    }
    alert('Entry submitted! Thank you.');
    setPicks([]);
    e.target.reset();
  };

  if (loading) {
    return (
      <div
        className="relative h-screen bg-no-repeat bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="absolute inset-0 bg-cream/80" />
        <div className="relative h-full flex items-center justify-center">
          <div className="bg-white bg-opacity-90 rounded-lg p-8">
            <p className="text-dark-green">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative h-screen bg-no-repeat bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* <div className="absolute inset-0 bg-cream/80" /> */}
      <div className="relative h-full overflow-y-auto">
        <div className="max-w-screen-lg mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h1 className="text-3xl font-bold text-dark-green text-center">
              Golf Pool Entry
            </h1>

            {/* Rules */}
            <section className="bg-cream border-l-4 border-dark-green p-4 rounded-lg">
              <div
                className="
                  prose prose-sm
                  max-w-none w-full text-dark-green
                  leading-snug
                  prose-p:mb-1 prose-p:first:mt-0 prose-p:last:mb-0
                  prose-li:mb-1 prose-ul:space-y-0
                "
                dangerouslySetInnerHTML={{ __html: rules }}
              />
            </section>

            {error && <p className="text-red-600">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Contact info */}
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

              {/* Counter */}
              <p className="text-sm">
                Picks: <strong>{picks.length}/6</strong> &nbsp;|&nbsp; Total Salary:{' '}
                <strong>${totalSalary}</strong>/100
              </p>

              {/* Golfers */}
              <GolferGrid golfers={golfers} picks={picks} onToggle={handleToggle} />

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
      </div>
    </div>
  );
}
