# Design System Integration - Build Configuration

This document describes the build system configuration for integrating the piritiya-design-system with the frontend application.

## Overview

The build system has been configured to:
1. Resolve imports from `../piritiya-design-system/src/` using the `@ds` alias
2. Compile JSX files from the design system
3. Create separate bundle chunks for the design system
4. Provide TypeScript type definitions for all design system modules

## Configuration Files

### 1. Vite Configuration (`vite.config.ts`)

**Path Alias:**
```typescript
resolve: {
  alias: {
    '@ds': path.resolve(__dirname, '../piritiya-design-system/src'),
  },
}
```

**React Plugin Configuration:**
- Configured to process `.jsx` and `.js` files from the design system
- Includes all TypeScript and JavaScript files in the compilation

**Optimization:**
```typescript
optimizeDeps: {
  include: ['react', 'react-dom', 'react/jsx-runtime'],
}
```

**Build Configuration:**
- Creates separate chunks for design system code
- Bundles design system separately from vendor code
- Target: ES2015 for broad browser compatibility

**Manual Chunks:**
```typescript
manualChunks: (id) => {
  if (id.includes('piritiya-design-system')) {
    return 'design-system';
  }
  if (id.includes('node_modules')) {
    return 'vendor';
  }
}
```

### 2. TypeScript Configuration (`tsconfig.app.json`)

**Path Mapping:**
```json
{
  "baseUrl": ".",
  "paths": {
    "@ds/*": ["../piritiya-design-system/src/*"]
  }
}
```

This allows TypeScript to resolve `@ds` imports and provide IntelliSense.

### 3. Type Declarations (`src/types/design-system.d.ts`)

Comprehensive TypeScript declarations for all design system modules:

**Modules:**
- `@ds/components` - React components (VoiceOrb, PillChip, FrostedCard, etc.)
- `@ds/tokens` - Design tokens (colors, typography, spacing, etc.)
- `@ds/icons` - Icon components (Mic, Wheat, Leaf, etc.)
- `@ds/i18n` - Internationalization utilities (getTranslation, toLocalNum, LANGUAGES)

**Example Usage:**
```typescript
import { colors, typography } from '@ds/tokens';
import { VoiceOrb, PillChip } from '@ds/components';
import { Mic, Wheat } from '@ds/icons';
import { getTranslation, LANGUAGES } from '@ds/i18n';
```

### 4. Vite Environment Types (`src/vite-env.d.ts`)

Added type references for:
- Vite client types
- PWA plugin types

## Usage

### Importing Design System Modules

```typescript
// Import tokens
import { colors, typography, spacing, radii } from '@ds/tokens';

// Import components
import { VoiceOrb, PillChip, FrostedCard, AmbientBg } from '@ds/components';

// Import icons
import { Mic, Send, Wheat, Leaf, Settings } from '@ds/icons';

// Import i18n utilities
import { getTranslation, toLocalNum, LANGUAGES } from '@ds/i18n';
```

### Example Component

```typescript
import React from 'react';
import { colors, typography } from '@ds/tokens';
import { VoiceOrb } from '@ds/components';
import { Mic } from '@ds/icons';

export const MyComponent: React.FC = () => {
  return (
    <div style={{ background: colors.bg.base }}>
      <h1 style={{ fontFamily: typography.fonts.serif }}>
        Hello World
      </h1>
      <VoiceOrb isListening={false} onPress={() => {}} />
      <Mic size={24} color={colors.green.default} />
    </div>
  );
};
```

## Build Output

When running `npm run build`, the build system:
1. Compiles TypeScript and JSX files
2. Creates separate chunks:
   - `design-system-*.js` - Design system code
   - `vendor-*.js` - Node modules
   - `index-*.js` - Application code
3. Generates service worker for PWA functionality
4. Outputs to `dist/` directory

## Verification

To verify the configuration:

```bash
# Type check
npx tsc --noEmit

# Build
npm run build

# Development server
npm run dev
```

All commands should complete successfully without errors related to design system imports.

## Requirements Satisfied

- **Requirement 20.1**: Vite configured to resolve imports from `../piritiya-design-system/src/` using `@ds` alias ✓
- **Requirement 20.2**: Design system modules successfully bundled when imported via `@ds` ✓
- **Requirement 20.3**: TypeScript compilation maintained for `.tsx` files ✓
- **Requirement 20.4**: JSX compilation supported for design system `.jsx` files ✓
- **Requirement 37.1**: TypeScript declarations created for design system modules ✓
- **Requirement 37.2**: Modules declared for `@ds/components`, `@ds/tokens`, `@ds/icons`, `@ds/i18n` ✓

## Notes

- The design system is located at `../piritiya-design-system/` relative to the frontend directory
- All design system files are JSX/JS (not TypeScript)
- Type definitions are provided via `src/types/design-system.d.ts`
- The build system creates a separate chunk for design system code to optimize caching
- React and React DOM are included in optimizeDeps to ensure proper resolution for design system components
