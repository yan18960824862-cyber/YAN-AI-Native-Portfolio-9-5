import localFont from "next/font/local";

export const heroFont = localFont({
  src: [
    { path: "./fonts/AlibabaPuHuiTi-3-55-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/AlibabaPuHuiTi-3-65-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/AlibabaPuHuiTi-3-75-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-hero",
  display: "swap",
  preload: false,
  fallback: ["Arial", "Microsoft YaHei", "sans-serif"],
});
