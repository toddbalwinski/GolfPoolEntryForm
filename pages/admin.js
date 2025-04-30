// pages/admin.js
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import Papa from 'papaparse';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function Admin() {
  const [rules, setRules]             = useState('');
  const [golfers, setGolfers]         = useState([]);
  const [newGf, setNewGf]             = useState({ name: '', salary: '' });
  const [backgrounds, setBackgrounds] = useState([]);
  const [activeBg, setActiveBg]       = useState('');
  const [bgFile, setBgFile]           = useState(null);

  const [loading, setLoading]         = useState(true);
  const [csvUploading, setCsvUploading] = useState(false);
  const [uploadingBg, setUploadingBg]   = useState(false);

  useEffect(() => {
    async function loadAll() {
      // 1) Settings: rules + active background
      const stRes = await fetch('/api/admin/settings');
      const { settings } = await stRes.json();
      setRules(settings.rules || '');
      setActiveBg(settings.background_image || '');

      // 2) Golfers
      const gfRes = await fetch('/api/admin/golfers');
      const { golfers: gfData } = await gfRes.json();
      setGolfers(gfData || []);

      // 3) Background list
      const bgRes = await fetch('/api/admin/backgrounds');
      const { backgrounds: bgList } = await bgRes.json();
      setBackgrounds(bgList || []);

      setLoading(false);
    }
    loadAll();
  }, []);

  // Save rules HTML
  const saveRules = async () => {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'rules', value: rules }),
    });
    alert('Rules saved');
  };

  // Single‐golfer add/delete
  const addGolfer = async () => {
    const salaryInt = parseInt(newGf.salary, 10);
    if (!newGf.name || isNaN(salaryInt)) {
      return alert('Enter a name and numeric salary');
    }
    await fetch('/api/admin/golfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newGf.name, salary: salaryInt }),
    });
    const { golfers: updated } = await (await fetch('/api/admin/golfers')).json();
    setGolfers(updated || []);
    setNewGf({ name: '', salary: '' });
  };

  const deleteGolfer = async (id) => {
    if (!confirm(`Delete golfer #${id}?`)) return;
    await fetch(`/api/admin/golfers?id=${id}`, { method: 'DELETE' });
    setGolfers(golfers.filter((g) => g.id !== id));
  };

  // Batch CSV upload
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: async (results) => {
        if (!results || !Array.isArray(results.data)) {
          return alert('CSV parse failed');
        }
        const batch = results.data
          .map((row) => ({
            name: row[0]?.trim(),
            salary: parseInt(row[1], 10),
          }))
          .filter((g) => g.name && !isNaN(g.salary));
        if (batch.length === 0) {
          return alert('No valid rows');
        }
        setCsvUploading(true);
        const res = await fetch('/api/admin/golfers/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ golfers: batch }),
        });
        setCsvUploading(false);
        if (!res.ok) {
          const { error } = await res.json();
          return alert('Upload failed: ' + error);
        }
        const { golfers: newList } = await res.json();
        setGolfers(newList || []);
        alert(`Imported ${batch.length}`);
      },
    });
  };

  // Clear all entries
  const clearEntries = async () => {
    if (!confirm('Clear all entries?')) return;
    const res = await fetch('/api/admin/entries/reset', { method: 'POST' });
    if (!res.ok) {
      const { error } = await res.json();
      return alert('Entries clear failed: ' + error);
    }
    alert('Entries cleared');
  };

  // Clear all golfers
  const clearGolfers = async () => {
    if (!confirm('Delete ALL golfers?')) return;
    const res = await fetch('/api/admin/golfers/reset', { method: 'POST' });
    if (!res.ok) {
      const { error } = await res.json();
      return alert('Failed to clear golfers: ' + error);
    }
    setGolfers([]);
    alert('Golfers cleared');
  };

  // Upload a new background image
  const uploadBg = async () => {
    if (!bgFile) return alert('Select an image first');
    setUploadingBg(true);
    const form = new FormData();
    form.append('image', bgFile);
    const res = await fetch('/api/admin/backgrounds/upload', {
      method: 'POST',
      body: form,
    });
    setUploadingBg(false);
    if (!res.ok) {
      const { error } = await res.json();
      return alert('Upload failed: ' + error);
    }
    const { key, publicUrl } = await res.json();
    setBackgrounds([{ key, publicUrl }, ...backgrounds]);
    setBgFile(null);
  };

  // Save the selected background to settings
  const saveBgSelection = async () => {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'background_image', value: activeBg }),
    });
    alert('Background updated');
  };

  if (loading) {
    return <p className="p-6 text-center">Loading admin…</p>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 font-sans text-dark-green">
      <h1 className="text-2xl font-bold">🏌️‍♂️ Golf Pool Admin</h1>

      {/* Rules */}
      <section className="space-y-2">
        <h2 className="font-semibold">Rules Text</h2>
        <div className="border border-dark-green/50 rounded-lg overflow-hidden">
          <ReactQuill
            theme="snow"
            value={rules}
            onChange={setRules}
            modules={{
              toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'clean'],
              ],
            }}
          />
        </div>
        <button
          onClick={saveRules}
          className="bg-dark-green text-white px-4 py-2 rounded-lg"
        >
          Save Rules
        </button>
      </section>

      {/* Batch CSV */}
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

      {/* Golfers Table */}
      <section className="space-y-4">
        <h2 className="font-semibold">Golfers</h2>
        {golfers.length > 0 ? (
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
                  <td className="border px-3 py-1">{g.salary}</td>
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

        {/* Add Golfer */}
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
            inputMode="numeric"
            pattern="\d*"
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

      {/* Clear buttons */}
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

        {/* Upload */}
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

        {/* Gallery */}
        <div className="grid grid-cols-3 gap-4">
          {backgrounds.map((bg) => (
            <label
              key={bg.key}
              className="border p-2 rounded cursor-pointer"
            >
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
  );
}
