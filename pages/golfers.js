// pages/golfers.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function GolfersPage() {
  const [golfers, setGolfers]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [newName, setNewName]     = useState('')
  const [newSalary, setNewSalary] = useState('')
  const [csvFile, setCsvFile]     = useState(null)
  const [busy, setBusy]           = useState(false)

  // load all golfers
  const loadGolfers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('golfers')
      .select('*')
      .order('id', { ascending: true })
    if (error) {
      console.error(error)
      alert('Failed to load golfers')
    } else {
      setGolfers(data)
    }
    setLoading(false)
  }

  useEffect(() => { loadGolfers() }, [])

  // add one golfer
  const addGolfer = async (e) => {
    e.preventDefault()
    if (!newName.trim() || !newSalary) return
    setBusy(true)
    const { error } = await supabase
      .from('golfers')
      .insert({ name: newName.trim(), salary: +newSalary })
    if (error) {
      console.error(error)
      alert('Insert failed: ' + error.message)
    } else {
      setNewName(''); setNewSalary('')
      await loadGolfers()
    }
    setBusy(false)
  }

  // delete one golfer
  const deleteGolfer = async (id) => {
    if (!confirm('Delete this golfer?')) return
    setBusy(true)
    const { error } = await supabase
      .from('golfers')
      .delete()
      .eq('id', id)
    if (error) {
      console.error(error)
      alert('Delete failed: ' + error.message)
    } else {
      await loadGolfers()
    }
    setBusy(false)
  }

  // batch upload CSV
  const uploadCsv = async () => {
    if (!csvFile) return alert('Choose a CSV file first')
    setBusy(true)
    try {
      const text = await csvFile.text()
      const rows = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
      // assume first row is header if it contains non-numeric second column
      const start = rows[0].toLowerCase().startsWith('name') ? 1 : 0
      const data = rows.slice(start).map(line => {
        const [name, salary] = line.split(',').map(s => s.trim())
        return { name, salary: +salary }
      })
      const { error } = await supabase
        .from('golfers')
        .insert(data)
      if (error) throw error
      await loadGolfers()
      setCsvFile(null)
    } catch (err) {
      console.error(err)
      alert('CSV upload failed: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-dark-green">
        Loading golfers…
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-screen-lg mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-dark-green">
          All Golfers
        </h1>

        {/* Add Single Golfer */}
        <form
          onSubmit={addGolfer}
          className="flex flex-wrap gap-4 items-end"
        >
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-dark-green">Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-dark-green">Salary</label>
            <input
              type="number"
              value={newSalary}
              onChange={e => setNewSalary(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="bg-dark-green text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Add Golfer
          </button>
        </form>

        {/* Batch CSV Upload */}
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-green">
              Upload CSV (name,salary)
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={e => setCsvFile(e.target.files?.[0] || null)}
              className="mt-1 block"
            />
          </div>
          <button
            onClick={uploadCsv}
            disabled={busy || !csvFile}
            className="bg-dark-green text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Upload CSV
          </button>
        </div>

        {/* Golfers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b border-gray-200 text-left text-sm font-semibold text-dark-green">
                  ID
                </th>
                <th className="px-4 py-2 border-b border-gray-200 text-left text-sm font-semibold text-dark-green">
                  Name
                </th>
                <th className="px-4 py-2 border-b border-gray-200 text-left text-sm font-semibold text-dark-green">
                  Salary
                </th>
                <th className="px-4 py-2 border-b border-gray-200 text-center text-sm font-semibold text-dark-green">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {golfers.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b border-gray-200 text-sm text-dark-green whitespace-nowrap">
                    {g.id}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 text-sm text-dark-green whitespace-nowrap">
                    {g.name}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 text-sm text-dark-green whitespace-nowrap">
                    ${g.salary}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 text-center">
                    <button
                      onClick={() => deleteGolfer(g.id)}
                      disabled={busy}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
