// pages/admin.js
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import Papa from 'papaparse'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default function Admin() {
  // ── State
  const [formTitle, setFormTitle] = useState('')
  const [rules, setRules] = useState('')

  const [golfers, setGolfers] = useState([])
  const [newGf, setNewGf] = useState({ name: '', salary: '' })
  const [csvUploading, setCsvUploading] = useState(false)

  const [backgrounds, setBackgrounds] = useState([])
  const [activeBg, setActiveBg] = useState('')
  const [bgFile, setBgFile] = useState(null)
  const [uploadingBg, setUploadingBg] = useState(false)

  const [loading, setLoading] = useState(true)

  // ── Pixel sizes for the size dropdown
  const sizeOptions = [
    '8px','10px','12px','14px','16px','18px','20px','22px','24px','28px','32px','36px','48px'
  ]

  // ── Quill toolbar + formats
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      [{ size: sizeOptions }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  }
  const formats = [
    'header', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'link', 'image'
  ]

  // ── On mount: register size/color and load data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const Quill = require('react-quill').Quill
      const SizeStyle = Quill.import('attributors/style/size')
      SizeStyle.whitelist = sizeOptions
      Quill.register(SizeStyle, true)
      const ColorStyle = Quill.import('attributors/style/color')
      Quill.register(ColorStyle, true)
      const BgStyle = Quill.import('attributors/style/background')
      Quill.register(BgStyle, true)
    }
    async function loadAll() {
      // settings
      const stRes = await fetch('/api/admin/settings')
      const { settings } = await stRes.json()
      setFormTitle(settings.form_title || 'Golf Pool Entry Form')
      setRules(settings.rules || '')
      setActiveBg(settings.background_image || '')

      // golfers
      const gfRes = await fetch('/api/admin/golfers')
      const { golfers: gfData } = await gfRes.json()
      setGolfers(gfData || [])

      // backgrounds
      const bgRes = await fetch('/api/admin/backgrounds')
      const { backgrounds: bgList } = await bgRes.json()
      setBackgrounds(bgList || [])

      setLoading(false)
    }
    loadAll()
  }, [])

  // ── Handlers
  const saveFormTitle = async () => {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'form_title', value: formTitle })
    })
    alert('Form title saved')
  }
  const saveRules = async () => {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'rules', value: rules })
    })
    alert('Rules saved')
  }

  const addGolfer = async () => {
    const salaryInt = parseInt(newGf.salary, 10)
    if (!newGf.name || isNaN(salaryInt)) {
      return alert('Enter name and numeric salary')
    }
    await fetch('/api/admin/golfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newGf.name, salary: salaryInt })
    })
    const res = await fetch('/api/admin/golfers')
    const { golfers: updated } = await res.json()
    setGolfers(updated || [])
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
          .map((r) => ({ name: r[0]?.trim(), salary: parseInt(r[1], 10) }))
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
        alert(`Imported ${batch.length}`)
      }
    })
  }

  const clearEntries = async () => {
    if (!confirm('Clear all entries?')) return
    const res = await fetch('/api/admin/entries/reset', { method: 'POST' })
    if (!res.ok) {
      const { error } = await res.json()
      return alert('Error clearing entries: ' + error)
    }
    alert('Entries cleared')
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

  const uploadBg = async () => {
    if (!bgFile) return alert('Select an image')
    setUploadingBg(true)
    const fd = new FormData()
    fd.append('image', bgFile)
    const res = await fetch('/api/admin/backgrounds/upload', { method: 'POST', body: fd })
    setUploadingBg(false)
    if (!res.ok) {
      const { error } = await res.json()
      return alert('Upload failed: ' + error)
    }
    const { key, publicUrl } = await res.json()
    setBackgrounds([{ key, publicUrl }, ...backgrounds])
    setBgFile(null)
  }

  const saveBgSelection = async () => {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'background_image', value: activeBg })
    })
    alert('Background updated')
  }

  if (loading) {
    return <p className="p-6 text-center">Loading admin…</p>
  }

  return (
    <>
      {/* Map pixel-values to dropdown labels */}
      <style jsx global>{`
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="8px"]::before { content: "8px"; }
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="10px"]::before { content: "10px"; }
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="12px"]::before { content: "12px"; }
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="14px"]::before { content: "14px"; }
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="16px"]::before { content: "16px"; }
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="18px"]::before { content: "18px"; }
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="20px"]::before { content: "20px"; }
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="22px"]::before { content: "22px"; }
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="24px"]::before { content: "24px"; }
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="28px"]::before { content: "28px"; }
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="32px"]::before { content: "32px"; }
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="36px"]::before { content: "36px"; }
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="48px"]::before { content: "48px"; }
      `}</style>

      <div className="p-8 max-w-4xl mx-auto space-y-8 font-sans text-dark-green">
        <h1 className="text-2xl font-bold">🏌️‍♂️ Golf Pool Admin</h1>

        {/* Form Title */}
        <section className="space-y-2">
          <h2 className="font-semibold">Form Title</h2>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="w-full border border-dark-green/50 p-2 rounded"
          />
          <button
            onClick={saveFormTitle}
            className="bg-dark-green text-white px-4 py-2 rounded"
          >
            Save Title
          </button>
        </section>

        {/* Rules Editor */}
        <section className="space-y-2">
          <h2 className="font-semibold">Rules Text</h2>
          <div className="border border-dark-green/50 rounded-lg overflow-hidden">
            <ReactQuill
              theme="snow"
              value={rules}
              onChange={setRules}
              modules={modules}
              formats={formats}
            />
          </div>
          <button
            onClick={saveRules}
            className="bg-dark-green text-white px-4 py-2 rounded"
          >
            Save Rules
          </button>
        </section>

        {/* Batch CSV Upload */}
        <section className="space-y-2">
          <h2 className="font-semibold">Batch Upload Golfers (CSV)</h2>
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            disabled={csvUploading}
            className="border p-2 rounded"
          />
          {csvUploading && <p>Uploading…</p>}
        </section>

        {/* Golfers Table & Add */}
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
          <div className="grid grid-cols-2 gap-4 mt-4">
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

        {/* Clear Buttons */}
        <section className="flex space-x-4">
          <button
            onClick={clearEntries}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Clear All Entries
          </button>
          <button
            onClick={clearGolfers}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Clear All Golfers
          </button>
        </section>

        {/* Background Manager */}
        <section className="space-y-4">
          <h2 className="font-semibold">Background Images</h2>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBgFile(e.target.files?.[0])}
              className="border p-1 rounded"
            />
            <button
              onClick={uploadBg}
              disabled={uploadingBg}
              className="bg-dark-green text-white px-4 py-1 rounded disabled:opacity-50"
            >
              {uploadingBg ? 'Uploading…' : 'Upload'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {backgrounds.map((bg) => (
              <label key={bg.key} className="border p-2 rounded cursor-pointer">
                <img
                  src={bg.publicUrl}
                  alt=""
                  className="h-24 w-full object-cover rounded"
                />
                <div className="flex items-center mt-1">
                  <input
                    type="radio"
                    name="activeBg"
                    value={bg.publicUrl}
                    checked={activeBg === bg.publicUrl}
                    onChange={() => setActiveBg(bg.publicUrl)}
                  />
                  <span className="ml-2 truncate">{bg.key}</span>
                </div>
              </label>
            ))}
          </div>
          <button
            onClick={saveBgSelection}
            className="bg-dark-green text-white px-4 py-2 rounded"
          >
            Save Background Selection
          </button>
        </section>
      </div>
    </>
  )
}
