/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/private-cloud/products',
        permanent: true,
      },
      {
        source: '/private-cloud',
        destination: '/private-cloud/products',
        permanent: true,
      },
      {
        source: '/public-cloud',
        destination: '/public-cloud/products',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
        port: '',
        pathname: '/avatar/**',
      },
    ],
  },
};

module.exports = nextConfig;
