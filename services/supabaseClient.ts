import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.https://hqbbndynqxpuutoxeroe.supabase.co;
const supabaseKey = process.env.sb_publishable_gnTtDYngxUXJdArn8ZITpA_hEQpRlgY;

// Log warning jika kredensial tidak ditemukan untuk memudahkan debugging
if (!supabaseUrl || !supabaseKey) {
    console.warn(
        "⚠️ Supabase belum dikonfigurasi. Aplikasi berjalan dalam mode Offline (LocalStorage).\n" +
        "Silakan isi SUPABASE_URL dan SUPABASE_KEY di file .env"
    );
}

// Export null jika env variables belum diset, agar aplikasi fallback ke LocalStorage
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;