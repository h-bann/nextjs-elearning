import { NextResponse } from "next/server";

export function middleware(request) {
  // Get the response (either from the next middleware or created here)
  const response = NextResponse.next();

  // Define your CSP directives
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com;
    img-src 'self' data: https://${process.env.DO_SPACES_NAME}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com;
    media-src 'self' data: https://${process.env.DO_SPACES_NAME}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self';
    frame-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  // Add CSP header to the response
  response.headers.set("Content-Security-Policy", cspHeader);

  // Add other security headers
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  return response;
}

// Configure which paths the middleware applies to
// Empty matcher applies to all routes
export const config = {
  matcher: [
    // Match all routes except for API routes, static files, and images
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
