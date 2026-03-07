import { createClient } from '@supabase/supabase-js'

// Server-only client with service role (bypasses RLS)
// NEVER expose this to the browser
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
