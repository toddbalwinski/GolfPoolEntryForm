import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('key, value')
    if (error) return res.status(500).json({ error: error.message })
    const settings = Object.fromEntries(data.map(({ key, value }) => [key, value]))
    return res.status(200).json({ settings })
  }

  if (req.method === 'POST') {
    const { key, value } = req.body
    const { error } = await supabaseAdmin
      .from('settings')
      .upsert({ key, value })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ updated: true })
  }

  res.setHeader('Allow', ['GET','POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}