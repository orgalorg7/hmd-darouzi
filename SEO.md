# Search setup for HMD Darouzi / درعوزي

The permanent domain has not been purchased yet. The current tunnel is a preview, not the production search address. Preview builds deliberately use `noindex, follow`; they do not publish a canonical domain or sitemap. No Search Console property has been verified and no sitemap has been submitted from this workspace.

## Implemented

- Arabic homepage at `/` and English homepage at `/en/`, each delivered as complete HTML. The language URL determines the content; saved preferences do not override a direct link. The language switch remains instant and preserves in-page state, with browser history support.
- A script-free FAQ in both languages (`/faq/`, `/en/faq/`) with `FAQPage` structured data. Google currently shows FAQ rich results only for a few authoritative sites, so the value is the Arabic answers themselves, not a search feature.
- A script-free privacy notice in both languages (`/privacy/`, `/en/privacy/`), linked from every page footer. It is a trust page, not a ranking factor.
- Six service guides in both languages, under `/services/` and `/en/services/`: `cold-rooms`, `water-chillers`, `cooling-towers`, `block-ice-plants`, `refrigerated-transport`, and `thermal-insulation`.
- Every guide has its own title, description, main heading, practical project requirements, relevant equipment links, contact information, and WhatsApp/email inquiry links. The guides use existing company photos and do not load JavaScript.
- The homepage catalog and service navigation are included in the initial response, with descriptive image alternatives. Visible brand and company text connect HMD Darouzi, درعوزي, industrial refrigeration, Aleppo and the company’s actual services.
- Production builds generate self-referencing canonical URLs, reciprocal Arabic/English and x-default alternates, localized Open Graph/Twitter metadata, and a 14-URL XML sitemap.
- JSON-LD describes the real business, website, pages, services and breadcrumbs, and links the business to its Facebook and Instagram accounts (`sameAs`). No fabricated ratings, reviews, opening hours, credentials, coordinates, prices or stock claims are included.
- Brand searches: the Arabic homepage title starts with **درعوزي للتبريد | HMD درعوزي**, and the business structured data lists the names people search for (`درعوزي`, `درعوزي للتبريد`, `HMD درعوزي`, `شركة درعوزي`, `HMD Darouzi`, `Darouzi`). The FAQ opens with “من هي شركة درعوزي للتبريد؟ / Who is HMD Darouzi?”, a self-contained answer that search engines and AI assistants can quote.
- AI assistants: `robots.txt` allows ChatGPT (`GPTBot`, `OAI-SearchBot`, `ChatGPT-User`), Claude (`ClaudeBot`, `Claude-SearchBot`, `Claude-User`), Gemini (`Google-Extended`), Perplexity and Common Crawl. Only bulk scrapers and offline site copiers are refused. `/llms.txt` gives assistants a plain-text summary of the company, its names, services, contact details and page links.
- Link previews: every page has a short share title with ❄️, a one-line pitch and its own designed 1200×630 JPEG card (`public/assets/share/`, Arabic and English). Regenerate the cards with `npm run share:build` after changing service names, headings or photos. Preview images need absolute URLs: production uses `SITE_URL`; a preview build can set `PREVIEW_URL` to the tunnel origin (pages stay noindex). WhatsApp caches a link’s preview, so add `?v=2` to test a refreshed card.
- A root `404.html` enables genuine not-found pages on Cloudflare Pages instead of the default SPA homepage fallback. The local preview server matches this behavior for document requests.
- Cloudflare `_headers` adds immutable caching only for content-hashed JS/CSS, plus content-type/referrer headers; preview builds also emit `X-Robots-Tag: noindex, follow`.

The six service descriptions derive from the supplied company profile and text brief. Additional questions help visitors prepare an inquiry; they are not engineering guarantees. Existing specifications remain subject to project review.

## Launch on the purchased domain

1. Connect the chosen domain to the production static deployment and make sure HTTPS works. Choose one primary hostname (for example, the apex domain rather than both apex and `www`). Redirect any other hostname to that primary hostname at the host/CDN.
2. Set `SITE_URL` to that exact HTTPS origin, with no path or query. `.env.example` documents the setting. Set `SEO_REQUIRE_DOMAIN=1` in production so a build fails if the domain is missing. Never point this at a temporary tunnel.
3. Run `npm run build` and deploy `dist/`. The build log should say **Indexable domain**, and the delivered HTML must have `index, follow`, the correct canonical URL and no `X-Robots-Tag: noindex` header. Review host-level preview/indexing rules too.
4. Open `/robots.txt` and `/sitemap.xml` on the live domain. Confirm all sitemap URLs use the purchased primary domain. Check a service page, its alternate-language page and a nonexistent URL (HTTP 404).
5. Add the domain in Google Search Console and verify ownership through its DNS TXT record. If using a URL-prefix property and HTML verification instead, set `GOOGLE_SITE_VERIFICATION` to the token and rebuild. The code does not invent a token or claim verification.
6. Submit `https://YOUR-PURCHASED-DOMAIN/sitemap.xml` in Search Console. Inspect the Arabic homepage, English homepage and representative service pages. Request indexing after checking the rendered content and canonical selected by Google.
7. Validate a live page with Google’s Rich Results Test. Structured data helps describe the business; it does not guarantee a rich result or ranking.
8. Add the site to **Bing Webmaster Tools** (it can import the Search Console property) and submit the same sitemap. ChatGPT search and Copilot rely heavily on Bing’s index, so this matters as much as Google for AI answers.
9. Create or claim a **Google Business Profile** named “درعوزي للتبريد - HMD Darouzi” with the website link, the real address and phone. For brand and “near me” searches it is usually the most visible result, above the website itself.
10. In Cloudflare, leave **Block AI bots** off (see `SECURITY.md`), otherwise the edge overrides `robots.txt` and assistants cannot read the site.
11. Keep the same real business name, phone, address and domain on company-controlled profiles and relevant listings. Link to the website from genuine company channels. Add new project pages only when real photos and project facts are available and approved for publication.

## Maintaining the content

`src/content.js` holds the shared service/product data and English interface copy. Arabic interface copy starts in `index.html`. `scripts/seo/details.js` holds the bilingual service guide text. `scripts/seo/render.js` generates HTML and structured data; `scripts/seo/plugin.js` connects this to Vite. `src/site-meta.js` keeps homepage metadata synchronized when switching languages in place. `linkedom` is a development/build dependency only; it is not shipped to visitors.

Run `npm run build`, then `npm run test:seo` with the preview server running. The suite checks all 14 generated pages, unique metadata, canonical/hreflang/schema consistency against an isolated example-domain fixture, the sitemap, no-JavaScript content, language/history behavior, mobile layouts, accessibility and HTTP 404 handling. The example domain is never used for the public preview build.

## Validation from this implementation

The isolated production-style Arabic homepage scored **100/100 in Lighthouse’s automated SEO category**. Report: `test-results/seo-lighthouse.json`. The public preview intentionally remains noindex. This audit checks technical page signals; it does not measure search position, indexing, backlinks or local visibility. The SEO, core site, mobile, phone-tools, design and low-end performance suites also passed.

## What to measure after launch

Use Search Console and Bing Webmaster Tools to monitor indexed pages, crawl issues, impressions and clicks for `درعوزي`, `درعوزي للتبريد`, `HMD درعوزي`, `HMD Darouzi`, and the individual refrigeration services. Ask ChatGPT and Claude (with web search on) “من هي شركة درعوزي للتبريد؟” every few weeks; answers improve as more independent pages (listings, social profiles, articles) mention the company with the same name, phone and website. Models without web search only learn about the company at their next training update. Compare results over several weeks and improve pages based on actual customer questions. Rankings depend on indexing, competition and signals outside this codebase; first place and a specific indexing date cannot be promised.

References: [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions), [organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization), [Cloudflare static routing and caching](https://developers.cloudflare.com/pages/configuration/serving-pages/).
