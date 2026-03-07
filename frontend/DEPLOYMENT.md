# Piritiya Frontend Deployment Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Access to hosting platform (Netlify, Vercel, AWS S3, etc.)

## Environment Configuration

### 1. Create Environment Files

Copy `.env.example` to create environment-specific files:

```bash
# Development
cp .env.example .env.development

# Production
cp .env.example .env.production
```

### 2. Configure Environment Variables

Edit `.env.production` with your production values:

```env
# API Configuration
VITE_API_BASE_URL=https://your-api-id.execute-api.region.amazonaws.com/prod

# App Configuration
VITE_APP_NAME=Piritiya
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_VOICE=true
VITE_ENABLE_OFFLINE=true

# Cache Configuration
VITE_CACHE_SIZE_LIMIT_MB=50
VITE_SESSION_TIMEOUT_HOURS=24

# Production
VITE_DEV_MODE=false
VITE_LOG_LEVEL=error
```

## Build Process

### Development Build

```bash
npm run dev
```

This starts the development server at `http://localhost:5173`

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests with UI

```bash
npm run test:ui
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

## Deployment Options

### Option 1: Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. Configure redirects for SPA routing:
   Create `public/_redirects`:
   ```
   /*    /index.html   200
   ```

### Option 2: Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

### Option 3: AWS S3 + CloudFront

1. Build the app:
   ```bash
   npm run build
   ```

2. Upload to S3:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. Invalidate CloudFront cache:
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
   ```

### Option 4: GitHub Pages

1. Install gh-pages:
   ```bash
   npm install -D gh-pages
   ```

2. Add to package.json scripts:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

## PWA Installation Testing

### Android

1. Open the deployed URL in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home screen"
4. Confirm installation

### iOS

1. Open the deployed URL in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Confirm installation

### Desktop

1. Open the deployed URL in Chrome/Edge
2. Look for the install icon in the address bar
3. Click to install

## Performance Optimization Checklist

- [ ] Enable gzip/brotli compression on server
- [ ] Configure proper cache headers
- [ ] Enable HTTP/2
- [ ] Set up CDN for static assets
- [ ] Configure service worker caching
- [ ] Test on 3G network throttling
- [ ] Run Lighthouse audit (target: 90+ performance)

## Post-Deployment Verification

1. **PWA Installation**: Test installation on Android and iOS
2. **Offline Mode**: Enable airplane mode and verify app works
3. **Voice Features**: Test voice input and output in Hindi and English
4. **Network Throttling**: Test on slow 3G connection
5. **Accessibility**: Run axe-core audit
6. **Performance**: Run Lighthouse audit

## Monitoring

### Key Metrics to Monitor

- First Contentful Paint (FCP) < 2s
- Time to Interactive (TTI) < 5s
- Bundle size < 200KB gzipped
- Service worker registration success rate
- API response times
- Error rates

### Recommended Tools

- Google Analytics for user analytics
- Sentry for error tracking
- Lighthouse CI for performance monitoring
- Web Vitals for Core Web Vitals tracking

## Troubleshooting

### Service Worker Not Registering

- Check browser console for errors
- Verify HTTPS is enabled (required for service workers)
- Clear browser cache and reload

### PWA Not Installing

- Verify manifest.json is accessible
- Check all required icons are present
- Ensure HTTPS is enabled
- Verify service worker is registered

### Voice Features Not Working

- Check browser compatibility (Chrome/Edge recommended)
- Verify microphone permissions
- Test on HTTPS (required for Web Speech API)

### Offline Mode Issues

- Check IndexedDB is not blocked
- Verify service worker caching strategy
- Check network requests in DevTools

## Security Considerations

- Always use HTTPS in production
- Configure Content Security Policy (CSP)
- Enable CORS only for trusted domains
- Sanitize user inputs
- Don't store sensitive data in IndexedDB
- Implement rate limiting on API

## Support

For issues or questions:
- Check the main README.md
- Review the troubleshooting guide
- Contact the development team
