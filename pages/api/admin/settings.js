// pages/api/admin/settings.js
import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('settings').select('*');
    if (error) return res.status(500).json({ error: error.message });
    // return as key→value map
    const settings = Object.fromEntries(data.map((r) => [r.key, r.value]));
    return res.status(200).json({ settings });
  }

  if (req.method === 'POST') {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'Missing key' });
    const { error } = await supabaseAdmin
      .from('settings')
      .upsert([{ key, value }], { onConflict: 'key' });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
