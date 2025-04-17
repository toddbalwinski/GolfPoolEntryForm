import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  // (_you could protect this with a simple token in ?key=…_)
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).send(error.message);

  // build CSV
  const header = ['First','Last','Email','Entry','Golfers','Created'].join(',');
  const rows = data.map(r => [
    r.first_name,
    r.last_name,
    r.email,
    r.entry_name,
    `"${r.Golfers.join(';')}"`,
    r.created_at
  ].join(','));

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="entries.csv"');
  res.send([header, ...rows].join('\n'));
}