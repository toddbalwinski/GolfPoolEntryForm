import { supabaseAdmin } from '../../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res
      .status(405)
      .json({ error: `Method ${req.method} Not Allowed` })
  }

  const { key } = req.body
  if (!key) {
    return res.status(400).json({ error: 'Missing "key" in request body' })
  }

  const { error } = await supabaseAdmin
    .storage
    .from('backgrounds')
    .remove([key])

  if (error) {
    console.error('Error deleting background:', error)
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json({ deleted: true })
}