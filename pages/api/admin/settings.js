// pages/api/admin/settings.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
    if (error) return res.status(500).json({ error: error.message })
    // return as an object map
    const map = data.reduce((acc, { key, value }) => {
      acc[key] = value
      return acc
    }, {})
    return res.status(200).json({ settings: map })
  }

  if (req.method === 'POST') {
    const { key, value } = req.body
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ updated: true })
  }

  res.setHeader('Allow', ['GET','POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
