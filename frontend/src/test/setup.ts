import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Web Speech API
(global as any).SpeechRecognition = class SpeechRecognition {
  start() {}
  stop() {}
  abort() {}
  addEventListener() {}
  removeEventListener() {}
};

(global as any).webkitSpeechRecognition = (global as any).SpeechRecognition;

(global as any).speechSynthesis = {
  speak: () => {},
  cancel: () => {},
  pause: () => {},
  resume: () => {},
  getVoices: () => [],
  addEventListener: () => {},
  removeEventListener: () => {},
};

// Mock IndexedDB
(global as any).indexedDB = {
  open: () => ({
    onsuccess: null,
    onerror: null,
    result: {},
  }),
};
