import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).send(error.message);

  const header = ['First','Last','Email','Entry','Picks','Created'].join(',');
  const rows = data.map(r => [
    r.first_name,
    r.last_name,
    r.email,
    r.entry_name,
    `"${r.picks.join(';')}"`,
    r.created_at
  ].join(','));

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="entries.csv"');
  res.send([header, ...rows].join('\n'));
}