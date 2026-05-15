import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 在开发模式下使用根路径，生产模式使用仓库名作为基础路径
  const base = mode === 'production' ? '/FkWeChat_Plugin/' : '/';
  
  return {
    base,
    build: {
      sourcemap: 'hidden',
      outDir: 'dist',
    },
    plugins: [
      react(),
      tsconfigPaths()
    ],
  }
})
