// pages/entries.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Entries() {
  const [entries, setEntries] = useState([])
  const [golfers, setGolfers] = useState({})
  const [loading, setLoading] = useState(true)

  // load entries + golfer lookup
  useEffect(() => {
    async function load() {
      // fetch golfers into a map for salary lookup
      const { data: gfList } = await supabase
        .from('golfers')
        .select('id, name, salary')
      const gfMap = gfList.reduce((m, g) => {
        m[g.id] = { name: g.name, salary: g.salary }
        return m
      }, {})
      setGolfers(gfMap)

      // fetch entries
      const { data: en } = await supabase
        .from('entries')
        .select('*')
      // parse out picks array if stored as JSON string
      const parsed = en.map((e) => ({
        ...e,
        picks: typeof e.picks === 'string' ? JSON.parse(e.picks) : e.picks
      }))
      setEntries(parsed)
      setLoading(false)
    }
    load()
  }, [])

  // build and download CSV
  const exportCsv = () => {
    // header
    const header = [
      'First Name',
      'Last Name',
      'Email',
      'Entry Name',
      ...Array.from({ length: 6 }, (_, i) => `Golfer ${i + 1}`),
      ...Array.from({ length: 6 }, (_, i) => `Salary ${i + 1}`),
      'Total Salary'
    ]

    // rows
    const rows = entries.map(({ first, last, email, entryName, picks }) => {
      const golferCols = []
      const salaryCols = []
      let total = 0
      picks.forEach((id) => {
        const g = golfers[id] || { name: '', salary: 0 }
        golferCols.push(g.name)
        salaryCols.push(g.salary)
        total += g.salary
      })
      // pad to 6 if less (shouldn’t happen)
      while (golferCols.length < 6) {
        golferCols.push('')
        salaryCols.push('')
      }
      return [
        first,
        last,
        email,
        entryName,
        ...golferCols,
        ...salaryCols,
        total
      ]
    })

    // combine and download
    const csvContent =
      [header, ...rows]
        .map((r) =>
          r
            .map((cell) =>
              // escape quotes
              `"${String(cell).replace(/"/g, '""')}"`
            )
            .join(',')
        )
        .join('\r\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'entries.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <p className="p-6 text-center">Loading entries…</p>
  }

  return (
    <div className="p-6 max-w-screen-lg mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark-green">All Entries</h1>
        <button
          onClick={exportCsv}
          className="bg-dark-green text-white px-4 py-2 rounded"
        >
          Export as CSV
        </button>
      </div>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-cream">
            <th className="border px-2 py-1">First</th>
            <th className="border px-2 py-1">Last</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Entry</th>
            {Array.from({ length: 6 }).map((_, i) => (
              <th key={`g${i}`} className="border px-2 py-1">{`Golfer ${i+1}`}</th>
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <th key={`s${i}`} className="border px-2 py-1">{`Salary ${i+1}`}</th>
            ))}
            <th className="border px-2 py-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const { first, last, email, entryName, picks } = e
            const golferCols = []
            const salaryCols = []
            let total = 0
            picks.forEach((id) => {
              const g = golfers[id] || { name: '', salary: 0 }
              golferCols.push(g.name)
              salaryCols.push(g.salary)
              total += g.salary
            })
            while (golferCols.length < 6) golferCols.push(''), salaryCols.push('')
            return (
              <tr key={`${email}-${entryName}`} className="odd:bg-white even:bg-gray-50">
                <td className="border px-2 py-1">{first}</td>
                <td className="border px-2 py-1">{last}</td>
                <td className="border px-2 py-1">{email}</td>
                <td className="border px-2 py-1">{entryName}</td>
                {golferCols.map((n, i) => (
                  <td key={i} className="border px-2 py-1">{n}</td>
                ))}
                {salaryCols.map((s, i) => (
                  <td key={i} className="border px-2 py-1">${s}</td>
                ))}
                <td className="border px-2 py-1">${total}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
