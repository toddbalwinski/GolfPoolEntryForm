import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).end();

  const { first, last, email, entryName, picks } = req.body;

  // server‑side check
  if (!first || !last || picks?.length !== 6) {
    return res.status(400).json({ error: 'Invalid payload.' });
  }
  // (you could re‑compute salary cap here if needed)

  const { error } = await supabase
    .from('entries')
    .insert([{ first_name: first, last_name: last, email, entry_name: entryName, picks }]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true });
}