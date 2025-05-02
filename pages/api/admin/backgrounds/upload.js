// pages/api/admin/backgrounds/upload.js
import nextConnect from 'next-connect'
import multer from 'multer'
import { supabaseAdmin } from '../../../../lib/supabase'

const upload = multer({ storage: multer.memoryStorage() })
const handler = nextConnect()

handler.use(upload.single('image'))

handler.post(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' })

  const key = `${Date.now()}_${req.file.originalname}`
  const { error: upErr } = await supabaseAdmin
    .storage
    .from('backgrounds')
    .upload(key, req.file.buffer, { contentType: req.file.mimetype })

  if (upErr) return res.status(500).json({ error: upErr.message })

  const { publicURL } = supabaseAdmin
    .storage
    .from('backgrounds')
    .getPublicUrl(key)

  res.status(200).json({ key, publicUrl: publicURL })
})

export const config = { api: { bodyParser: false } }
export default handler
