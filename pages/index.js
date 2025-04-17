import { useState, useMemo } from 'react';
import golfers from '../data/golfers';
import GolferGrid from '../components/GolferGrid';

export default function Home() {
  const [picks, setPicks] = useState([]);
  const [error, setError] = useState(null);

  // Compute total salary of selected golfers
  const totalSalary = useMemo(
    () =>
      picks.reduce((sum, id) => {
        const g = golfers.find((g) => g.id === id);
        return sum + (g?.salary || 0);
      }, 0),
    [picks]
  );

  const handleToggle = (id) => (e) => {
    setError(null);
    if (e.target.checked) {
      if (picks.length < 6) setPicks([...picks, id]);
    } else {
      setPicks(picks.filter((pid) => pid !== id));
    }
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cream text-dark-green font-sans">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl p-8 space-y-6">

        {/* RULES SECTION */}
        <section className="bg-cream border-l-4 border-dark-green p-4 rounded-lg space-y-2">
          <p>
            Pick a fantasy team comprised of 6 golfers with total salary not to
            exceed $100.
          </p>
          <p>
            $10 per entry<br />
            Venmo @tbalwinski with entry name(s) before first tee time or your
            entry will not count.
          </p>
          <p>
            Entries and payment due before first tee time. No late entries or
            payments accepted. You can modify your team, if necessary, prior to
            first tee time.
          </p>
          <p>
            I will send out a sheet to view live scoring before tournament.
          </p>

          <h3 className="font-semibold mt-4">Scoring</h3>
          <ul className="list-disc list-inside">
            <li>
              Your best 5 golfers on your team will count toward your score
              (worst golfer is dropped).
            </li>
            <li>
              Your team score is the sum of the your golfers' final places
              (midpoints are taken for tied-places).
            </li>
            <li>Low score wins (Ties split associated prize money)</li>
            <li>
              Players who miss the cut, will lock in the place of the lowest
              cut player's place. This means all cut players get the same
              score and it's not as punitive if you player finishes dead
              last.
            </li>
            <li>
              No player who makes the cut will ever place worse than a cut
              player even if their score to par skyrockets on Sat/Sun.
            </li>
          </ul>

          <h3 className="font-semibold mt-4">Bonus Points</h3>
          <ul className="list-disc list-inside">
            <li>
              If all 6 golfers make the cut, you get bonus of 5 points taken
              off your score
            </li>
            <li>
              If you have the 18-hole leader or co-leader, you get bonus of 5
              points taken off your score
            </li>
            <li>
              If you have the 36-hole leader or co-leader, you get bonus of 5
              points taken off your score
            </li>
            <li>
              If you have the 54-hole leader or co-leader, you get bonus of 5
              points taken off your score
            </li>
            <li>
              For the above, if you have multiple co-leaders, bonus points are
              awarded for each golfer
            </li>
            <li>
              If you have the tournament winner, you get bonus of 5 points
              taken off your score
            </li>
          </ul>

          <h3 className="font-semibold mt-4">Prizes/Penalties</h3>
          <p>
            WINNERS: Payout will be based on number of entries, but target is
            to award top 3 places
          </p>

          <h3 className="font-semibold mt-4">Player Withdrawals</h3>
          <h4 className="font-semibold">During tournament</h4>
          <p>
            If you have a player that withdraws on Round 1 or Round 2, then
            they are treated the same as a player who misses the cut. If they
            withdraw during Round 3 or Round 4, then they will be ranked just
            ahead of players who missed the cut.
          </p>

          <h4 className="font-semibold">Before First Tee time</h4>
          <p>
            If you have a player that withdraws prior to the tournament, you
            can swap out that golfer with one that keep your team compliant
            and/or redo your whole team. If the commissioner does not hear
            from you, the commissioner will assign whoever the alternate is
            that takes their place in the tournament.
          </p>

          <h4 className="font-semibold">Before *THEIR* Tee time</h4>
          <p>
            If the tournament has started and your golfer withdraws prior to
            teeing off. You will receive the alternate that takes their place.
            Commissioner can use discretion to similarly select next player
            listed of equal or lesser salary that hasn't teed off.
          </p>

          <h3 className="font-semibold mt-4">Masters Tournament Alternatives</h3>
          <p>
            There are no alternatives at the Masters. In this situation the
            commissioner will have discretion and will attempt to assign a
            fair alternative... usually the first player listed of equal or
            lesser salary who has not teed off yet. Commissioner will assess
            context to try to run fair and fun pool.
          </p>
        </section>

        {/* FORM TITLE */}
        <h1 className="text-3xl font-bold text-dark-green text-center">
          Golf Pool Entry
        </h1>

        {error && <p className="text-red-600">{error}</p>}

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

          {/* LIVE COUNTER */}
          <p className="text-sm">
            Picks: <strong>{picks.length}/6</strong> &nbsp;|&nbsp; Total Salary:{' '}
            <strong>${totalSalary}</strong>/100
          </p>

          {/* GOLFER GRID */}
          <GolferGrid picks={picks} onToggle={handleToggle} />

          {/* SUBMIT */}
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
