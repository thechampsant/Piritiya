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

function App() {
  const { state, isLoading } = useApp();
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
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
            <ChatScreen />
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
