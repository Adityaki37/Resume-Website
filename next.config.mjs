/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/fireboy',
        destination: 'https://www.youtube.com/watch?v=to107gIfwyg',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
