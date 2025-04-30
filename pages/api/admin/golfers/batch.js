// pages/api/admin/golfers/batch.js
import { supabaseAdmin } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).end();

  const { golfers } = req.body;
  if (!Array.isArray(golfers) || golfers.length === 0) {
    return res.status(400).json({ error: 'No golfers provided' });
  }

  // 1) Insert the batch
  const { error: insErr } = await supabaseAdmin
    .from('golfers')
    .insert(golfers);
  if (insErr) {
    return res.status(500).json({ error: insErr.message });
  }

  // 2) Fetch the _complete_ updated list
  const { data: allGolfers, error: selErr } = await supabaseAdmin
    .from('golfers')
    .select('*')
    .order('id', { ascending: true });
  if (selErr) {
    return res.status(500).json({ error: selErr.message });
  }

  // 3) Return that full list
  return res.status(200).json({ golfers: allGolfers });
}
