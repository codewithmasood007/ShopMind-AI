import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import flowbitePlugin from "flowbite/plugin"

export default defineConfig({
  plugins: [
    tailwindcss(),
    [flowbitePlugin]

  ],
  server:{
    proxy:{
      "/api/": "http://localhost:5000",
    }
  }
})