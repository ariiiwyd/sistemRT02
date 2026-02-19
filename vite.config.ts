import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Ambil API KEY dari System Environment (Vercel) ATAU file .env (Local)
  const apiKey = process.env.API_KEY || env.API_KEY || '';

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // PERBAIKAN: Jangan replace 'process.env' (objek utuh), tapi replace spesifik key-nya.
      // Ini memastikan saat build, kode `process.env.API_KEY` diubah menjadi string "AIzaSy..."
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  };
});