# Sandboxed Iframe Preview Security Notes

This document explains the security choices and trade-offs for the module demo preview on `/modules/[slug]`.

## Overview

The module detail page can show a live preview of a module's `demoUrl` inside a sandboxed iframe. The goal is to provide a convenient preview while keeping the host application protected from untrusted third-party content.

What is implemented:

- Preview renders only when `demoUrl` is present, valid, and uses `https://`.
- Preview is isolated inside an iframe with a restricted `sandbox` policy.
- A loading skeleton is shown while the iframe is loading.
- An error fallback is shown if the iframe cannot load or times out.
- A direct **"Open Demo In New Tab"** link is provided as a safe fallback.

## When the preview is rendered

The server validates the module `demoUrl` before rendering the preview:

- If `demoUrl` is missing, invalid, or uses `http://`, the iframe is **not** rendered.
- Only `https://` URLs that parse successfully via `new URL()` are considered safe for embedding.
- This ensures:
  - No mixed content from `http://` is embedded.
  - The preview surface is limited to well-formed HTTPS targets.

On the client, the `SandboxedDemoPreview` component:

- Shows a loading skeleton while the iframe loads.
- Tracks error state via `onError` and a safety timeout (e.g. if the site blocks framing and never fully loads).
- Shows a user-friendly error UI and an external link when embedding is not possible.

## Sandbox policy

The iframe uses the following `sandbox` attribute:

```tsx
sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation"
```

This configuration:

- **Allows**
  - `allow-scripts`: needed for most interactive demos (SPAs, forms, animations, etc.).
  - `allow-forms`: allows in-iframe forms to submit (e.g. login demos, contact forms).
  - `allow-modals`: allows in-iframe `alert`/`prompt`/modal UIs.
  - `allow-popups`: allows demos to open new windows/tabs (e.g. docs, auth flows).
  - `allow-presentation`: allows presentation-related APIs if used by the demo.
- **Does NOT allow**
  - `allow-same-origin`
  - top-level navigation out of the iframe
  - directly accessing or modifying the parent window DOM

As a result:

- The demo behaves like a regular web app inside its own box.
- It cannot take control of, or read from, the parent page.

### Why `allow-same-origin` is omitted

The sandbox intentionally does **not** include `allow-same-origin`.

**Risk:**

- When `allow-scripts` and `allow-same-origin` are both set, and the embedded content shares an origin with the parent, scripts inside the iframe can effectively recover full same-origin privileges.
- In that situation, the iframe script may:
  - Read or modify data that should be isolated.
  - Interact with the parent DOM and APIs as if it was not sandboxed at all.

**Mitigation:**

- By omitting `allow-same-origin`, the embedded page runs in an **opaque origin**:
  - It cannot be treated as the same origin as the parent, even if the hostname matches.
  - It has reduced access to origin-bound APIs (e.g. cookies, some storage).
  - It significantly reduces containment bypass risks.

**Trade-off:**

- Some demos that rely on origin-bound APIs such as `localStorage` may see `SecurityError` exceptions when trying to access them inside the sandbox.
- In those cases:
  - The preview may be partially degraded.
  - The UI shows an error fallback and offers a link to open the demo in a new tab, where it can run with full capabilities.

This trade-off is acceptable for this feature because protecting the host application is prioritized over fully supporting every possible embedded demo behavior.

## CSP headers

`next.config.ts` configures route-level Content Security Policy for module pages:

```ts
Content-Security-Policy:
  frame-src 'self' https:;
  frame-ancestors 'self';
  object-src 'none';
```

These directives are applied to `/modules/:path*` responses and have the following effects:

- `frame-src 'self' https:`
  - Allows iframes on the module page to load only from:
    - the same origin (`'self'`)
    - arbitrary HTTPS origins (`https:`)
  - This matches our `demoUrl` requirements (HTTPS-only previews).
- `frame-ancestors 'self'`
  - Restricts **who can frame this page**.
  - Prevents the module page itself from being embedded in iframes on untrusted domains.
  - Reduces clickjacking and UI redress attack surface.
- `object-src 'none'`
  - Disables legacy plugin/object embedding (`<object>`, `<embed>`, etc.).
  - Reduces attack surface from older content types.

Taken together, the sandbox and CSP:

- Protect the host application when it embeds untrusted external demos.
- Protect the module pages from being embedded by untrusted sites.

## Behavior examples

Some realistic behaviors with this configuration:

- **Simple static/JS landing pages**  
  - Load and render normally inside the iframe.  
  - May log console errors if they try to reach into `window.top` or `window.parent`, but cannot modify the parent.

- **Sites that explicitly disallow being framed (e.g. large social platforms)**  
  - Often send `X-Frame-Options: DENY` or a strict `frame-ancestors` CSP.
  - The browser will refuse to embed them; the preview shows the error fallback and offers an external link.

- **Apps that rely heavily on `localStorage` or other origin-specific APIs**  
  - The sandboxed context lacks `allow-same-origin`, so some origin APIs may throw `SecurityError`.
  - If the error prevents proper rendering, the timeout/error handling will show the fallback UI and external link.