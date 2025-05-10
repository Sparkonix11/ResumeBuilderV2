import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('Build mode:', mode)
  console.log('API URL env value:', env.VITE_API_URL)
  
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    base: mode === 'production' ? '/ResumeBuilderV2/' : '/',
    define: {
      // Explicitly replace import.meta.env variables in the build
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://34.131.189.51:5000/api')
    }
  }
})
