// pages/index.js

import { useState, useEffect, useMemo } from 'react'
import GolferGrid from '../components/GolferGrid'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [bgImage, setBgImage]   = useState('/images/quail-hollow.jpg')
  const [rules, setRules]       = useState('')
  const [golfers, setGolfers]   = useState([])
  const [picks, setPicks]       = useState([])
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [receipt, setReceipt]   = useState(null)

  useEffect(() => {
    async function loadData() {
      // ----- 1) LOAD BACKGROUND SETTING -----
      const { data: bgSetting, error: bgErr } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'background_image')
        .single()
      if (bgErr) {
        console.error('bg load error', bgErr)
      } else if (bgSetting?.value) {
        // if it's already an absolute URL, use it; otherwise fetch from your storage bucket
        const val = bgSetting.value
        if (val.startsWith('http')) {
          setBgImage(val)
        } else {
          const {
            data: { publicUrl },
            error: urlErr,
          } = supabase
            .storage
            .from('backgrounds')       // <-- your bucket name
            .getPublicUrl(val)          // <-- val is the filename/key in that bucket
          if (urlErr) console.error('publicUrl error', urlErr)
          else setBgImage(publicUrl)
        }
      }

      // ----- 2) LOAD RULES HTML -----
      const { data: rSetting, error: rErr } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'rules')
        .single()
      if (rErr) console.error('rules load error', rErr)
      else setRules(rSetting?.value || '')

      // ----- 3) LOAD GOLFERS -----
      const { data: gfList, error: gfErr } = await supabase
        .from('golfers')
        .select('*')
        .order('id', { ascending: true })   // now ordered by ID
      if (gfErr) console.error('golfers load error', gfErr)
      else setGolfers(gfList || [])

      setLoading(false)
    }

    loadData()
  }, [])

  // compute total salary
  const totalSalary = useMemo(
    () =>
      picks.reduce((sum, id) => {
        const g = golfers.find((g) => g.id === id)
        return sum + (g?.salary || 0)
      }, 0),
    [picks, golfers]
  )

  // toggle a pick
  const handleToggle = (id) => (e) => {
    setError(null)
    setPicks((prev) =>
      e.target.checked
        ? prev.length < 6
          ? [...prev, id]
          : prev
        : prev.filter((p) => p !== id)
    )
  }

  // form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (picks.length !== 6) return setError('Please pick exactly 6 golfers.')
    if (totalSalary > 100) return setError(`Salary cap exceeded: $${totalSalary}`)

    const { first, last, email, entryName } = Object.fromEntries(new FormData(e.target))
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first, last, email, entryName, picks }),
    })
    const body = await res.json()
    if (!res.ok) {
      console.error(body)
      return setError(body.error || 'Submission failed')
    }

    // build a receipt for the takeover screen
    const pickedGolfers = picks
      .map((id) => golfers.find((g) => g.id === id))
      .filter(Boolean)
    setReceipt({ first, last, email, entryName, totalSalary, picks: pickedGolfers })

    e.target.reset()
    setPicks([])
  }

  // loading state
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
    )
  }

  // receipt takeover
  if (receipt) {
    return (
      <div
        className="relative h-screen bg-no-repeat bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="absolute inset-0 bg-cream/75" />
        <div className="relative h-full overflow-y-auto">
          <div className="max-w-screen-md mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <h2 className="text-2xl font-bold text-dark-green text-center">
                Entry Receipt
              </h2>
              <p><strong>Name:</strong> {receipt.first} {receipt.last}</p>
              <p><strong>Email:</strong> {receipt.email}</p>
              <p><strong>Entry Name:</strong> {receipt.entryName}</p>
              <p><strong>Total Salary:</strong> ${receipt.totalSalary}</p>
              <ul className="list-disc list-inside">
                {receipt.picks.map((g, i) => (
                  <li key={g.id}>
                    {i + 1}. {g.name} — ${g.salary}
                  </li>
                ))}
              </ul>
              <div className="text-center">
                <button
                  onClick={() => setReceipt(null)}
                  className="mt-4 bg-dark-green text-white px-6 py-2 rounded-lg"
                >
                  Back to Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // main form
  return (
    <div
      className="relative h-screen bg-no-repeat bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <div className="relative h-full overflow-y-auto">
        <div className="max-w-screen-lg mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h1 className="text-3xl font-bold text-dark-green text-center">
              Golf Pool Entry Form
            </h1>

            {/* Rules */}
            <section className="bg-cream p-4 rounded-lg">
              <div
                className="prose prose-sm max-w-none text-dark-green leading-snug
                           prose-p:mb-1 prose-p:first:mt-0 prose-p:last:mb-0
                           prose-li:mb-1 prose-ul:space-y-0"
                dangerouslySetInnerHTML={{ __html: rules }}
              />
            </section>

            {error && <p className="text-red-600">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* contact */}
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

              {/* counter */}
              <p className="text-sm">
                Picks: <strong>{picks.length}/6</strong> &nbsp;|&nbsp;
                Total Salary: <strong>${totalSalary}</strong>/100
              </p>

              {/* grid */}
              <GolferGrid
                golfers={golfers}
                picks={picks}
                onToggle={handleToggle}
              />

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
  )
}