const isProd = process.env.NODE_ENV === "production";

/* Content Security Policy.
   - script-src needs 'unsafe-inline' because Next.js emits inline bootstrap
     scripts; a nonce would force every page to render per request. There is
     no user-generated HTML on the site, and 'unsafe-eval' is development-only
     (React Refresh).
   - Cloudflare Turnstile (the waitlist bot check) loads its script and a frame
     from challenges.cloudflare.com.
   - style-src needs 'unsafe-inline' for the style attributes React and Framer
     Motion write; fonts.googleapis.com serves the font stylesheet.
   - data: images are the grain texture; media is the demo video, from self. */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "frame-src https://challenges.cloudflare.com",
  `connect-src 'self'${isProd ? "" : " ws: wss:"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
    : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
