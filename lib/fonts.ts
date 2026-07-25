import { Bebas_Neue, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

export const fontDisplay = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const fontBody = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const fontVars = `${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`;