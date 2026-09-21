import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ALPHSON360 — Alphason International School",
    short_name: "ALPHSON360",
    description: "School management system for Alphason International School, Oduman, Accra.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0c4a6e",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
