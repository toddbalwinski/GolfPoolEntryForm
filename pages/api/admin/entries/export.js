// pages/api/admin/entries/export.js
import { supabaseAdmin } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  // 1) Fetch all entries
  const { data: entries, error: entryErr } = await supabaseAdmin
    .from('entries')
    .select('id, first_name, last_name, email, entry_name, picks, created_at')
    .order('created_at', { ascending: false });
  if (entryErr) {
    console.error('Error fetching entries:', entryErr);
    return res.status(500).json({ error: entryErr.message });
  }

  // 2) Collect all unique golfer IDs across all entries
  const allPickIds = Array.from(
    new Set(entries.flatMap((e) => e.picks || []))
  );

  // 3) Fetch those golfers in one go
  const { data: golfers, error: golferErr } = await supabaseAdmin
    .from('golfers')
    .select('id, name, salary');
  if (golferErr) {
    console.error('Error fetching golfers:', golferErr);
    return res.status(500).json({ error: golferErr.message });
  }

  // Build a map: id → { name, salary }
  const golferMap = Object.fromEntries(
    golfers.map((g) => [String(g.id), { name: g.name, salary: g.salary }])
  );

  // 4) Build CSV
  // Header row
  const header = [
    'First',
    'Last',
    'Email',
    'Entry',
    // dynamically Golfer 1, Salary 1 ... Golfer 6, Salary 6
    ...[1, 2, 3, 4, 5, 6].flatMap((i) => [`Golfer ${i}`, `Salary ${i}`]),
    'Timestamp',
  ].join(',');

  // Data rows
  const rows = entries.map((e) => {
    // For each of the 6 picks, pull name & salary (or leave empty)
    const pickColumns = (e.picks || []).slice(0, 6).map((pid) => {
      const info = golferMap[String(pid)] || { name: '', salary: '' };
      // escape any quotes
      const n = String(info.name).replace(/"/g, '""');
      const s = String(info.salary).replace(/"/g, '""');
      return `"${n}","${s}"`;
    });
    // If fewer than 6 picks, pad out the columns
    while (pickColumns.length < 6) {
      pickColumns.push('"",""');
    }

    // Now pull the rest of the fields
    const fields = [
      e.first_name,
      e.last_name,
      e.email,
      e.entry_name,
      // already quoted pickColumns
      ...pickColumns,
      e.created_at,
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`);

    return fields.join(',');
  });

  const csv = [header, ...rows].join('\r\n');

  // 5) Send CSV
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="golf-pool-entries.csv"'
  );
  res.status(200).send(csv);
}
