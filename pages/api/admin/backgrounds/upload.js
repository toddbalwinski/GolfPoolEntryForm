// pages/api/admin/backgrounds/upload.js
import { supabaseAdmin } from '../../../../lib/supabase';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // parse the multipart form
  const form = new formidable.IncomingForm();
  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => err ? reject(err) : resolve({ fields, files }));
  });

  if (!files.image) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const file = files.image;
  // read file buffer
  const buffer = fs.readFileSync(file.filepath);
  // choose a key: timestamp + original name
  const key = `${Date.now()}-${file.originalFilename}`;

  // upload to Supabase Storage
  const { error: upErr } = await supabaseAdmin
    .storage
    .from('backgrounds')
    .upload(key, buffer, { contentType: file.mimetype });

  if (upErr) {
    console.error(upErr);
    return res.status(500).json({ error: upErr.message });
  }

  // get the public URL
  const { data: { publicUrl } } = supabaseAdmin
    .storage
    .from('backgrounds')
    .getPublicUrl(key);

  // return the key+URL
  res.status(200).json({ key, publicUrl });
}
