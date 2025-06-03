import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware is no longer used for NextAuth authentication due to Edge Runtime limitations.
// Authentication checks will be handled in Server Components (layouts/pages).
// This middleware can be used for other purposes like setting headers, redirects (non-auth related), etc.

export function middleware(request: NextRequest) {
  // Example: Add a custom header
  // const requestHeaders = new Headers(request.headers);
  // requestHeaders.set('x-custom-header', 'my-custom-value');
  // return NextResponse.next({
  //   request: {
  //     headers: requestHeaders,
  //   },
  // });

  // Default behavior: pass through
  return NextResponse.next();
}

// The matcher remains the same, applying the middleware to relevant paths.
export const config = {
  matcher: [
    // Exclude files with extensions like .html, .css, .js, images, etc.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Include API routes and TRPC routes
    '/(api|trpc)(.*)',
    // Include the root path
    '/',
  ],
};

