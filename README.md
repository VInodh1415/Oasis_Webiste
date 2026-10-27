# OASIS RMS website

A static, dependency-free site: plain HTML, CSS and JavaScript. Open `index.html` in a browser, or host the folder on any static host (Netlify, Vercel, S3, Azure Static Web Apps, cPanel).

## Pages
- `index.html`: Home
- `features.html`: Features, with filters (Ordering system, Kitchen Ops, Insights)
- `pricing.html`: Plans with a monthly/yearly switch, a comparison table and the FAQ
- `contact.html`: The 30-minute demo form and contact details

## Files
- `assets/css/styles.css`: All styles. Brand colours are tokens at the top (`--brand: #2456F0`).
- `assets/js/main.js`: The motion and interactions.
- `assets/img/`: The logo, favicon, partner logos and product screens (WebP).

## Motion
Everything respects `prefers-reduced-motion`.
- **Hero:** fades up on load. The floating cards bob gently. The live order card loops Sent → Preparing → Ready → Served.
- **Scrolling:** sections fade up as you scroll, cards stagger in, and section headings rise word by word.
- **Follow one order:** auto-advances every 3.2 s. Hover pauses it, and you can click a step or use the arrow keys to jump.
- **Feature chips:** two rows scroll in a loop, and pause on hover.
- **Small touches:**
  - stat numbers count up
  - the "24–48 h" arc draws itself
  - buttons slide their arrow on hover

## Before going live
1. **Demo form.** It validates and shows a thank-you card, but it doesn't send anything yet. Connect it in `assets/js/main.js`; search for `TODO`.
2. **Placeholders.** Replace everything marked with `[ ]` or the `ph` class: plan names, prices, inclusions, the comparison table, the partner quote, and the FAQ answers marked [Confirm …].
3. **Social and legal links.** These are `#` in the footer.
4. **Captain app screens.** Swap in higher-resolution exports: `captain-tables.webp` and `captain-menu.webp` are only 234 px wide.
5. **Search preview.** Optionally add an Open Graph image and analytics.

Fonts: DM Sans, from Google Fonts.
