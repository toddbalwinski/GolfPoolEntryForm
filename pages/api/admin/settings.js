// pages/api/admin/settings.js
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  // Only allow GET & POST
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('key, value')
    if (error) {
      return res.status(500).json({ error: error.message })
    }
    // Turn array of { key, value } into an object map
    const map = data.reduce((o, { key, value }) => {
      o[key] = value
      return o
    }, {})
    return res.status(200).json({ settings: map })
  }

  if (req.method === 'POST') {
    const { key, value } = req.body
    if (typeof key !== 'string' || typeof value !== 'string') {
      return res.status(400).json({ error: 'Invalid payload' })
    }
    const { error } = await supabaseAdmin
      .from('settings')
      .upsert({ key, value })
    if (error) {
      return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ updated: true })
  }

  res.setHeader('Allow', ['GET','POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
