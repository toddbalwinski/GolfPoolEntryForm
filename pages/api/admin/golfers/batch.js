import { supabaseAdmin } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).end();

  const { golfers } = req.body;
  if (!Array.isArray(golfers) || golfers.length === 0) {
    return res.status(400).json({ error: 'No golfers provided' });
  }

  const { error: insErr } = await supabaseAdmin
    .from('golfers')
    .insert(golfers);
  if (insErr) {
    return res.status(500).json({ error: insErr.message });
  }

  const { data: allGolfers, error: selErr } = await supabaseAdmin
    .from('golfers')
    .select('*')
    .order('id', { ascending: true });
  if (selErr) {
    return res.status(500).json({ error: selErr.message });
  }

  return res.status(200).json({ golfers: allGolfers });
}