import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL ou Service Role Key ausentes no .env do servidor.');
}

// Cliente Supabase "Admin" que sobrepõe RLS apenas para chamadas controladas pelo backend
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
