import { createClient } from '@supabase/supabase-js';

// Public client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// Server‑only client
let _supabaseAdmin = null;
if (typeof window === 'undefined') {
  _supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export const supabaseAdmin = _supabaseAdmin;