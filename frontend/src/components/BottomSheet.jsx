import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { typography, radii } from '@ds/tokens';

const NAV_BAR_HEIGHT_PX = 72;

/**
 * BottomSheet - Reusable bottom sheet that renders in a portal to document.body.
 * Sits above the nav bar (z-index 9999), with padding for nav bar + safe area,
 * so content is never clipped by the bottom navigation.
 */
const BottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
  /** Optional: custom header node (e.g. title + Close button); when set, title prop is ignored */
  header,
  showDragHandle = true,
  /** Optional: custom content wrapper style overrides */
  contentStyle = {},
}) => {
  const [animatedIn, setAnimatedIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimatedIn(false);
      const raf = requestAnimationFrame(() => setAnimatedIn(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setAnimatedIn(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const backdrop = (
    <div
      role="presentation"
      onClick={onClose}
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 9998,
        animation: 'bottomSheetFadeIn 0.2s ease',
      }}
      aria-hidden="true"
    />
  );

  const sheet = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : undefined}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        margin: '0 auto',
        maxWidth: '390px',
        width: '100%',
        background: '#fff',
        borderTopLeftRadius: radii.xl || '16px',
        borderTopRightRadius: radii.xl || '16px',
        padding: `12px 16px calc(${NAV_BAR_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px))`,
        maxHeight: `calc(85vh - ${NAV_BAR_HEIGHT_PX}px)`,
        overflowY: 'auto',
        zIndex: 9999,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        transform: animatedIn ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        ...contentStyle,
      }}
    >
      {showDragHandle && (
        <div
          style={{
            width: '36px',
            height: '4px',
            background: 'rgba(0,0,0,0.15)',
            borderRadius: '2px',
            margin: '0 auto 12px',
            flexShrink: 0,
          }}
        />
      )}
      {header != null ? header : title != null && (
        <h2
          style={{
            fontFamily: typography.fonts.sans,
            fontSize: '16px',
            fontWeight: typography.weight.semibold,
            color: '#1f2937',
            marginBottom: '10px',
            flexShrink: 0,
          }}
        >
          {title}
        </h2>
      )}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{children}</div>
      <style>{`
        @keyframes bottomSheetFadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );

  return createPortal(
    <>
      {backdrop}
      {sheet}
    </>,
    document.body
  );
};

export default BottomSheet;
export { NAV_BAR_HEIGHT_PX };
