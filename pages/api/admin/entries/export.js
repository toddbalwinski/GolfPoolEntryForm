import { supabaseAdmin } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  const { data: entries, error: entryErr } = await supabaseAdmin
    .from('entries')
    .select('first_name,last_name,email,entry_name,picks,created_at')
    .order('created_at', { ascending: false });
  if (entryErr) {
    console.error('Error fetching entries:', entryErr);
    return res.status(500).json({ error: entryErr.message });
  }

  const { data: golfers, error: golferErr } = await supabaseAdmin
    .from('golfers')
    .select('id,name,salary');
  if (golferErr) {
    console.error('Error fetching golfers:', golferErr);
    return res.status(500).json({ error: golferErr.message });
  }
  const golferMap = Object.fromEntries(
    golfers.map((g) => [String(g.id), { name: g.name, salary: g.salary }])
  );

  const headerCols = [
    'First',
    'Last',
    'Email',
    'Entry',
    ...[1, 2, 3, 4, 5, 6].flatMap((i) => [`Golfer ${i}`, `Salary ${i}`]),
    'Total Salary',
    'Timestamp',
  ];
  const header = headerCols.join(',');

  const rows = entries.map((e) => {
    const row = [e.first_name, e.last_name, e.email, e.entry_name];

    let total = 0;
    for (let i = 0; i < 6; i++) {
      const pid = e.picks?.[i];
      if (pid && golferMap[pid]) {
        const info = golferMap[pid];
        row.push(info.name, info.salary);
        total += info.salary;
      } else {
        row.push('', '');
      }
    }

    row.push(total, e.created_at);

    return row.join(',');
  });

  const csv = [header, ...rows].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="golf-pool-entries.csv"'
  );
  return res.status(200).send(csv);
}