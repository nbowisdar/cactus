import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), sitemap(), icon()],
  adapter: vercel(),
  output: "server",
  vite: {
    plugins: [tailwindcss()],
  },
  site: "https://nbowisdar.github.io/cactus/",
  // base: "/cactus",
});
