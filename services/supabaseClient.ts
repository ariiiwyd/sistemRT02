import { createClient } from '@supabase/supabase-js';

// PERBAIKAN: Gunakan nama variabel environment, bukan nilainya langsung
const supabaseUrl = process.env.SUPABASE_URL;https://hqbbndynqxpuutoxeroe.supabase.co
const supabaseKey = process.env.SUPABASE_KEY;sb_publishable_gnTtDYngxUXJdArn8ZITpA_hEQpRlgY

// Log warning jika kredensial tidak ditemukan untuk memudahkan debugging
if (!supabaseUrl || !supabaseKey) {
    console.warn(
        "⚠️ Supabase belum dikonfigurasi. Aplikasi berjalan dalam mode Offline (LocalStorage).\n" +
        "Silakan isi SUPABASE_URL dan SUPABASE_KEY di file .env atau Environment Variables Vercel."
    );
}

// Export null jika env variables belum diset, agar aplikasi fallback ke LocalStorage
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;