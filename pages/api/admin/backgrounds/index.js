// pages/api/admin/backgrounds/index.js
import { supabaseAdmin } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  // list up to 100 files, sorted newest first
  const { data, error } = await supabaseAdmin
    .storage
    .from('backgrounds')
    .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  // build public URLs
  const backgrounds = data.map((f) => {
    const { publicUrl } = supabaseAdmin
      .storage
      .from('backgrounds')
      .getPublicUrl(f.name);
    return { key: f.name, publicUrl };
  });

  res.status(200).json({ backgrounds });
}
