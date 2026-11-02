/** @type {import('next').Config} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Nécessaire pour les images sur GitHub Pages
  },
}

module.exports = nextConfig
