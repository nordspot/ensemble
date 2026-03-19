import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const publicPaths = [
  '/',
  '/anmelden',
  '/registrieren',
  '/passwort-vergessen',
  '/passwort-zuruecksetzen',
  '/kongress',
  '/impressum',
  '/datenschutz',
  '/agb',
  '/kontakt',
  '/funktionen',
  '/api/auth',
  '/api/congress',
  '/api/seed',
  '/api/contact',
];

function isPublicPath(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(de|fr|it|en)/, '') || '/';
  return publicPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + '/')
  );
}

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // Check auth for protected routes
  if (!isPublicPath(request.nextUrl.pathname)) {
    const sessionToken =
      request.cookies.get('authjs.session-token') ??
      request.cookies.get('__Secure-authjs.session-token');

    if (!sessionToken) {
      // Determine locale from path or default
      const localeMatch = request.nextUrl.pathname.match(/^\/(de|fr|it|en)/);
      const locale = localeMatch ? localeMatch[1] : 'de';
      const loginUrl = new URL(`/${locale}/anmelden`, request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/', '/(de|fr|it|en)/:path*'],
};
