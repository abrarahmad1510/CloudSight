import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@apollo/client/core',
      '@apollo/client/react',
      '@apollo/client/cache',
      '@apollo/client/link/http',
      'graphql'
    ],
    esbuildOptions: {
      // Apollo Client 4.0.7 needs this for proper ESM resolution
      mainFields: ['module', 'main'],
      target: 'es2020'
    },
  },
  server: {
    port: 3000
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      external: []
    }
  },
  resolve: {
    // Force ESM resolution for Apollo
    mainFields: ['module', 'main']
  }
});
