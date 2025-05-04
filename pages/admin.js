// pages/admin.js
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

// ── 1) Dynamically import ReactQuill *and* register our custom attributors before it ever mounts:
const ReactQuill = dynamic(
  () =>
    import('react-quill').then((QuillModule) => {
      const Quill = QuillModule.Quill

      // Register exact-pixel sizes
      const Size = Quill.import('attributors/style/size')
      Size.whitelist = [
        '8px','10px','12px','14px','16px','18px',
        '20px','22px','24px','28px','32px','36px','48px'
      ]
      Quill.register(Size, true)

      // Register color & background
      Quill.register(Quill.import('attributors/style/color'),      true)
      Quill.register(Quill.import('attributors/style/background'), true)

      return QuillModule.default
    }),
  { ssr: false }
)

export default function Admin() {
  const [loading,     setLoading]      = useState(true)
  const [settings,    setSettings]     = useState({})
  const [formTitle,   setFormTitle]    = useState('')
  const [rules,       setRules]        = useState('')
  const [backgrounds, setBackgrounds]  = useState([])
  const [activeBgKey, setActiveBgKey]  = useState('')
  const [activeBgUrl, setActiveBgUrl]  = useState('')
  const [bgFile,      setBgFile]       = useState(null)
  const [uploading,   setUploading]    = useState(false)

  // ── Load settings + backgrounds on mount
  useEffect(() => {
    async function load() {
      try {
        // settings
        const res1 = await fetch('/api/admin/settings')
        const { settings: s } = await res1.json()
        setSettings(s)
        setFormTitle(s.form_title || '')
        setRules(s.rules || '')

        // backgrounds
        const res2 = await fetch('/api/admin/backgrounds')
        const { backgrounds: bgs } = await res2.json()
        setBackgrounds(bgs)
      } catch (e) {
        console.error(e)
        alert('Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Sync the selected background key/url
  useEffect(() => {
    if (!loading && settings.background_image) {
      setActiveBgUrl(settings.background_image)
      const found = backgrounds.find(b => b.publicUrl === settings.background_image)
      if (found) setActiveBgKey(found.key)
    }
  }, [loading, settings, backgrounds])

  // ── Generic setting save helper
  const saveSetting = async (key, value) => {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ key, value })
    })
    if (!res.ok) {
      const { error } = await res.json()
      return alert('Save failed: ' + error)
    }
    alert('Saved!')
  }

  // ── Upload a new background image
  const uploadBg = async () => {
    if (!bgFile) return alert('Pick a file first')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', bgFile)
      const res = await fetch('/api/admin/backgrounds/upload', { method:'POST', body:fd })
      if (!res.ok) throw new Error((await res.json()).error)
      const { key, publicUrl } = await res.json()
      setBackgrounds(b => [{ key, publicUrl }, ...b])
      setBgFile(null)
      setActiveBgKey(key)
      setActiveBgUrl(publicUrl)
      await saveSetting('background_image', publicUrl)
    } catch (e) {
      console.error(e)
      alert('Upload failed: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  // ── Set the selected image as current background
  const handleSetBackground = () => {
    if (!activeBgKey) return alert('Select one first')
    saveSetting('background_image', activeBgUrl)
  }

  // ── Delete the selected background
  const handleDeleteSelected = async () => {
    if (!activeBgKey) return alert('Select one to delete')
    if (!confirm('Really delete this image?')) return
    try {
      const res = await fetch('/api/admin/backgrounds/delete', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ key:activeBgKey })
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setBackgrounds(b => b.filter(x => x.key !== activeBgKey))
      if (settings.background_image === activeBgUrl) {
        setActiveBgKey('')
        setActiveBgUrl('')
        await saveSetting('background_image','')
      }
      alert('Deleted!')
    } catch (e) {
      console.error(e)
      alert('Delete failed: '+e.message)
    }
  }

  if (loading) {
    return <p className="p-6 text-center">Loading admin…</p>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-gray-50 text-dark-green font-sans">
      <h1 className="text-2xl font-bold">Golf Pool Admin</h1>

      {/* Form Title */}
      <section>
        <h2 className="font-semibold">Form Title</h2>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={formTitle}
          onChange={e => setFormTitle(e.target.value)}
        />
        <button
          onClick={() => saveSetting('form_title', formTitle)}
          className="mt-2 bg-dark-green text-white px-4 py-2 rounded"
        >
          Save Title
        </button>
      </section>

      {/* Rules Text */}
      <section>
        <h2 className="font-semibold">Rules Text</h2>
        <div className="border rounded overflow-hidden">
          <ReactQuill
            theme="snow"
            value={rules}
            onChange={setRules}
            modules={{
              toolbar: [
                [{ size: [
                  '8px','10px','12px','14px','16px','18px',
                  '20px','22px','24px','28px','32px','36px','48px'
                ] }],
                ['bold','italic','underline','strike'],
                [{ color:[] },{ background:[] }],
                [{ list:'ordered' },{ list:'bullet' }],
                ['link','image'],['clean']
              ]
            }}
            formats={[
              'size','bold','italic','underline','strike',
              'color','background','list','bullet','link','image'
            ]}
          />
        </div>
        <button
          onClick={() => saveSetting('rules', rules)}
          className="mt-2 bg-dark-green text-white px-4 py-2 rounded"
        >
          Save Rules
        </button>
      </section>

      {/* Background Images */}
      <section>
        <h2 className="font-semibold">Background Images</h2>

        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept="image/*"
            onChange={e => setBgFile(e.target.files?.[0] || null)}
            className="border p-1 rounded"
          />
          <button
            onClick={uploadBg}
            disabled={uploading}
            className="bg-dark-green text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {backgrounds.map(({ key, publicUrl }) => (
            <label
              key={key}
              className="cursor-pointer border p-2 rounded flex flex-col items-center"
            >
              <img
                src={publicUrl}
                alt={key}
                className={`h-24 w-full object-cover rounded ${
                  activeBgKey === key ? 'ring-2 ring-dark-green' : ''
                }`}
              />
              <input
                type="radio"
                name="activeBg"
                className="mt-2"
                checked={activeBgKey === key}
                onChange={() => {
                  setActiveBgKey(key)
                  setActiveBgUrl(publicUrl)
                }}
              />
              <span className="mt-1 text-sm truncate">{key}</span>
            </label>
          ))}
        </div>

        <div className="mt-4 flex space-x-4">
          <button
            onClick={handleSetBackground}
            disabled={!activeBgKey}
            className="bg-dark-green text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Set as Background
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={!activeBgKey}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Delete Selected
          </button>
        </div>
      </section>
    </div>
  )
}
