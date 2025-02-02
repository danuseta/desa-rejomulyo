import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Tambahkan import untuk path

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias "@" untuk folder src
    },
  },
});
