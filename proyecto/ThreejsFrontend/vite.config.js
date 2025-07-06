import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Configuración del servidor para permitir cámara en desarrollo
  server: {
    https: false, // Podemos usar HTTP con configuración especial
    host: 'localhost',
    port: 5173,
    // Configuración especial para MediaDevices en desarrollo
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    }
  },
  
  // Optimizaciones de build
  build: {
    target: 'esnext',
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'three-fiber': ['@react-three/fiber', '@react-three/drei'],
          'router': ['react-router-dom'],
          'animations': ['gsap']
        }
      }
    }
  },
  
  // Optimizaciones de desarrollo
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'gsap'],
    exclude: ['lucide-react']
  }
})
