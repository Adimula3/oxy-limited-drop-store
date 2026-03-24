/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      // Cloudinary — uploaded drop and product images
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Google profile pictures (OAuth sign-in)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // GitHub profile pictures
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      // Allow any other https image sources
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
