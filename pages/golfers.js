// pages/golfers.js
import { useState, useEffect } from 'react'
import Papa from 'papaparse'

export default function GolfersManager() {
  const [golfers, setGolfers]         = useState([])
  const [newGf, setNewGf]             = useState({ name: '', salary: '' })
  const [csvUploading, setCsvUploading] = useState(false)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    async function loadGolfers() {
      const res = await fetch('/api/admin/golfers')
      const { golfers } = await res.json()
      setGolfers(golfers || [])
      setLoading(false)
    }
    loadGolfers()
  }, [])

  const addGolfer = async () => {
    const salaryInt = parseInt(newGf.salary, 10)
    if (!newGf.name || isNaN(salaryInt)) {
      return alert('Enter both name and numeric salary')
    }
    await fetch('/api/admin/golfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newGf.name, salary: salaryInt })
    })
    const res = await fetch('/api/admin/golfers')
    const { golfers } = await res.json()
    setGolfers(golfers || [])
    setNewGf({ name: '', salary: '' })
  }

  const deleteGolfer = async (id) => {
    if (!confirm(`Delete golfer #${id}?`)) return
    await fetch(`/api/admin/golfers?id=${id}`, { method: 'DELETE' })
    setGolfers(golfers.filter((g) => g.id !== id))
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: async (results) => {
        const batch = results.data
          .map((r) => ({
            name: r[0]?.trim(),
            salary: parseInt(r[1], 10)
          }))
          .filter((g) => g.name && !isNaN(g.salary))
        if (batch.length === 0) return alert('No valid rows')
        setCsvUploading(true)
        const res = await fetch('/api/admin/golfers/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ golfers: batch })
        })
        setCsvUploading(false)
        if (!res.ok) {
          const { error } = await res.json()
          return alert('Upload failed: ' + error)
        }
        const { golfers: newList } = await res.json()
        setGolfers(newList || [])
        alert(`Imported ${batch.length} golfers`)
      }
    })
  }

  const clearGolfers = async () => {
    if (!confirm('Delete ALL golfers?')) return
    const res = await fetch('/api/admin/golfers/reset', { method: 'POST' })
    if (!res.ok) {
      const { error } = await res.json()
      return alert('Error clearing golfers: ' + error)
    }
    setGolfers([])
    alert('Golfers cleared')
  }

  if (loading) {
    return <p className="p-6 text-center">Loading golfers…</p>
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6 font-sans text-dark-green bg-gray-50">
      <h1 className="text-2xl font-bold">Manage Golfers</h1>

      {/* CSV Batch Upload */}
      <section className="space-y-2">
        <h2 className="font-semibold">Batch Upload (CSV)</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          disabled={csvUploading}
          className="border p-2 rounded"
        />
        {csvUploading && <p>Uploading…</p>}
      </section>

      {/* Golfers Table */}
      <section className="space-y-4">
        <h2 className="font-semibold">Golfers</h2>
        {golfers.length ? (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-cream">
                <th className="border px-3 py-1">ID</th>
                <th className="border px-3 py-1">Name</th>
                <th className="border px-3 py-1">Salary</th>
                <th className="border px-3 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {golfers.map((g) => (
                <tr key={g.id}>
                  <td className="border px-3 py-1">{g.id}</td>
                  <td className="border px-3 py-1">{g.name}</td>
                  <td className="border px-3 py-1">${g.salary}</td>
                  <td className="border px-3 py-1">
                    <button
                      onClick={() => deleteGolfer(g.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No golfers yet</p>
        )}

        {/* Add Single Golfer */}
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Name"
            value={newGf.name}
            onChange={(e) => setNewGf({ ...newGf, name: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            placeholder="Salary"
            value={newGf.salary}
            onChange={(e) =>
              setNewGf({ ...newGf, salary: e.target.value.replace(/\D/g, '') })
            }
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={addGolfer}
          className="bg-dark-green text-white px-4 py-2 rounded"
        >
          Add Golfer
        </button>
      </section>

      {/* Clear All Golfers */}
      <section>
        <button
          onClick={clearGolfers}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Clear All Golfers
        </button>
      </section>
    </div>
  )
}
