// pages/admin.js
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default function Admin() {
  const [formTitle, setFormTitle]     = useState('')
  const [rules, setRules]             = useState('')
  const [backgrounds, setBackgrounds] = useState([])
  const [activeBg, setActiveBg]       = useState('')
  const [bgFile, setBgFile]           = useState(null)
  const [uploadingBg, setUploadingBg] = useState(false)
  const [loading, setLoading]         = useState(true)

  // pixel sizes for the size-picker
  const sizeOptions = [
    '8px','10px','12px','14px','16px','18px','20px','22px','24px','28px','32px','36px','48px'
  ]

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

  useEffect(() => {
    // register pixel sizes & color/bg attributors
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

    // fetch settings & backgrounds
    async function loadAll() {
      // form title & rules
      const stRes = await fetch('/api/admin/settings')
      const { settings } = await stRes.json()
      setFormTitle(settings.form_title || 'Golf Pool Entry Form')
      setRules(settings.rules || '')
      setActiveBg(settings.background_image || '')

      // backgrounds list
      const bgRes = await fetch('/api/admin/backgrounds')
      const { backgrounds: bgList } = await bgRes.json()
      setBackgrounds(bgList || [])

      setLoading(false)
    }
    loadAll()
  }, [])

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

  const clearEntries = async () => {
    if (!confirm('Clear all entries?')) return
    const res = await fetch('/api/admin/entries/reset', { method: 'POST' })
    if (!res.ok) {
      const { error } = await res.json()
      return alert('Error clearing entries: ' + error)
    }
    alert('Entries cleared')
  }

  const uploadBg = async () => {
    if (!bgFile) return alert('Select an image')
    setUploadingBg(true)
    const fd = new FormData()
    fd.append('image', bgFile)
    const res = await fetch('/api/admin/backgrounds/upload', {
      method: 'POST',
      body: fd
    })
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
      {/* map pixel-values to size-picker labels */}
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

        {/* Clear Entries */}
        <section>
          <button
            onClick={clearEntries}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Clear All Entries
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
