// pages/api/admin/entries/export.js
import { supabaseAdmin } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  // fetch all entries
  const { data: entries, error } = await supabaseAdmin
    .from('entries')
    .select('first_name,last_name,email,entry_name,picks,created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching entries:', error);
    return res.status(500).json({ error: error.message });
  }

  // build CSV lines
  const header = ['First','Last','Email','Entry','Picks','Timestamp'].join(',');
  const rows = entries.map(e => {
    // wrap the array-of-picks in quotes so commas don’t break
    const picks = `"${e.picks.join(';')}"`;
    return [e.first_name, e.last_name, e.email, e.entry_name, picks, e.created_at]
      .map(v => `"${String(v).replace(/"/g,'""')}"`)
      .join(',');
  });

  const csv = [header, ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="golf-pool-entries.csv"'
  );
  res.send(csv);
}
