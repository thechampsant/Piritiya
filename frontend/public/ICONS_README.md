# PWA Icons

## Required Icons

The following icon files need to be generated for the PWA:

- `icon-192x192.png` - 192x192 pixels
- `icon-512x512.png` - 512x512 pixels (also used as maskable icon)
- `apple-touch-icon.png` - 180x180 pixels
- `favicon.ico` - 32x32 pixels

## Generating Icons

You can use the `icon.svg` file as a base and generate PNG files using:

1. **Online tools:**
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator

2. **Command line (ImageMagick):**
   ```bash
   # Install ImageMagick if not already installed
   # brew install imagemagick (macOS)
   # apt-get install imagemagick (Ubuntu)
   
   # Generate icons
   convert icon.svg -resize 192x192 icon-192x192.png
   convert icon.svg -resize 512x512 icon-512x512.png
   convert icon.svg -resize 180x180 apple-touch-icon.png
   convert icon.svg -resize 32x32 favicon.ico
   ```

3. **Node.js (sharp):**
   ```bash
   npm install -g sharp-cli
   sharp -i icon.svg -o icon-192x192.png resize 192 192
   sharp -i icon.svg -o icon-512x512.png resize 512 512
   sharp -i icon.svg -o apple-touch-icon.png resize 180 180
   sharp -i icon.svg -o favicon.ico resize 32 32
   ```

## Design Guidelines

- Use simple, recognizable imagery (wheat/crop symbol)
- Ensure good contrast for visibility
- Test on both light and dark backgrounds
- Follow Material Design icon guidelines for maskable icons
- Maintain safe zone for maskable icons (80% of canvas)

## Current Status

Currently using placeholder SVG icon. Generate proper PNG icons before production deployment.
