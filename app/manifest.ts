import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Alt-TXT",
    short_name: "Alt-TXT",
    description:
      "An intelligence lab that redesigns how companies work. AI is the tool, not the pitch.",
    start_url: "/",
    display: "standalone",
    background_color: "#e8e6e1",
    theme_color: "#d8dbd4",
    lang: "en",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
