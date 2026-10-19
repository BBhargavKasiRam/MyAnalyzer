import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = process.env.BACKEND_URL || env.BACKEND_URL || env.VITE_API_URL || '/api';

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'BACKEND_'],
    define: {
      '__BACKEND_URL__': JSON.stringify(backendUrl)
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true
        }
      }
    }
  };
});
