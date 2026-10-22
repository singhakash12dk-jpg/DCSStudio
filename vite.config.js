import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const customDomainBuild = process.env.GITHUB_PAGES_CUSTOM_DOMAIN === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.NETLIFY === 'true' || customDomainBuild ? '/' : `/${repositoryName || 'dreamcatchers'}/`,
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Increase warning limit to avoid noisy warnings for larger chunks
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // More robust chunking: extract package name from node_modules path
        manualChunks(id) {
          if (!id || !id.includes('node_modules')) return;
          const parts = id.split('node_modules/').pop().split('/');
          const pkg = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];

          // Group very large ecosystems together
          if (pkg === 'react' || pkg === 'react-dom') return 'vendor_react';
          if (pkg === 'three' || pkg === 'postprocessing') return 'vendor_three';
          if (pkg.startsWith('@react-three')) return 'vendor_r3';
          if (pkg === 'gsap') return 'vendor_gsap';
          if (pkg.includes('emailjs')) return 'vendor_emailjs';

          // Default: create a vendor chunk per package to improve cacheability
          return `vendor_${pkg.replace('@', '').replace('/', '_')}`;
        }
      }
    }
  }
})
