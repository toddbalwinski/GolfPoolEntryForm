// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Public (browser) client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

// // Server‑only client
// let _supabaseAdmin = null;
// if (typeof window === 'undefined') {
//   // This code path only runs on the server (e.g. in API routes)
//   _supabaseAdmin = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.SUPABASE_SERVICE_ROLE_KEY
//   );
// }
// export const supabaseAdmin = _supabaseAdmin;
