import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppProvider, LanguageProvider, ChatProvider, useApp } from './contexts'
import ErrorBoundary from './components/ErrorBoundary'
import { registerSW } from 'virtual:pwa-register'
import { globalStyles, googleFontsUrl } from '@ds/tokens'

// Inject global styles from design system (guard against missing exports on reload)
if (typeof globalStyles === 'string') {
  const styleEl = document.createElement('style');
  styleEl.textContent = globalStyles;
  document.head.appendChild(styleEl);
}
if (typeof googleFontsUrl === 'string') {
  const linkEl = document.createElement('link');
  linkEl.rel = 'stylesheet';
  linkEl.href = googleFontsUrl;
  document.head.appendChild(linkEl);
}

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

/** Wrapper so ChatProvider receives farmerId from AppContext (set when user taps Start on onboarding). That ID is used for all API calls until the user logs out and signs in again (same or different farmer). Use 'default' when logged out so the app always receives a string and never breaks. */
function AppWithChat() {
  const { state } = useApp()
  return (
    <ChatProvider farmerId={state.farmerId || 'default'}>
      <App />
    </ChatProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <LanguageProvider>
          <AppWithChat />
        </LanguageProvider>
      </AppProvider>
    </ErrorBoundary>
  </StrictMode>,
)
