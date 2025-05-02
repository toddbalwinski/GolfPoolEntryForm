// pages/api/admin/backgrounds/index.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'GET only' })
  }
  // list files in the "backgrounds" bucket
  const { data: files, error } = await supabase
    .storage
    .from('backgrounds')
    .list('', { sortBy: { column: 'name', order: 'desc' } })

  if (error) return res.status(500).json({ error: error.message })

  // turn each into { key, publicUrl }
  const publicUrls = files.map((f) => {
    const { publicURL } = supabase
      .storage
      .from('backgrounds')
      .getPublicUrl(f.name)
    return { key: f.name, publicUrl: publicURL }
  })

  res.status(200).json({ backgrounds: publicUrls })
}
