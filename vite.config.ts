import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Ambil Variable dari System Environment (Vercel) ATAU file .env (Local)
  const apiKey = process.env.API_KEY || env.API_KEY || '';
  const supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_KEY || env.SUPABASE_KEY || '';

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // PERBAIKAN: Replace process.env dengan nilai string spesifik saat build
      // Ini penting karena di browser 'process.env' tidak ada.
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.SUPABASE_KEY': JSON.stringify(supabaseKey)
    }
  };
});