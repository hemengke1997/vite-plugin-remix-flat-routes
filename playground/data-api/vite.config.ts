import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { publicTypescript } from 'vite-plugin-public-typescript'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    publicTypescript(),
    remixFlatRoutes({
      flatRoutesOptions: {
        ignoredRouteFiles: ['**/components/**', '**/hooks/**', '**/contexts/**'],
      },
    }),
  ],
})
