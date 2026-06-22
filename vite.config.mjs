import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    server: {
      host: true,
      port: Number(env.VITE_PORT) || 3000
    },
    preview: {
      host: true
    },
    plugins: [react(), jsconfigPaths()]
  };
});
