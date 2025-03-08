/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: [
        'lilontirukzmquhkgeqd.supabase.co', // Your Supabase domain
        'images.unsplash.com' // Unsplash domain for the test images
      ],
    },
  }
  
  module.exports = nextConfig