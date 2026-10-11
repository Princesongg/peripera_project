import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, isPreview }) => ({
  base: !process.env.VERCEL && (command === 'build' || isPreview) ? '/peripera_project/' : '/',
  plugins: [react()],
}))
