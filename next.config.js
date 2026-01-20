/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "dist",
  images: {
    unoptimized: true,
  },
  // Tauri requires static export
  trailingSlash: true,
  // Skip ESLint during production builds (already run separately in CI)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
