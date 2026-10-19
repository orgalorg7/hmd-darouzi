# HMD Darouzi website

A new Arabic-first, bilingual website for HMD Darouzi Industrial Refrigeration. The original `esadpanel.com/` reference, PDF and Arabic text brief are preserved.

## Run

```sh
npm install
npm run dev
```

Vite prints the local URL and selects the next available port if 5173 is occupied.

```sh
npm run build
npm run preview
```

Deploy the contents of `dist/` to a static host. No server, runtime framework, database, CDN fonts or third-party scripts are required. The 18 MB company PDF downloads only when its link is opened.

## Interactive experience

The interactive design replaces the photograph-led opening with a live Three.js cold-room showroom. Rotate the room, open and close its door, switch between cutaway / exterior / exploded views, inspect component hotspots, and change the cooling mode. The configurator opens beside the model and changes room dimensions, calculates approximate volume, and transfers the dimensions and target temperature into a quotation.

Service selections expand smoothly without replacing the gallery DOM. Retail product images open an inspection dialog with zoom, pointer and keyboard panning, reset, and a product-specific quotation action. Pointer tilt is limited to desktop devices that permit motion.

The 3D room is a conceptual visualization, not a production drawing or an engineering simulation. Temperature presets affect the visual presentation and requested target; they do not certify suitability for a particular stored product. The dimensions and 2.8 m height produce an arithmetic volume estimate.

The insulation study is a lightweight CSS 3D assembly. Its range control separates the three illustrative panel layers, while keyboard-accessible layer tabs explain their roles. A dedicated insulation inquiry connects it to the quotation flow. The page also includes persistent navigation, active section indicators, custom range feedback, and larger equipment presentations.

## Blueprint and application finder

Choose **Blueprint** in the room view selector for a dimensioned SVG floor plan. It follows the existing width, length and door controls. Three component buttons (and the corresponding drawing markers) open the evaporator, insulation and door explanations. The plan is conceptual, uses the requested interior dimensions and the existing 2.8 m height assumption, and is not a construction drawing. It works in light mode without Three.js. Entering blueprint mode disposes any active renderer and invalidates pending engine loads; choosing a model view explicitly restores the relevant 3D/lightweight behavior. The hero background remains static.

**What are you cooling?** sits above the six solution tabs. Food/produce and medicines highlight cold rooms, refrigerated transport and insulation; industrial processes highlight water chillers, cooling towers and insulation. These are discussion starting points, not automatic temperature or engineering specifications. Visitors can open any highlighted service or start an inquiry. Their selected application appears above the quote form and is included in both email and WhatsApp messages, while their typed details remain intact. Selection survives language changes and can be cleared.

`npm run test:project-tools` checks blueprint dimensions and door state, component focus, no initial engine request, renderer disposal and delayed-import races, three application routes, service highlighting, draft preservation, both message handoffs, Arabic/English, accessibility and 320–1440px layouts.

## Visual identity and motion

The contact section closes with six selectable project categories that carry into the quote form, prominent phone/email links, and separate Aleppo sales/factory addresses. The footer groups the original logo, site navigation, company PDF and back-to-top control. `src/footer.css` scopes this layout. Folded cooling-fin linework reacts to pointer movement, focus and selections; it is illustrative artwork, not a thermal simulation. `src/footer.js` loads only near the section (approximately 1.74 KB gzipped). It allocates a canvas only on interaction, caches the complete fin path, batches pointer input into display frames and uses time-based easing. The buffer is capped at 450,000 pixels. Drawing stops when idle; leaving the viewport, hiding the tab or selecting light mode releases the buffer. Light mode, constrained hardware and reduced motion use the static SVG artwork and retain all inquiry controls. There are no new runtime libraries or image downloads.

The repeatable synthetic 1,000-pointer-event check reduced field layout reads from 1,001 to 2, path allocations from 675 to 1, and stroke calls from 1,245 to 109. Its buffer dropped from 650,400 to 449,100 pixels. These are work counts, not a claim about overall page-load speed or a device frame-rate guarantee. Reports: `test-results/footer-cost-before.json` and `test-results/footer-cost-after.json`. Repeat with `node scripts/profile-footer-cost.mjs after` against the preview server. Product filtering reuses card/image nodes; inspection panning batches updates per animation frame and measures its limits only on zoom, image load or resizing. The fixed header and profile link use solid surfaces without backdrop blur.

`npm run test:footer` verifies all six quote paths in Arabic/English, selection persistence through language changes, 320–1920px layouts, accessibility, deferred loading, background response and suspension, the canvas pixel budget and static fallbacks. Contact targets, PDF availability, focus restoration and back-to-top behavior were also checked.

Interface icons use one Tabler outline family with a consistent 1.75 stroke. Rotation, zoom, language, PDF, contact and selection controls have distinct symbols; directional navigation mirrors in Arabic while physical rotation stays fixed. Labels remain available to assistive technology. The build extracts only 35 icons into a shared SVG sprite; there is no icon font or browser icon library. Run `npm run icons:build` to regenerate it. Tabler's MIT license is included in `public/assets/tabler-license.txt`.

The latest design uses a brighter cobalt-and-ice palette, restrained yellow details from the original logo, tactile primary buttons, rounded control surfaces and stronger catalogue imagery. The showroom background uses curved cooling fins and a drafting floor, drawn as inline SVG and styled in `src/hero-environment.css`. The background is entirely static on desktop and phones: no airflow slider, animated SVG, light sweep, pointer tracking or automatic introduction. Its palette remains fixed when the room temperature changes. The background has no JavaScript module or animation loop. Button feedback and temperature/selection transitions are brief and cancellable.

The earlier transform-based SVG animation still repainted continuously despite having no JavaScript frame loop on phones. A 3-second Chrome rendering trace at 390×844 with 4× CPU slowdown recorded **366 → 6 paint events** and **180 → 2 layout passes** after removing that animation. Active background animations fell from 6 to 0. This is a local rendering-work comparison, not a claim about every device's frame rate or page-load speed. Reports and raw traces: `test-results/hero-paint-before.json`, `test-results/hero-paint-after.json` and the corresponding `-trace.json` files. Repeat with `node scripts/profile-hero-paint.mjs after`.

`npm run test:design` checks the moving selector across Arabic/English and 320–1440px layouts, temperature-track synchronization, menu resize/outside-click behavior, product-dialog backdrop dismissal and focus restoration, mobile control separation, and ambient-motion suspension. Earlier visual styling is preserved in `backups/v4/`.

## Features

- Arabic RTL and English LTR at stable language URLs, with instant switching and state preservation.
- Six keyboard-accessible service tabs, each with a service-specific quotation action.
- Retail category filters and product-specific inquiries.
- Target-temperature selection carried into a cold-room inquiry.
- Accessible native quotation dialog with two direct send options (WhatsApp and email), required-field validation, focus restoration and a copy-message fallback.
- Mobile navigation, reduced-motion support, locally hosted fonts, responsive WebP hero and lazy-loaded product images.
- A direct WhatsApp chat button on every screen (`src/whatsapp.css`). It is a plain link with a greeting in the visitor's language, so no form is needed. On phones it sits above the shortcut dock and hides behind dialogs, the menu and the on-screen keyboard.

The quotation form **prepares a message**. Both send buttons are available immediately; either validates the same fields and opens only the chosen app with the current name, phone, selected service and details. Email addresses `h.darouzi@gmail.com`; WhatsApp addresses `971506497817`, the number the company's Facebook page lists as its WhatsApp contact; `+963 944 699 555` stays the phone line. Both live in `src/site-meta.js` (`whatsappNumber`). Visitors confirm sending inside their chosen app. The site does not claim a request has been received. Editing the form clears the old message preview to prevent stale copies. The phone and WhatsApp numbers come from the PDF and the company's Facebook pages.

## Content and assets

`index.html` contains the primary Arabic content. `src/main.js` contains English translations, service definitions and retail categories. `src/style.css` supplies shared styles and `src/experience.css` defines the showroom foundation. `src/refinement.css` and `src/refinement.js` add the refined visual system, interactive panel construction, and navigation feedback. `src/experience.js` wires interactive controls and `src/room-scene.js` models and renders the conceptual room.

The PDF supplies the original HMD logo, product imagery, company description, Aleppo locations, email, phone, cold-room range (-40 to +15°C), and chiller specifications (10 to 200 HP; 12°C inlet / 7°C outlet). The text brief supplies the six divisions and separate retail area. Product cards represent inquiry categories, not live stock or priced SKUs. The brand strip identifies brands in the supplied profile, without asserting an authorized partnership.

The hero is a locally rendered 3D conceptual cold room. A transparent image rendered from that same model provides its immediate preview and WebGL fallback. It is not presented as a completed HMD installation. Other imagery is extracted from the supplied company profile. Product cards use transparent cut-outs in `public/assets/products/`, built by `python3 scripts/build-product-images.py` from the profile's own image masks on one shared canvas. Upscaling is capped at 1.35×, so the low-resolution compressor photograph stays sharp but appears smaller. The door card is traced from a company photograph of a finished cold room (see `scripts/build-site-photos.py`). The superseded extracts are in `backups/v5-product-images/`. The tower and ice-plant tabs use supporting refrigeration-equipment photographs rather than claims of specific completed projects.

The reference website informed the cooling-industry language, system selection, temperature interaction and quote-led journey. Its export metrics, certificates, prices, clients and manufacturing claims are not attributed to HMD.

Design: a light industrial showroom with a cobalt-blue accent, the original HMD mark, IBM Plex Sans Arabic and Manrope. Real 3D interaction, expanding service panels, direct product inspection and responsive touch controls. No scroll hijacking. Design variance 9, motion intensity 8, density 4.

## Checks

Start the dev server, then:

```sh
TEST_URL=http://localhost:5174 npm test
```

The browser suite uses installed Google Chrome through Playwright. It checks service/product quote paths, keyboard tabs, filters, temperature transfer, prepared message destinations, dialog focus, language persistence, mobile menu, 320–1440px widths, reduced motion, image loading and automated WCAG A/AA scans. Screenshots and scan output are written to `test-results/`.

Before publishing for search, set the purchased permanent domain as `SITE_URL` and rebuild; see [SEO.md](SEO.md). Without that setting, the build is explicitly a noindex preview. Direct form delivery still requires a backend; current WhatsApp/email buttons prepare messages for the visitor to send.

## 3D checks and performance choices

```sh
npm run test:experience
```

This additional browser test verifies WebGL initialization, room rotation, three viewing modes, door controls, temperature presets, hotspots, the in-scene configurator, live volume and quote transfer, product zoom and panning, insulation layer selection and assembly, mobile layouts and bilingual controls.

The room preview paints immediately (approximately 38 KB). Hover, ordinary focus, a temperature preset, and vertical touch scrolling do not load Three.js. A deliberate room interaction or the configurator activates live 3D on capable devices.

### Lightweight mode

Touch devices (a coarse primary pointer), low-memory / low-core hints (4 GB or fewer; 4 logical cores or fewer), Save-Data, slow-2G/2G connections, and reduced motion select the lightweight experience automatically. An explicit saved Full/Light preference takes priority. Unknown hints do not block the full experience. The viewer button lets visitors choose either mode and remembers that choice locally. These hints are a conservative heuristic, not a hardware benchmark.

Light mode uses six pre-rendered room states, requested individually as needed. Cutaway, exterior, exploded views, open/closed doors, hotspots, temperature selection, dimension-to-quote transfer, panel layers, and product inspection remain available. Its room preview shows standard dimensions; the configurator explicitly explains that the selected dimensions are included in the inquiry. Free camera rotation and live room resizing require 3D.

No Three.js download or WebGL canvas is required in light mode. Animated decorative effects, image tilt and backdrop blurs are disabled. Returning to light mode disposes the renderer, geometry, materials and textures and releases the WebGL context. Failed WebGL initialization or a lost GPU context falls back to light mode without breaking quote controls.

### Live-rendering budgets

The full renderer targets up to 60 fps with a 1-million-pixel drawing-buffer budget. Economy rendering targets up to 30 fps with a 400,000-pixel budget, no shadow map and no moving airflow particles or fans. When selected at initialization, it also uses cheaper materials. Rendering resolution adapts to the stage dimensions. Sustained slow frames lower the pixel budget and disable expensive effects. This is a workload target, not a guarantee of a particular device's frame rate.

Wall panels that move together share a batched assembly. Projected hotspots reuse vectors and cached elements, writing their positions only when changed. Rendering stops after the interaction settles, when offscreen, and when the document is hidden. Product and panel pointer effects run at most once per animation frame.

The renderer check recorded 40 draw calls in the exploded economy view, a 713×560 drawing buffer for a 936×735 stage, unchanged frame counts while idle/offscreen, and zero remaining canvases after disposal. See `test-results/renderer-efficiency.json`. Run `node scripts/check-renderer.mjs` with the dev server at port 5174 to repeat this check.

```sh
npm run test:performance
```

The performance behavior suite simulates 2-core / 2-GB browser hints and 6× CPU slowdown. It verifies zero engine requests and zero WebGL canvases while exercising light-mode interactions; bounded drawing buffers after opting into 3D; teardown; saved preferences; Arabic/English layouts; vertical touch scrolling; and graphics failures. Hardware hints and CPU slowdown are simulated: this does not physically limit the machine to 2 GB of RAM or reproduce every old GPU. Results are saved in `test-results/performance-behavior.json`.

The original interactive version is preserved in `backups/v2/`, and the photograph-led version in `backups/v1/`. Historical audit and draw-call reports describe those versions.

## Installation explorer and parts tray

The `#installation` section uses the existing cold-room photograph from the supplied company profile. Native numbered buttons identify visible evaporators, insulated panels and drainage lines; equivalent labeled buttons work by keyboard and touch. Explanations avoid unverified client, location, capacity or model claims. Visitors can add the matching evaporator/panel category to the parts tray or open a cold-room inquiry. The photo is lazy-loaded and reused from the existing gallery.

The `#parts-tray` section collects any of the eight existing catalog categories. Add controls are available on product cards and in the inspection dialog. Quantity controls accept whole units from 1 to 999, and each row has a 240-character model/specification note. Selections survive filters, language changes and reloads in local storage when available. Known IDs and bounded values are validated on restoration; notes remain plain text. Removing items and emptying the tray update its inquiry state immediately. There are no stock or price calculations.

The tray opens the existing quotation dialog with a visible list summary and preserves any typed project note. Only an explicit spare-parts inquiry includes the list in the prepared WhatsApp/email message; ordinary service/product inquiries stay independent. No message is sent automatically. These features use native DOM events, the existing image assets and two additional Tabler symbols. They add no runtime dependency, animation loop, canvas or 3D request.

Run `npm run test:equipment-tools` for hotspots, keyboard selection, additions from all entry points, quantity bounds, notes, safe restoration, filtering/language/reload persistence, both intercepted app handoffs, empty state, 320–1440px RTL/LTR layouts and automated accessibility scans.

## Phone experience

`src/mobile.css` defines the phone layout at 640 px and below. The hero and open configurator use document flow, with readable copy, 44 px controls and no fixed-height overlap. All six solutions appear in a stable two-column grid. Catalog filters scroll horizontally in a sticky toolbar. Product cards retain inspection and tray actions; individual inquiries are available in the inspection sheet. The room background remains static, and mobile sections render immediately without reveal delays.

`src/mobile.js` adds a bottom shortcut bar for solutions, products, the parts tray and quotes once the hero is out of view. IntersectionObserver tracks boundaries; there is no scroll listener or animation loop. The bar respects the device safe area, carries the tray count, moves focus to section headings or opens the parts drawer, and hides behind open menus/dialogs or while editing fields. Quote and inspection dialogs become full-width bottom sheets. Form fields use at least 16 px type; quantity controls and range inputs have larger interaction surfaces. Reduced-motion settings disable sheet transitions.

Touch devices default to the lightweight room preview, including on phones with missing or high hardware hints. The existing Enable 3D button explicitly opts into the renderer, and a saved user preference is retained. This change introduces no dependencies or new images.

Run `npm run test:mobile` for emulated phone touch interactions at 4× CPU slowdown, 320–430 px Arabic/English layouts, navigation and modal focus, stable gallery sizing, readable input text, quote and tray flows, accessibility, zero automatic engine requests and explicit 3D activation/disposal. These are browser simulations, not measurements on physical iPhones or Android devices.

### Expanded room and parts drawer

**Explore room** opens a full-screen phone workspace containing the actual room controls, view tabs, temperature presets and dimensioned blueprint. Horizontal touch swipes change lightweight model views; vertical scrolling remains native. The dimensions button opens the existing configurator. Closing the workspace restores the original controls, selected view, focus and page position without duplicating state. Opting into 3D retains the existing drag controls.

The catalog has immediate, local Arabic/English search across the eight categories, including common Arabic aliases and diacritic-insensitive matching. Search combines with category filters, survives language changes, and offers a clear reset and inquiry path when no category matches. No search requests or runtime library are added.

Phone tray links and the **Review tray** action on added-item feedback open a native bottom drawer over the current browsing position. It contains the original quantity/note controls and inquiry button. Closing a quote returns to the tray; **Keep browsing**, Escape, the close button or a downward swipe on the drawer grip returns to the catalog. Resizing beyond the phone breakpoint restores the original inline layout. Native dialog focus containment and scroll locking stay intact.

`src/phone-panels.js` manages the temporary DOM moves and `src/phone-tools.css` styles the workspace, drawer and search. There are no additional images, dependencies, ambient animations, continuous frame loops or automatic 3D requests. Run `npm run test:phone-tools` for touch swipes, door/blueprint state, 320–430 px short-screen layouts, repeated restoration, bilingual search, drawer quantities and notes, both intercepted message handoffs, quote return, saved browsing position, dismissal, resize cleanup and accessibility. This uses Chromium touch emulation at 4× CPU slowdown; it is not a physical-device benchmark.

## Current validation

The interactive, quotation, visual-behavior and low-end performance behavior suites pass. The earlier local simulated-mobile initial-navigation audit (before the installation/tray features) scored **96 performance, 100 accessibility, 100 best practices and 100 SEO**, with 2.6 s largest contentful paint, 0 ms total blocking time and 0.005 layout shift. The report is `test-results/lighthouse-speed-after.json`; the pre-change audit is `test-results/lighthouse-speed-before.json`. Initial navigation metrics were unchanged in these runs; this pass reduced interaction and rendering work. The 3D engine activates only on deliberate interaction; navigation scores do not measure interactive GPU frame rate. Rendering and low-end interactions are tested separately.

## Our work and company facts

`#projects` shows four case cards on a navy band: the 4,800-ton cold store (five photographs), water chillers, cooling towers, and workshop-to-site work (four photographs). Each card has a large photograph with its own thumbnails, a short description, the company's own figures where they exist, and a quote button that preselects the matching service. Any photograph opens a full-size viewer that browses all eleven with buttons, RTL-aware arrow keys, swipes and focus return. `src/projects.js`, `src/projects.css`; run `npm run test:projects`. Five come from the upload accompanying the post "من اعمال الشركه براد 4800 طن" and are presented as that project; the other captions describe only what each photograph shows. Originals are in `source-photos/facebook/` with their Facebook photo ids in `scripts/build-site-photos.py`, which also builds the water-chiller and cooling-tower service images. Photos showing people or client brands were left out. The page also states the company's own "25+ years" figure, its landline, and links to Facebook and Instagram, which are listed as `sameAs` in the structured data.

## Maintenance request, WhatsApp channel and FAQ

`#repair` ("عطل في غرفة التبريد؟") lets a visitor tick the problems they see, the equipment type and whether goods are inside, then enter their area. It opens WhatsApp with a structured message in the language on screen and asks for a photo; nothing is sent automatically, and a direct call link sits beside it (`src/repair.js`, `src/repair.css`; run `npm run test:repair`). The company's WhatsApp channel is linked from the contact section and footer. `/faq/` and `/en/faq/` answer ten common questions using only facts the company has published (sources are listed in `scripts/seo/faq.js`); the company should approve the wording before launch.

## Search and bilingual static pages

The Vite build emits 18 static pages: Arabic and English homepages, six service guides in each language, an FAQ at `/faq/` and `/en/faq/`, and a privacy notice at `/privacy/` and `/en/privacy/` (text in `scripts/seo/privacy.js`; it describes only what the site does, so update it and its date before adding analytics, ad pixels or any server-side form). Catalog content and service links are present before JavaScript executes. The guides contain no executable JavaScript and use the existing local fonts, icons and company photos.

`SITE_URL` controls production canonical URLs, reciprocal hreflang links, absolute sharing metadata, business/service structured data and the XML sitemap. Until the permanent domain is configured, output is a noindex preview with no sitemap. `SEO_REQUIRE_DOMAIN=1` makes a missing domain fail the production build. Read [SEO.md](SEO.md) for the verified implementation, configuration, Google Search Console launch steps and limits. Run `npm run test:seo` for static output and browser checks.

## Security

The build emits a strict Content Security Policy, anti-framing, anti-hotlinking, isolation and HTTPS headers, a `security.txt` and crawler rules. The preview server sends the same headers. Read [SECURITY.md](SECURITY.md) for the policy, the Cloudflare and account settings required at launch, and its limits. Run `npm run test:security` with the preview server running.
