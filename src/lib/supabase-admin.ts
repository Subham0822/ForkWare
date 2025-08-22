import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service role key for administrative operations.
// Do NOT import this in any client component. This must only be used on the server.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});


