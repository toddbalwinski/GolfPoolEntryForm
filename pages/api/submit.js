import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { first, last, email, entryName, picks } = req.body;

  const { data: golferRows, error: gErr } = await supabase
    .from('golfers')
    .select('id,salary')
    .in('id', picks);
  if (gErr) return res.status(500).json({ error: gErr.message });

  const totalSalary = golferRows.reduce((sum, g) => sum + g.salary, 0);
  if (picks.length !== 6 || totalSalary > 100) {
    return res.status(400).json({ error: 'Invalid picks' });
  }

  const { error: iErr } = await supabase.from('entries').insert([
    {
      first_name: first,
      last_name: last,
      email,
      entry_name: entryName,
      picks,
    },
  ]);
  if (iErr) return res.status(500).json({ error: iErr.message });

  res.status(200).json({ success: true });
}