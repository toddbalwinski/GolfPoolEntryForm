import { supabaseAdmin } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { error } = await supabaseAdmin
      .from('golfers')
      .delete()
      .gt('id', 0);

    if (error) {
      console.error('Failed to clear golfers:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}