import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('golfers')
      .select('*')
      .order('id', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ golfers: data });
  }

  if (req.method === 'POST') {
    const { name, salary } = req.body;
    if (!name || typeof salary !== 'number') {
      return res.status(400).json({ error: 'Missing name or salary' });
    }

    const { data, error } = await supabaseAdmin
      .from('golfers')
      .insert([{ name, salary }])
      .select('id,name,salary')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ golfer: data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const { error } = await supabaseAdmin
      .from('golfers')
      .delete()
      .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}