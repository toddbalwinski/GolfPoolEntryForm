import { supabaseAdmin } from '../../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ error: `Method ${req.method} Not Allowed` })
  }

  const { data: files, error: listErr } = await supabaseAdmin
    .storage
    .from('backgrounds')
    .list('', { sortBy: { column: 'name', order: 'desc' } })

  if (listErr) {
    console.error('Backgrounds list error:', listErr)
    return res.status(500).json({ error: listErr.message })
  }

  const backgrounds = files.map((f) => {
    const { data } = supabaseAdmin
      .storage
      .from('backgrounds')
      .getPublicUrl(f.name)
    return {
      key: f.name,
      publicUrl: data.publicUrl
    }
  })

  res.status(200).json({ backgrounds })
}
