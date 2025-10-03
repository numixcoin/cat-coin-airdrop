
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/process-airdrop': {
        target: 'https://xiksowpacdzrzojugaii.supabase.co/functions/v1/process-airdrop',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/process-airdrop/, ''),
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpa3Nvd3BhY2R6cnpvanVnYWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMzUzMjksImV4cCI6MjA2NDkxMTMyOX0.URPVTEGW7XRG6Oh1WzTCVZMPDAptE-4EDCjvTsW3oDQ'
        }
      }
    }
  },
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
  },
}));
