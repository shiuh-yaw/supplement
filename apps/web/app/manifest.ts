import type { MetadataRoute } from "next";
import { APP_NAME, TAGLINE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} — ${TAGLINE}`,
    short_name: APP_NAME,
    description: "Brand-neutral, safety-first supplement guidance for Southeast Asia.",
    start_url: "/check",
    display: "standalone",
    background_color: "#f7faf9",
    theme_color: "#0f8a68",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
