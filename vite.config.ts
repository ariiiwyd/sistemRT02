import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // Polyfill process.env agar tidak error "process is not defined" di browser
      // dan menyuntikkan API_KEY dari environment variable server/Vercel
      'process.env': JSON.stringify({
        API_KEY: env.API_KEY || ''
      })
    }
  };
});