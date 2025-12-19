/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "dist",
  images: {
    unoptimized: true,
  },
  // Tauri requires static export
  trailingSlash: true,
};

export default nextConfig;
