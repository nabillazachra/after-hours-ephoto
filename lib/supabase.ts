import { createClient } from '@supabase/supabase-js';

// --- CREDENTIALS ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
// -----------------------------

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL ERROR: Supabase Credentials are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_KEY in your .env file or Zeabur environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Test connection automatically
(async () => {
  try {
    const { data, error } = await supabase.from('templates').select('count', { count: 'exact', head: true });
    if (error) console.error('Supabase Connection Test Failed:', error.message);
    else console.log('✅ Supabase Connected Successfully!');
  } catch (err) {
    console.error('Supabase Connection Error:', err);
  }
})();