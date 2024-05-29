// See https://nextjs.org/docs/pages/building-your-application/configuring/content-security-policy
import { NextRequest, NextResponse } from 'next/server';
import { SECURE_HEADERS, AUTH_BASE_URL } from './config';

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  if (SECURE_HEADERS !== 'true') {
    return NextResponse.next({
      headers: requestHeaders,
      request: {
        headers: requestHeaders,
      },
    });
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const loginproxy_gov =
    AUTH_BASE_URL ??
    'https://loginproxy.gov.bc.ca/ https://dev.loginproxy.gov.bc.ca/ https://test.loginproxy.gov.bc.ca/';

  const gravatar_com = 'https://gravatar.com/';

  // See https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  const cspSegments = [
    "base-uri 'self'",
    "default-src 'self'",
    // Let's take another look at CSP since it necessitates the regeneration of static HTML files.
    // `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // `style-src 'self' 'nonce-${nonce}'`,
    `script-src 'self' 'unsafe-inline'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: ${gravatar_com}`,
    `connect-src 'self' ${gravatar_com} ${loginproxy_gov}`,
    `frame-src ${loginproxy_gov}`,
    `frame-ancestors ${loginproxy_gov}`,
    "object-src 'none'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ];

  const cspHeaderValue = cspSegments.join(';');

  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('content-security-policy', cspHeaderValue);

  const response = NextResponse.next({
    headers: requestHeaders,
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('content-security-policy', cspHeaderValue);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
