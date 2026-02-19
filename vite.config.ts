import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Parameter ketiga '' memastikan semua variable (termasuk yang tidak berawalan VITE_) dimuat dari file .env
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // CRITICAL FIX: Prioritaskan process.env.API_KEY (System Env)
  // loadEnv hanya membaca file .env. Di Vercel/Cloud, variable ada di process.env saat build time.
  const apiKey = process.env.API_KEY || env.API_KEY || '';

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // Polyfill 'process.env' agar kode client-side bisa mengakses API_KEY
      // Nilai ini akan di-replace secara statis saat build menjadi object JSON
      'process.env': JSON.stringify({
        API_KEY: apiKey
      })
    }
  };
});