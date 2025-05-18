// pages/index.js

import { useState, useEffect, useMemo } from 'react'
import GolferGrid from '../components/GolferGrid'
import { supabase } from '../lib/supabase'

export default function Home() {
  // ----------------------------------------------------------------------------
  // Data & state
  // ----------------------------------------------------------------------------
  const [bgImage, setBgImage]     = useState('/images/quail-hollow.jpg')
  const [rules,   setRules]       = useState('')
  const [golfers, setGolfers]     = useState([])
  const [picks,   setPicks]       = useState([])
  const [error,   setError]       = useState(null)
  const [loading, setLoading]     = useState(true)

  // receipt state
  const [receipt, setReceipt]     = useState(null)

  // ----------------------------------------------------------------------------
  // Load background, rules, golfers
  // ----------------------------------------------------------------------------
  useEffect(() => {
    async function loadData() {
      const [{ data: bgSetting }, { data: rSetting }, { data: gf }] =
        await Promise.all([
          supabase.from('settings').select('value').eq('key','background_image').single(),
          supabase.from('settings').select('value').eq('key','rules').single(),
          supabase.from('golfers').select('*').order('name',{ascending:true})
        ])
      if (bgSetting?.value) setBgImage(bgSetting.value)
      setRules(rSetting?.value || '')
      setGolfers(gf || [])
      setLoading(false)
    }
    loadData()
  }, [])

  // ----------------------------------------------------------------------------
  // Salary calculator
  // ----------------------------------------------------------------------------
  const totalSalary = useMemo(() => {
    return picks.reduce((sum, id) => {
      const g = golfers.find((g) => g.id === id)
      return sum + (g?.salary || 0)
    }, 0)
  }, [picks, golfers])

  // ----------------------------------------------------------------------------
  // Pick checkbox toggle
  // ----------------------------------------------------------------------------
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

  // ----------------------------------------------------------------------------
  // Submit handler
  // ----------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setReceipt(null)
    // validations
    if (picks.length !== 6) {
      return setError('Please pick exactly 6 golfers.')
    }
    if (totalSalary > 100) {
      return setError(`Salary cap exceeded: $${totalSalary}`)
    }

    // pull form values
    const { first, last, email, entryName } = Object.fromEntries(
      new FormData(e.target)
    )
    console.log('Submitting entry for:', first, last, email, entryName, picks)

    // send to Supabase
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first, last, email, entryName, picks }),
    })
    console.log('API response:', res)
    const json = await res.json()
    console.log('API JSON:', json)
    if (!res.ok) {
      return setError(json.error || 'Submission failed')
    }

    // build and set the receipt
    const pickedGolfers = picks
      .map((id) => golfers.find((g) => g.id === id))
      .filter(Boolean)
    const newReceipt = {
      first,
      last,
      email,
      entryName,
      picks: pickedGolfers,
      totalSalary,
    }
    console.log('Setting receipt:', newReceipt)
    setReceipt(newReceipt)

    // reset form & picks
    setPicks([])
    e.target.reset()
  }

  // ----------------------------------------------------------------------------
  // Loading view
  // ----------------------------------------------------------------------------
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

  // ----------------------------------------------------------------------------
  // Main view
  // ----------------------------------------------------------------------------
  return (
    <div
      className="relative h-screen bg-no-repeat bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <div className="relative h-full overflow-y-auto">
        <div className="max-w-screen-lg mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">

            {/* TITLE */}
            <h1 className="text-3xl font-bold text-dark-green text-center">
              Golf Pool Entry Form
            </h1>

            {/* RULES */}
            <section className="bg-cream p-4 rounded-lg">
              <div
                className="prose prose-sm max-w-none w-full text-dark-green leading-snug
                           prose-p:mb-1 prose-p:first:mt-0 prose-p:last:mb-0
                           prose-li:mb-1 prose-ul:space-y-0"
                dangerouslySetInnerHTML={{ __html: rules }}
              />
            </section>

            {/* ERROR */}
            {error && (
              <p className="text-red-600">
                ⚠ {error}
              </p>
            )}

            {/* RECEIPT */}
            {receipt && (
              <section className="bg-green-50 border-l-4 border-dark-green p-4 rounded space-y-2">
                <h2 className="text-xl font-semibold text-dark-green">
                  Entry Receipt
                </h2>
                <p>
                  <strong>Name:</strong> {receipt.first} {receipt.last}
                </p>
                <p>
                  <strong>Entry:</strong> {receipt.entryName}
                </p>
                <p>
                  <strong>Total Salary:</strong> ${receipt.totalSalary}
                </p>
                <ul className="list-disc list-inside">
                  {receipt.picks.map((g, i) => (
                    <li key={g.id}>
                      {i + 1}. {g.name} — ${g.salary}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* contact info */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="first"
                  placeholder="First Name"
                  required
                  className="border rounded-lg p-3 placeholder-dark-green/70 focus:outline-none focus:ring-2 focus:ring-dark-green"
                />
                <input
                  name="last"
                  placeholder="Last Name"
                  required
                  className="border rounded-lg p-3 placeholder-dark-green/70 focus:outline-none focus:ring-2 focus:ring-dark-green"
                />
              </div>
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                required
                className="w-full border rounded-lg p-3 placeholder-dark-green/70 focus:outline-none focus:ring-2 focus:ring-dark-green"
              />
              <input
                name="entryName"
                placeholder="Entry Name"
                required
                className="w-full border rounded-lg p-3 placeholder-dark-green/70 focus:outline-none focus:ring-2 focus:ring-dark-green"
              />

              {/* counter */}
              <p className="text-sm">
                Picks: <strong>{picks.length}/6</strong> &nbsp;|&nbsp; Total
                Salary: <strong>${totalSalary}</strong>/100
              </p>

              {/* golfer grid */}
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
