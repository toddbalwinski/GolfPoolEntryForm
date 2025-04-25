// pages/api/admin/golfers/batch.js
import { supabaseAdmin } from '../../../../lib/supabase';

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).end();

  const { golfers } = req.body;
  if (!Array.isArray(golfers) || golfers.length === 0) {
    return res.status(400).json({ error: 'No golfers provided' });
  }

  // Validate entries
  for (let g of golfers) {
    if (typeof g.name !== 'string' || typeof g.salary !== 'number') {
      return res.status(400).json({ error: 'Invalid format' });
    }
  }

  // Bulk insert
  const { error, data } = await supabaseAdmin
    .from('golfers')
    .insert(golfers);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ golfers: data });
}
