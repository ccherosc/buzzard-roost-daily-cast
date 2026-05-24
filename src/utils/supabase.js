// src/utils/supabase.js
// Supabase client singleton. Reads credentials from Vite env vars.
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env (local)
// and in the Cloudflare Pages dashboard (production) under Environment Variables.
// If either is missing the client is null — all leaderboard calls silently no-op.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnon)
  ? createClient(supabaseUrl, supabaseAnon)
  : null;
