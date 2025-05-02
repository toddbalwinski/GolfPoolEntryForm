// pages/api/admin/backgrounds/index.js
import { supabaseAdmin } from '../../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ error: `Method ${req.method} Not Allowed` })
  }

  // 1) List all files in your "backgrounds" bucket
  const { data: files, error: listErr } = await supabaseAdmin
    .storage
    .from('backgrounds')
    .list('', { sortBy: { column: 'name', order: 'desc' } })

  if (listErr) {
    console.error('Backgrounds list error:', listErr)
    return res.status(500).json({ error: listErr.message })
  }

  // 2) Turn each filename into a public URL
  const backgrounds = files.map((f) => {
    const { data } = supabaseAdmin
      .storage
      .from('backgrounds')
      .getPublicUrl(f.name)
    return {
      key: f.name,
      publicUrl: data.publicUrl   // <-- note data.publicUrl, not publicURL
    }
  })

  // 3) Return as JSON
  res.status(200).json({ backgrounds })
}
