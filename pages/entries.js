import React from 'react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Entries() {
  const [entries, setEntries] = useState([])
  const [gMap, setGMap]       = useState({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState(false)

  useEffect(() => {
    async function load() {
      const { data: gfList } = await supabase
        .from('golfers')
        .select('id,name,salary')
      const map = {}
      gfList.forEach((g) => { map[g.id] = { name: g.name, salary: g.salary } })
      setGMap(map)

      const { data: enList } = await supabase
        .from('entries')
        .select('id, first_name, last_name, email, entry_name, picks')
      const parsed = (enList || []).map((e) => ({
        ...e,
        picks:
          typeof e.picks === 'string'
            ? JSON.parse(e.picks)
            : e.picks
      }))
      setEntries(parsed)
      setLoading(false)
    }
    load()
  }, [])

  const exportCsv = () => {
    const header = [
      'First Name','Last Name','Email','Entry Name',
      ...Array.from({ length: 6 }, (_, i) => `Golfer ${i+1}`),
      ...Array.from({ length: 6 }, (_, i) => `Salary ${i+1}`),
      'Total Salary'
    ]

    const rows = entries.map(
      ({ first_name, last_name, email, entry_name, picks }) => {
        const out = [first_name, last_name, email, entry_name]
        let total = 0
        for (let i = 0; i < 6; i++) {
          const g = gMap[picks[i]] || { name: '', salary: 0 }
          out.push(g.name, g.salary)
          total += g.salary
        }
        out.push(total)
        return out
      }
    )

    const csv = [header, ...rows]
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')
      )
      .join('\r\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'entries.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearEntries = async () => {
    if (!confirm('Delete ALL entries?')) return
    const { error } = await supabase
      .from('entries')
      .delete()
      .neq('id', 0)
    if (error) {
      alert('Error clearing entries: ' + error.message)
    } else {
      setEntries([])
      alert('Entries cleared')
    }
  }

  const deleteEntry = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return
    setBusy(true)
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id)
    if (error) {
      console.error(error)
      alert('Delete failed: ' + error.message)
    } else {
      await loadEntries()
    }
    setBusy(false)
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading entries…
      </div>
    )
  }

  return (
    <div className="p-6 max-w-screen-xl mx-auto bg-gray-50 rounded-lg space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark-green">Manage Entries</h1>

        {/* Export and Clear Buttons */}
        <div className="space-x-2">
          <button
            onClick={exportCsv}
            className="bg-dark-green text-white px-4 py-2 rounded">
            Export as CSV
          </button>
          <button
            onClick={clearEntries}
            className="bg-red-600 text-white px-4 py-2 rounded">
            Clear All Entries
          </button>
        </div>
      </div>

      {/* Entries Table */}
      <div className="overflow-x-auto border border-dark-green rounded-lg">
        <table className="w-full table-auto border-collapse text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-white">
              <th className="border px-4 py-2 whitespace-nowrap">First Name</th>
              <th className="border px-4 py-2 whitespace-nowrap">Last Name</th>
              <th className="border px-4 py-2 whitespace-nowrap">Email</th>
              <th className="border px-4 py-2 whitespace-nowrap">Entry Name</th>
              {Array.from({ length: 6 }).map((_, i) => (
                <React.Fragment key={i}>
                  <th className="border px-4 py-2 whitespace-nowrap">
                    Golfer {i + 1}
                  </th>
                  <th className="border px-4 py-2 whitespace-nowrap">
                    Salary {i + 1}
                  </th>
                </React.Fragment>
              ))}
              <th className="border px-4 py-2 whitespace-nowrap">Total</th>
              <th className="border px-4 py-2 whitespace-nowrap">Delete</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, idx) => {
              const { first_name, last_name, email, entry_name, picks } = e
              let total = 0
              return (
                <tr key={idx} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-4 py-2 whitespace-nowrap">
                    {first_name}
                  </td>
                  <td className="border px-4 py-2 whitespace-nowrap">
                    {last_name}
                  </td>
                  <td className="border px-4 py-2 whitespace-nowrap">
                    {email}
                  </td>
                  <td className="border px-4 py-2 whitespace-nowrap">
                    {entry_name}
                  </td>
                  {Array.from({ length: 6 }).map((_, i) => {
                    const g = gMap[picks[i]] || { name: '', salary: 0 }
                    total += g.salary
                    return (
                      <React.Fragment key={i}>
                        <td className="border px-4 py-2 whitespace-nowrap">
                          {g.name}
                        </td>
                        <td className="border px-4 py-2 whitespace-nowrap">
                          ${g.salary}
                        </td>
                      </React.Fragment>
                    )
                  })}
                  <td className="border px-4 py-2 whitespace-nowrap">
                    ${total}
                  </td>
                </tr>
              )
            })}
            <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => deleteEntry(e.id)}
                      disabled={busy}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
          </tbody>
        </table>
      </div>
    </div>
  )
}
