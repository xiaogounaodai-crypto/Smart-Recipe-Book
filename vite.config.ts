import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // 👈 强制使用相对路径，解决 404
  build: {
    rollupOptions: {
      input: './index.html', // 👈 明确告诉它入口在这里
    },
  }
});
