import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppProvider, LanguageProvider, ChatProvider } from './contexts'
import ErrorBoundary from './components/ErrorBoundary'
import { registerSW } from 'virtual:pwa-register'
import { globalStyles, googleFontsUrl } from '@ds/tokens'

// Inject global styles from design system
const styleEl = document.createElement('style');
styleEl.textContent = globalStyles;
document.head.appendChild(styleEl);

// Load Google Fonts from design system
const linkEl = document.createElement('link');
linkEl.rel = 'stylesheet';
linkEl.href = googleFontsUrl;
document.head.appendChild(linkEl);

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <LanguageProvider>
          <ChatProvider farmerId="default">
            <App />
          </ChatProvider>
        </LanguageProvider>
      </AppProvider>
    </ErrorBoundary>
  </StrictMode>,
)
