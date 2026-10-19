# Security for HMD Darouzi / درعوزي

The site is static: no server code, database, login, uploads or form endpoint. Visitor input never reaches a server; the quote form prepares a WhatsApp or email message that the visitor sends from their own app. Most attacks on websites have nothing to target here. The remaining risks are browser-side injection, framing, hotlinking, scraping, and above all **takeover of the accounts that control the domain and hosting**.

## Implemented in the build

`scripts/seo/security.js` defines one policy. The build writes it to `dist/_headers` (Cloudflare Pages), and the preview server sends the same headers, so tests exercise the deployed policy.

- **Content Security Policy:** `default-src 'none'`. Pages may load only their own scripts, styles, images and fonts. No inline code, `eval`, third-party origins, plugins, `<base>` changes or form submissions. All dynamic HTML in the client uses build-time constants; visitor text (names, notes, search) is only assigned as text or values.
- **Script-free guides:** service guides and the 404 page also forbid all scripts.
- **No framing:** `frame-ancestors 'none'` and `X-Frame-Options: DENY` stop clickjacking and stop another site from wrapping these pages.
- **No hotlinking:** `Cross-Origin-Resource-Policy: same-origin` blocks other sites from showing the images, scripts and fonts. Search engines and link previews fetch from servers and are unaffected.
- **Isolation and privacy:** `Cross-Origin-Opener-Policy: same-origin`, `Referrer-Policy: same-origin`, `nosniff`, and a `Permissions-Policy` that disables camera, microphone, location, payment, USB, sensors and similar features.
- **HTTPS only (production):** builds with `SITE_URL` send `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`. Preview builds do not.
- **PDF:** the company profile keeps every header except the page policy, so built-in PDF viewers render it.
- **Vulnerability reports:** `/.well-known/security.txt` (RFC 9116) points researchers to `h.darouzi@gmail.com`. It expires 360 days after each build, so **rebuild and redeploy at least once a year**.
- **Crawlers:** `robots.txt` refuses known AI-training crawlers and offline site copiers (HTTrack, Wget, WebCopier and others). Google, Bing and link previews stay allowed.

`npm run test:security` (preview server running) checks the policy text, the headers on every page type, zero policy violations while the 3D engine, inspection, quote, tray, footer canvas and language switch run, refused framing and hotlinking, the PDF exception, `security.txt` and `robots.txt`. Adding any third-party service (analytics, maps, chat, fonts) needs a deliberate change to `security.js`; otherwise this test fails.

## Cloudflare settings at launch

1. **SSL/TLS:** Always Use HTTPS on; minimum TLS 1.2; TLS 1.3 on.
2. **Security → Bots:** turn on Bot Fight Mode and **Block AI bots**. This is enforced at the edge, unlike robots.txt.
3. **Security → WAF:** keep the managed rules on. Add a rate-limiting rule, for example more than 100 requests in 10 seconds from one IP → block.
4. **Scrape Shield:** turn on Hotlink Protection. **Leave Email Address Obfuscation off**: it injects a script, which the guides' policy forbids, and breaks their email links.
5. **Leave Rocket Loader, Zaraz and automatic Web Analytics injection off.** They insert inline scripts that the policy blocks.
6. **DNS:** enable DNSSEC. Add a CAA record (`0 issue "letsencrypt.org"`); Cloudflare adds the certificate authorities it needs. If the domain sends no email, publish `v=spf1 -all`, a DMARC `p=reject` record and a null MX, so nobody can send email that appears to come from the domain.
7. **HSTS preload:** once every subdomain works over HTTPS, submit the domain at hstspreload.org. Removal is slow, so only do this for the permanent domain.

## Accounts: the largest real risk

- Use two-factor authentication, preferably an authenticator app or hardware key, on the Cloudflare account, the domain registrar, any Git hosting, and the `h.darouzi@gmail.com` mailbox, which is the contact address and usually the account-recovery address.
- Turn on the registrar's transfer lock and auto-renewal. Use registry lock if offered.
- Give Cloudflare access only to people who need it. Use scoped API tokens, never the global key.

## Limits

- **Copying cannot be prevented.** Anything a browser can display has been downloaded and can be saved. Right-click blocking, developer-tools detection and code scrambling are bypassed in seconds and would damage accessibility and search visibility, so they are not used. The measures above make automated copying harder. Canonical URLs and Search Console identify the original. Copies hosted elsewhere can be removed with DMCA requests to their host and to Google.
- **Spam.** There is no form to abuse, but the phone number and email address are public by design, and some unsolicited messages will arrive. Gmail filtering and WhatsApp blocking handle these.
- **Traffic floods** are absorbed by Cloudflare's network. No static site can guarantee unlimited capacity.
