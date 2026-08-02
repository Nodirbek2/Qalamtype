import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://kaxqvpgbrqrxxknzhuip.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtheHF2cGdicnFyeHhrbnpodWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2ODAzOTAsImV4cCI6MjEwMTI1NjM5MH0.OQdmYEp2paJ2GVi-ZNve76Uv3z0kWd_Y54UdwYQz6kM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')
);
