# CSP Headers for Iframe Preview Security

## Overview
This document outlines the Content Security Policy (CSP) headers required for secure iframe preview functionality.

## Required CSP Headers

### For Production Deployment
The hosting server should set the following CSP headers:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; frame-src 'self' https:; img-src 'self' https: data:; font-src 'self' https:; connect-src 'self' https:;
```

### For Development (Localhost)
```http
Content-Security-Policy: default-src 'self' http://localhost:3001; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:3001; style-src 'self' 'unsafe-inline' http://localhost:3001; frame-src 'self' http://localhost:3001 https:; img-src 'self' http://localhost:3001 https: data:; font-src 'self' http://localhost:3001 https:; connect-src 'self' http://localhost:3001 https:;
```

## Security Considerations

### Sandbox Attributes Justification
We use the following sandbox attributes:
- `allow-scripts`: Required for interactive demos to function
- `allow-forms`: Allows form submissions within demos
- `allow-popups`: Allows popup windows (controlled by user activation)
- `allow-modals`: Allows modal dialogs
- `allow-orientation-lock`: Allows screen orientation changes
- `allow-pointer-lock`: Allows pointer lock for games
- `allow-presentation`: Allows presentation mode
- `allow-top-navigation-by-user-activation`: Allows navigation only with user interaction

### Security Risks Mitigated
1. **No `allow-same-origin`**: Prevents iframe from accessing parent page
2. **HTTPS-only URLs**: Ensures encrypted connections
3. **CSP headers**: Prevent XSS attacks and unauthorized resource loading
4. **Sandbox restrictions**: Limits iframe capabilities

### Risk Assessment
**Risk**: If `allow-same-origin` and `allow-scripts` were both set, the iframe could potentially:
- Access parent page DOM
- Steal user data
- Perform clickjacking attacks
- Execute malicious scripts in parent context

**Mitigation**: We avoid `allow-same-origin` to completely isolate the iframe from the parent page.

## Implementation in Next.js

### Method 1: Middleware (Recommended)
Create `middleware.ts` in root directory:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Set CSP headers
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; frame-src 'self' https:; img-src 'self' https: data:; font-src 'self' https:; connect-src 'self' https:;"
  );
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Method 2: Next.js Config
In `next.config.js`:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; frame-src 'self' https:; img-src 'self' https: data:; font-src 'self' https:; connect-src 'self' https:;"
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

## Testing CSP Headers

### Verification
1. Open browser developer tools
2. Check Network tab for response headers
3. Verify CSP header is present
4. Test iframe preview with various URLs

### Common Issues
- **CSP violations**: Check browser console for CSP errors
- **Mixed content**: Ensure all resources use HTTPS
- **Inline scripts**: May require 'unsafe-inline' for some demos

## Monitoring and Maintenance

### Regular Checks
- Monitor CSP violation reports
- Update CSP rules as needed
- Test with new demo URLs
- Review security policies quarterly

### Incident Response
If CSP violations occur:
1. Check browser console for specific violations
2. Update CSP rules to allow necessary resources
3. Test changes in development first
4. Deploy updates carefully

## References
- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP CSP Guidelines](https://owasp.org/www-project-secure-headers/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
