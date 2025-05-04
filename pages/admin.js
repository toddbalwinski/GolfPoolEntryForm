// pages/admin.js

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default function Admin() {
  // ── State
  const [loading,      setLoading     ] = useState(true)
  const [settings,     setSettings    ] = useState({})
  const [formTitle,    setFormTitle   ] = useState('')
  const [rules,        setRules       ] = useState('')
  const [backgrounds,  setBackgrounds ] = useState([])
  const [activeBgKey,  setActiveBgKey ] = useState('')
  const [activeBgUrl,  setActiveBgUrl ] = useState('')
  const [bgFile,       setBgFile      ] = useState(null)
  const [uploading,    setUploading   ] = useState(false)

  // ── Quill setup (run once on mount)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const Quill = require('react-quill').Quill
    // whitelist font sizes
    const Size = Quill.import('attributors/style/size')
    Size.whitelist = [
      '8px','10px','12px','14px','16px','18px',
      '20px','22px','24px','28px','32px','36px','48px'
    ]
    Quill.register(Size, true)
    Quill.register(Quill.import('attributors/style/color'), true)
    Quill.register(Quill.import('attributors/style/background'), true)
  }, [])

  // ── Load settings & backgrounds (run once on mount)
  useEffect(() => {
    async function load() {
      try {
        // fetch settings
        const stRes = await fetch('/api/admin/settings')
        const { settings: s } = await stRes.json()
        setSettings(s)
        setFormTitle(s.form_title || '')
        setRules(s.rules || '')

        // fetch backgrounds
        const bgRes = await fetch('/api/admin/backgrounds')
        const { backgrounds: bgs } = await bgRes.json()
        setBackgrounds(bgs)
      } catch (err) {
        console.error('Admin load error:', err)
        alert('Failed to load admin data – see console.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Sync the selected background from settings
  useEffect(() => {
    if (!loading && settings.background_image) {
      setActiveBgUrl(settings.background_image)
      const found = backgrounds.find(b => b.publicUrl === settings.background_image)
      if (found) setActiveBgKey(found.key)
    }
  }, [loading, settings, backgrounds])

  // ── Helper to save a key/value setting
  const saveSetting = async (key, value) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ key, value })
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error)
      }
      alert('Saved!')
    } catch (e) {
      console.error('Save setting error', e)
      alert('Save failed: ' + e.message)
    }
  }

  // ── Upload a new background image
  const uploadBg = async () => {
    if (!bgFile) return alert('Select a file first')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', bgFile)
      const res = await fetch('/api/admin/backgrounds/upload', {
        method: 'POST',
        body: fd
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error)
      }
      const { key, publicUrl } = await res.json()
      setBackgrounds(prev => [ { key, publicUrl }, ...prev ])
      setBgFile(null)
      // auto‐select and save
      setActiveBgKey(key)
      setActiveBgUrl(publicUrl)
      await saveSetting('background_image', publicUrl)
    } catch (e) {
      console.error('Upload error', e)
      alert('Upload failed: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  // ── Set the currently selected image as background
  const handleSetBackground = () => {
    if (!activeBgKey) return alert('Select an image first')
    saveSetting('background_image', activeBgUrl)
  }

  // ── Delete the currently selected image
  const handleDeleteSelected = async () => {
    if (!activeBgKey) return alert('Select an image to delete')
    if (!confirm('Really delete this background?')) return
    try {
      const res = await fetch('/api/admin/backgrounds/delete', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ key: activeBgKey })
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error)
      }
      setBackgrounds(bgs => bgs.filter(b => b.key !== activeBgKey))
      // clear setting if it was active
      if (settings.background_image === activeBgUrl) {
        setActiveBgKey('')
        setActiveBgUrl('')
        await saveSetting('background_image', '')
      }
      alert('Deleted!')
    } catch (e) {
      console.error('Delete error', e)
      alert('Delete failed: ' + e.message)
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
                ['link','image'], ['clean']
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

        {/* Upload */}
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

        {/* Thumbnails */}
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

        {/* Actions */}
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
