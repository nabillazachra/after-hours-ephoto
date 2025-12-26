import { createClient } from '@supabase/supabase-js';

// --- CREDENTIALS (UPDATED) ---
// Pastikan tidak ada spasi di awal/akhir string
const supabaseUrl = 'https://uccfqmrtdalbheiwggiu.supabase.co';
const supabaseKey = 'sb_publishable_mrTEzJTRF0xn-J49DuJ7nw_6-Jghw_-';
// -----------------------------

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('PASTE_') || supabaseKey.includes('PASTE_')) {
  console.error('CRITICAL ERROR: Supabase Credentials are missing inside src/lib/supabase.ts');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

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