import { useState, useEffect } from 'react';
import { useApp } from './contexts';
import OnboardScreen from './screens/OnboardScreen';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import ExploreScreen from './screens/ExploreScreen';
import SettingsScreen from './screens/SettingsScreen';
import BottomNavigation from './screens/components/BottomNavigation';
import './App.css';

type Screen = 'onboard' | 'home' | 'chat' | 'explore' | 'settings';

type Language = 'hi' | 'en';

function BackendUnavailableBanner({ language, onRetry }: { language: Language; onRetry: () => void }) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 10,
        padding: '10px 16px',
        background: 'rgba(220, 38, 38, 0.12)',
        color: '#b91c1c',
        fontSize: '13px',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
      }}
      role="status"
    >
      {language === 'hi'
        ? 'बैकएंड उपलब्ध नहीं है — कुछ सुविधाएँ सीमित हो सकती हैं।'
        : 'Backend unavailable — some features may be limited.'}
      <span style={{ margin: '0 6px' }}>·</span>
      <button
        type="button"
        onClick={onRetry}
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          textDecoration: 'underline',
          cursor: 'pointer',
          fontSize: 'inherit',
          fontFamily: 'inherit',
        }}
      >
        {language === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}
      </button>
      <span style={{ margin: '0 6px' }}>·</span>
      <span style={{ opacity: 0.9 }}>
        {language === 'hi' ? 'सेटिंग में "ब्राउज़र आवाज़" चुनें' : 'Or use "browser voice" in Settings'}
      </span>
    </div>
  );
}

function App() {
  const { state, isLoading, retryBackendCheck } = useApp();
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboard');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!state.farmerId) {
        setCurrentScreen('onboard');
      } else if (currentScreen === 'onboard') {
        setCurrentScreen('home');
      }
    }
  }, [state.farmerId, isLoading, currentScreen]);

  const handleNavigate = (screen: Screen) => {
    if (screen !== 'onboard' && !state.farmerId) {
      setCurrentScreen('onboard');
      return;
    }
    setCurrentScreen(screen);
  };

  const handleOnboardComplete = () => {
    handleNavigate('home');
  };

  if (isLoading) {
    return (
      <div style={{
        width: '100%',
        height: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #f5f0e8 0%, #eef4ee 50%, #f8f8f6 100%)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(19,136,8,0.2)',
            borderTopColor: '#138808',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: 'rgba(20,30,16,0.5)', fontSize: '14px' }}>Loading Piritiya...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadePulse { 0%,100% { opacity:0.4 } 50% { opacity:1 } }
        @keyframes blob1 { 0%,100% { transform:translate(0,0) } 50% { transform:translate(15px,-20px) } }
        @keyframes blob2 { 0%,100% { transform:translate(0,0) } 50% { transform:translate(-20px,15px) } }
        @keyframes blob3 { 0%,100% { transform:translate(0,0) } 50% { transform:translate(-12px,22px) } }
        @keyframes orbIdle { 0%,100% { transform:scale(1) } 50% { transform:scale(1.04) } }
        @keyframes orbBreath { 0%,100% { transform:scale(1) } 50% { transform:scale(1.08) } }
        @keyframes orbIdleRing { 0%,100% { transform:scale(1); opacity:0.5 } 50% { transform:scale(1.08); opacity:0.15 } }
        @keyframes orbRipple { 0% { transform:scale(0.85); opacity:0.6 } 100% { transform:scale(1.7); opacity:0 } }
        @keyframes slideUp { from { transform:translateY(100%); opacity:0 } to { transform:translateY(0); opacity:1 } }
        @keyframes beetleWiggle { 0%,100% { transform:rotate(-8deg) } 25% { transform:rotate(8deg) } 50% { transform:rotate(-5deg) } 75% { transform:rotate(5deg) } }
        input::placeholder { color: rgba(0,0,0,0.3); }
        ::-webkit-scrollbar { display: none; }
        .sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0;
          margin: -1px; overflow: hidden; clip: rect(0,0,0,0);
          white-space: nowrap; border-width: 0;
        }
      `}</style>
      
      <div style={{
        width: '100%',
        maxWidth: '390px',
        height: '100dvh',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #f5f0e8 0%, #eef4ee 50%, #f8f8f6 100%)',
        display: 'flex',
        flexDirection: 'column',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}>
        {/* Grain texture overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.025,
          zIndex: 1,
          pointerEvents: 'none',
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
        }} />

        {/* Backend unavailable banner (only when online but backend unreachable) */}
        {currentScreen !== 'onboard' && state.isOnline && state.backendAvailable === false && (
          <BackendUnavailableBanner language={state.language} onRetry={retryBackendCheck} />
        )}

        {/* Main content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 2,
        }}>
          {currentScreen === 'onboard' && (
            <OnboardScreen onComplete={handleOnboardComplete} />
          )}
          {currentScreen === 'home' && (
            <HomeScreen onNavigate={handleNavigate} />
          )}
          {currentScreen === 'chat' && (
            <ChatScreen onNavigate={handleNavigate} />
          )}
          {currentScreen === 'explore' && (
            <ExploreScreen onNavigate={handleNavigate} />
          )}
          {currentScreen === 'settings' && (
            <SettingsScreen onNavigate={handleNavigate} />
          )}
        </div>

        {/* Bottom Navigation - hidden on OnboardScreen */}
        {currentScreen !== 'onboard' && (
          <BottomNavigation
            currentScreen={currentScreen}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </>
  );
}

export default App;
