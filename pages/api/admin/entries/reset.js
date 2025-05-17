import { supabaseAdmin } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { error } = await supabaseAdmin
      .from('entries')
      .delete()
      .gt('id', 0);

    if (error) {
      console.error('Failed to clear entries:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', 'POST');
  res.status(405).end('Method Not Allowed');
}