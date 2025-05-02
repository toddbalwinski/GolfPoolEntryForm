// pages/api/admin/backgrounds/index.js
import { supabaseAdmin } from '../../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'GET only' })
  }

  const { data: files, error } = await supabaseAdmin
    .storage
    .from('backgrounds')
    .list('', { sortBy: { column: 'name', order: 'desc' } })

  if (error) return res.status(500).json({ error: error.message })

  const backgrounds = files.map((f) => {
    const { publicURL } = supabaseAdmin
      .storage
      .from('backgrounds')
      .getPublicUrl(f.name)
    return { key: f.name, publicUrl: publicURL }
  })

  res.status(200).json({ backgrounds })
}
