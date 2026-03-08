/**
 * Voice feedback sounds: start and completion beeps via Web Audio API.
 * No external assets; works offline. Call after user gesture (e.g. tap).
 */

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioContext;
}

/**
 * Play a short beep for voice feedback.
 * @param type - 'start': soft beep when recording starts; 'complete': when response is ready
 */
export function playVoiceBeep(type: 'start' | 'complete'): void {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'start') {
      oscillator.frequency.value = 280;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.07);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.07);
    } else {
      oscillator.frequency.value = 400;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.18, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    }
  } catch {
    // Ignore if Web Audio fails (e.g. suspended context)
  }
}
