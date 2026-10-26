import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "favicon.ico",
        "icons/*.svg",
        "icons/*.png",
        "assets/*.png",
      ],
      manifest: {
        name: "किसान सहयोग — KisaanSahyog",
        short_name: "KisaanSahyog",
        description: "किसानों और खरीदारों के लिए सीधा बाज़ार एवं कृषि सलाह",
        theme_color: "#4A2C17",
        background_color: "#FAF6EE",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
          {
            src: "/icons/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            // Cache-First for Google Fonts & static icons
            urlPattern: ({ url }) =>
              url.origin.includes("fonts.googleapis.com") ||
              url.origin.includes("fonts.gstatic.com") ||
              url.pathname.startsWith("/icons/") ||
              url.pathname.endsWith(".woff2"),
            handler: "CacheFirst",
            options: {
              cacheName: "kisaan-static-assets",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
            },
          },
          {
            // Network-First with 2-second timeout for API routes, falling back to cache
            urlPattern: ({ url }) =>
              url.pathname.startsWith("/api/listings") ||
              url.pathname.startsWith("/api/offers") ||
              url.pathname.startsWith("/api/telemetry/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "kisaan-api-cache",
              networkTimeoutSeconds: 2,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 1 Day
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
