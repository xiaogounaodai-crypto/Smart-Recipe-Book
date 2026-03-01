import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', 
  root: './', // 👈 告诉 Vite：根目录就是代码所在处
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html'
    }
  }
});
