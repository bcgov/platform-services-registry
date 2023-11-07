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
  poweredByHeader: false,
  async headers() {
    if (process.env.SECURE_HEADERS === 'false') return [];

    const loginproxy_gov =
      'https://loginproxy.gov.bc.ca/ https://dev.loginproxy.gov.bc.ca/ https://test.loginproxy.gov.bc.ca/';
    const gravatar_com = 'https://gravatar.com/';

    return [
      {
        source: '/(.*)',
        headers: [
          // See https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
          {
            key: 'content-security-policy',
            value: [
              "base-uri 'self'",
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              `img-src 'self' ${gravatar_com}`,
              `connect-src 'self' ${gravatar_com} ${loginproxy_gov}`,
              `frame-src ${loginproxy_gov}`,
              `frame-ancestors ${loginproxy_gov}`,
              "object-src 'none'",
              "form-action 'self'",
              'upgrade-insecure-requests',
            ].join(';'),
          },
          // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
          {
            key: 'strict-transport-security',
            value: 'max-age=15768000; includeSubDomains; preload',
          },
          // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
          {
            key: 'x-content-type-options',
            value: 'nosniff',
          },
          // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
          {
            key: 'x-frame-options',
            value: 'SAMEORIGIN',
          },
          // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
          {
            key: 'x-xss-protection',
            value: '0',
          },
          // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Permissions_Policy
          {
            key: 'permissions-policy',
            value: [
              'accelerometer=()',
              'ambient-light-sensor=()',
              'autoplay=()',
              'battery=()',
              'camera=()',
              'cross-origin-isolated=()',
              'display-capture=()',
              'document-domain=()',
              'encrypted-media=()',
              'execution-while-not-rendered=()',
              'execution-while-out-of-viewport=()',
              'fullscreen=(self)',
              'geolocation=()',
              'gyroscope=()',
              'keyboard-map=()',
              'magnetometer=()',
              'microphone=()',
              'midi=()',
              'navigation-override=()',
              'payment=()',
              'picture-in-picture=()',
              'publickey-credentials-get=()',
              'screen-wake-lock=()',
              'sync-xhr=()',
              'usb=()',
              'web-share=()',
              'xr-spatial-tracking=()',
            ].join(','),
          },
          // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
          {
            key: 'referrer-policy',
            value: 'strict-origin',
          },
          // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
          {
            key: 'x-dns-prefetch-control',
            value: 'off',
          },
          // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
          {
            key: 'cache-control',
            value: 'no-cache, no-store, must-revalidate, proxy-revalidate',
          },
          // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Pragma
          {
            key: 'pragma',
            value: 'no-cache',
          },
          // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expires
          {
            key: 'expires',
            value: '0',
          },
        ],
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
