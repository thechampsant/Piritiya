import { useState, useEffect, useRef } from 'react';

const SPLASH_DURATION_MS = 2000;
const FADE_IN_MS = 400;
const FADE_OUT_MS = 300;

type SplashScreenProps = {
  onDone: () => void;
};

/** White seedling mark for splash (matches PiritiyaMark, white on dark green). */
function SeedlingMark({ size = 80 }: { size?: number }) {
  const s = size / 32;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ display: 'block' }}>
      <line x1="16" y1="28" x2="16" y2="10" stroke="#ffffff" strokeWidth={2.2 * s} strokeLinecap="round" />
      <path d="M16 18 Q10 14 8 8 Q13 9 16 14" fill="#ffffff" opacity={0.95} />
      <path d="M16 15 Q22 11 24 5 Q19 6 16 11" fill="#ffffff" opacity={0.95} />
      <path d="M8 28 Q16 24 24 28" stroke="#ffffff" strokeWidth={2 * s} strokeLinecap="round" fill="none" opacity={0.5} />
    </svg>
  );
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const t1 = requestAnimationFrame(() => setVisible(true));
    let t3: ReturnType<typeof setTimeout> | null = null;
    const t2 = setTimeout(() => {
      setExiting(true);
      t3 = setTimeout(() => onDoneRef.current(), FADE_OUT_MS);
    }, SPLASH_DURATION_MS);
    return () => {
      cancelAnimationFrame(t1);
      clearTimeout(t2);
      if (t3 !== null) clearTimeout(t3);
    };
  }, []);

  return (
    <div
      role="presentation"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #2d6a4f 0%, #1a4731 100%)',
        opacity: exiting ? 0 : visible ? 1 : 0,
        transition: `opacity ${exiting ? FADE_OUT_MS : FADE_IN_MS}ms ease`,
        pointerEvents: exiting ? 'none' : 'auto',
      }}
    >
      {/* Ambient saffron blob */}
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          left: '50%',
          top: '40%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(244,162,97,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'splashBlob 9s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes splashBlob {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -48%) scale(1.1); opacity: 0.85; }
        }
      `}</style>

      {/* Center content */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#2d6a4f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          }}
        >
          <SeedlingMark size={48} />
        </div>
        <div style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 700, color: '#ffffff', letterSpacing: '2px' }}>
          Piritiya
        </div>
        <div style={{ width: 40, height: 2, background: '#f4a261', borderRadius: 1 }} />
        <div
          style={{
            fontFamily: "'Noto Sans Devanagari', sans-serif",
            fontSize: 16,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          किसान का साथी
        </div>
      </div>

      {/* Bottom: Powered by AWS */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 11,
          color: 'rgba(255,255,255,0.4)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        Powered by AWS
      </div>
    </div>
  );
}
