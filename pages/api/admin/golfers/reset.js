// pages/api/admin/golfers/reset.js
import { supabaseAdmin } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // delete every row in golfers
    const { error } = await supabaseAdmin.from('golfers').delete();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }
  res.status(405).end();
}
