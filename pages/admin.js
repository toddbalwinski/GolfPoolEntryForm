// pages/admin.js
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { supabase } from '../lib/supabase'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default function Admin() {
  // ── state
  const [loading,    setLoading   ] = useState(true)
  const [settings,   setSettings  ] = useState({})
  const [formTitle,  setFormTitle ] = useState('')
  const [rules,      setRules     ] = useState('')
  const [backgrounds,setBackgrounds] = useState([])
  const [activeBg,   setActiveBg  ] = useState('')
  const [bgFile,     setBgFile    ] = useState(null)
  const [uploading,  setUploading ] = useState(false)

  // ── Quill setup (run once)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const Quill = require('react-quill').Quill
    // register size whitelist
    const Size = Quill.import('attributors/style/size')
    Size.whitelist = ['8px','10px','12px','14px','16px','18px','20px','22px','24px','28px','32px','36px','48px']
    Quill.register(Size, true)
    Quill.register(Quill.import('attributors/style/color'), true)
    Quill.register(Quill.import('attributors/style/background'), true)
  }, [])

  // ── Load both settings & backgrounds (run once)
  useEffect(() => {
    async function load() {
      try {
        // settings
        const st = await fetch('/api/admin/settings')
        const { settings: s } = await st.json()
        setSettings(s)
        setFormTitle(s.form_title || '')
        setRules(s.rules || '')
        setActiveBg(s.background_image || '')

        // backgrounds
        const bg = await fetch('/api/admin/backgrounds')
        const { backgrounds: bgs } = await bg.json()
        setBackgrounds(bgs)
      } catch (e) {
        console.error('Admin load error:', e)
        alert('Failed to load admin data—check console')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Handlers
  const save = async (key, value) => {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({ key, value })
    })
    alert('Saved!')
  }

  const uploadBg = async () => {
    if (!bgFile) return alert('Select a file first')
    setUploading(true)
    const fd = new FormData()
    fd.append('image', bgFile)
    const res = await fetch('/api/admin/backgrounds/upload', { method:'POST', body:fd })
    setUploading(false)
    if (!res.ok) {
      const { error } = await res.json()
      return alert('Upload failed: '+error)
    }
    const { key, publicUrl } = await res.json()
    setBackgrounds([ { key, publicUrl }, ...backgrounds ])
    setBgFile(null)
    // immediately save active
    await save('background_image', publicUrl)
  }


  // DELETE handler
  async function deleteBackground(key, publicUrl) {
    if (!confirm('Delete this background?')) return
    const res = await fetch('/api/admin/backgrounds/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    })
    if (!res.ok) {
      const { error } = await res.json()
      return alert('Delete failed: ' + error)
    }
    // remove locally
    setBackgrounds((bgs) => bgs.filter((b) => b.key !== key))
    // if it was the active, clear it
    if (publicUrl === activeBg) {
      setActiveBg('')
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'background_image', value: '' })
      })
    }
  }

  if (loading) return <p className="p-6 text-center">Loading admin…</p>

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-gray-50 text-dark-green font-sans">
      <h1 className="text-2xl font-bold">Golf Pool Admin</h1>

      <section>
        <h2 className="font-semibold">Form Title</h2>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={formTitle}
          onChange={e => setFormTitle(e.target.value)}
        />
        <button
          onClick={() => save('form_title', formTitle)}
          className="mt-2 bg-dark-green text-white px-4 py-2 rounded"
        >
          Save Title
        </button>
      </section>

      <section>
        <h2 className="font-semibold">Rules Text</h2>
        <div className="border rounded overflow-hidden">
          <ReactQuill
            theme="snow"
            value={rules}
            onChange={setRules}
            modules={{
              toolbar: [
                [ { size: ['8px','10px','12px','14px','16px','18px','20px','22px','24px','28px','32px','36px','48px'] } ],
                ['bold','italic','underline','strike'],
                [ { color:[] }, { background:[] } ],
                [ { list:'ordered' },{ list:'bullet' } ],
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
          onClick={() => save('rules', rules)}
          className="mt-2 bg-dark-green text-white px-4 py-2 rounded"
        >
          Save Rules
        </button>
      </section>

      <section>
        <h2 className="font-semibold">Background Images</h2>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept="image/*"
            onChange={e => setBgFile(e.target.files?.[0])}
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
            <div key={key} className="relative cursor-pointer border p-2 rounded">
              {/* DELETE button */}
              <button
                onClick={() => deleteBackground(key, publicUrl)}
                className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                title="Delete"
              >
                🗑
              </button>

              <img
                src={publicUrl}
                alt=""
                className="h-24 w-full object-cover rounded"
              />

              <label className="mt-1 flex items-center">
                <input
                  type="radio"
                  name="activeBg"
                  value={publicUrl}
                  checked={activeBg === publicUrl}
                  onChange={async () => {
                    setActiveBg(publicUrl)
                    await fetch('/api/admin/settings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        key: 'background_image',
                        value: publicUrl
                      })
                    })
                  }}
                />
                <span className="ml-2 truncate">{key}</span>
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
