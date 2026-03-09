# PWA Icons and Splash

## Brand Colors

- **Primary green:** `#1a4731`
- **Secondary green:** `#2d6a4f`
- **Accent saffron:** `#f4a261`
- **White:** `#ffffff`

All icons and the splash screen use this palette.

## Source Assets

- **favicon.svg** — 32×32 viewBox, rounded green square, white seedling mark, saffron accent dot. This is the single source for favicon.ico and PWA PNG icons.
- **splash.svg** — 1170×2532 viewBox for iOS splash (gradient, logo, “Piritiya”, “Kisan ka Sathi”, “Powered by AWS”).

## Required Output Files

| File | Size | Purpose |
|------|------|--------|
| `favicon.ico` | 32×32 | Browser tab / legacy favicon |
| `favicon.svg` | 32×32 | Modern favicon (vector) |
| `icon-192x192.png` | 192×192 | PWA icon |
| `icon-512x512.png` | 512×512 | PWA icon (and maskable) |
| `apple-touch-icon.png` | 180×180 | iOS home screen |
| `splash.png` | 1170×2532 | iOS startup splash |

## Generating Icons

### Node script (recommended)

From the `frontend` directory, using the project’s `sharp` and `to-ico` dev dependencies:

```bash
node scripts/generate-icons.js
```

This produces:

- `public/favicon.ico` from `favicon.svg`
- `public/icon-192x192.png`, `public/icon-512x512.png`, `public/apple-touch-icon.png` from `favicon.svg`
- `public/splash.png` from `public/splash.svg`

Install deps if needed:

```bash
npm install -D sharp to-ico --legacy-peer-deps
```

### ImageMagick (alternative)

```bash
cd public
# Favicon and PNG icons from favicon.svg
convert -background none favicon.svg -resize 32x32 favicon.ico
convert -background none favicon.svg -resize 192x192 icon-192x192.png
convert -background none favicon.svg -resize 512x512 icon-512x512.png
convert -background none favicon.svg -resize 180x180 apple-touch-icon.png
# iOS splash from splash.svg
convert -background none splash.svg -resize 1170x2532 splash.png
```

### Online tools

- [realfavicongenerator.net](https://realfavicongenerator.net/) — upload PNG/SVG for favicon and app icons
- [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator) — PWA icons

## Design Guidelines

- Use the seedling mark (stem + two leaves + soil) from `favicon.svg` for consistency.
- Maskable 512×512: keep important content within ~80% of the canvas (safe zone).
- Test on light and dark backgrounds and in browser/PWA install UI.
