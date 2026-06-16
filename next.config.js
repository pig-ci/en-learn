/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ 這一行會直接讓 Vercel 在部署時忽略所有 TypeScript 錯誤
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ 這一行會直接讓 Vercel 在部署時忽略所有 ESLint 錯誤
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
