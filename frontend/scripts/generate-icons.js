/**
 * Generate favicon.ico and PWA icons from favicon.svg.
 * Run from frontend dir: node scripts/generate-icons.js
 * Requires: npm install -D sharp to-ico --legacy-peer-deps
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';
import toIco from 'to-ico';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const svgPath = join(publicDir, 'favicon.svg');

async function main() {
  const svg = readFileSync(svgPath);

  // Favicon ICO (32x32)
  const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
  const ico = await toIco([png32]);
  writeFileSync(join(publicDir, 'favicon.ico'), ico);
  console.log('Wrote public/favicon.ico');

  // PWA icons
  const sizes = [
    [192, 'icon-192x192.png'],
    [512, 'icon-512x512.png'],
    [180, 'apple-touch-icon.png'],
  ];
  for (const [size, name] of sizes) {
    await sharp(svg).resize(size, size).png().toFile(join(publicDir, name));
    console.log('Wrote public/' + name);
  }

  // iOS splash (from splash.svg)
  const splashSvgPath = join(publicDir, 'splash.svg');
  try {
    const splashSvg = readFileSync(splashSvgPath);
    await sharp(splashSvg)
      .resize(1170, 2532)
      .png()
      .toFile(join(publicDir, 'splash.png'));
    console.log('Wrote public/splash.png');
  } catch (e) {
    console.warn('Skipped splash.png (splash.svg not found or invalid):', e.message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
