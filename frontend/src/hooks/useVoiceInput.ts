import { useState, useEffect, useRef, useCallback } from 'react';
import type { Language } from '../types';
import { apiClient } from '../services/APIClient';
import { playVoiceBeep } from '../utils/voiceSounds';

const FREQUENCY_BARS = 12;
const FFT_SIZE = 256;

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
}

export type VoiceOrbState = 'IDLE' | 'RECORDING' | 'TRANSCRIBING' | 'THINKING' | 'SUCCESS' | 'ERROR';

interface UseVoiceInputReturn {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  error: Error | null;
  recordingStartedAt: number | null;
  frequencyData: number[];
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  /** When useBackend: full pipeline state for orb animation (RECORDING → TRANSCRIBING → THINKING → SUCCESS → IDLE) */
  orbState: VoiceOrbState;
  /** Abort in-flight transcribe/chat and return to IDLE (only relevant when orbState is TRANSCRIBING or THINKING) */
  cancelVoicePipeline: () => void;
}

export interface UseVoiceInputOptions {
  /** When true and online, use backend (Amazon Transcribe) instead of Web Speech API */
  useBackend?: boolean;
  /** When useBackend: called with transcript to get chat response; pipeline stays in THINKING until this resolves */
  sendMessage?: (text: string, options?: { signal?: AbortSignal }) => Promise<unknown>;
  /** When useBackend: called after SUCCESS state before returning to IDLE (e.g. navigate to chat) */
  onComplete?: () => void;
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

/**
 * Custom hook for voice input using Web Speech API or backend (Amazon Transcribe)
 * Handles speech recognition with browser compatibility detection
 *
 * @param language - Language locale ('hi' for Hindi, 'en' for English)
 * @param options - useBackend: when true and online, record and send to backend for transcription
 * @returns Voice input state and control functions
 */
export function useVoiceInput(
  language: Language,
  options: UseVoiceInputOptions = {}
): UseVoiceInputReturn {
  const { useBackend = false, sendMessage: sendMessageOpt, onComplete } = options;
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [frequencyData, setFrequencyData] = useState<number[]>([]);
  const [orbState, setOrbState] = useState<VoiceOrbState>('IDLE');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  /** When using streaming transcribe: handle and last final transcript. */
  const transcribeStreamRef = useRef<{
    sendChunk: (chunk: ArrayBuffer) => void;
    sendEnd: () => void;
    onTranscript: (cb: (event: { type: 'partial' | 'final'; transcript: string }) => void) => void;
    lastFinal: string;
  } | null>(null);

  // Check browser compatibility on mount
  useEffect(() => {
    if (useBackend) {
      const hasMediaRecorder = typeof window !== 'undefined' && !!window.MediaRecorder;
      const hasGetUserMedia =
        typeof navigator !== 'undefined' &&
        !!navigator.mediaDevices?.getUserMedia;
      const supported = !!(hasMediaRecorder && hasGetUserMedia);
      setIsSupported(supported);
      if (!supported) {
        setError(new Error('Recording not supported in this browser'));
      }
    } else {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognitionAPI();
      } else {
        setIsSupported(false);
        setError(new Error('Speech recognition is not supported in this browser'));
      }
    }
  }, [useBackend]);

  // Configure recognition when language changes (Web Speech path only)
  useEffect(() => {
    if (useBackend || !recognitionRef.current) return;

    const recognition = recognitionRef.current;

    // Map language to locale
    const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.lang = locale;

    // Configure for better UX on slow networks
    recognition.continuous = false;
    recognition.interimResults = false;

    // Handle recognition results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const lastResult = results[results.length - 1];

      if (lastResult.isFinal) {
        const transcribedText = lastResult[0].transcript;
        setTranscript(transcribedText);
        setError(null);
      }
    };

    // Handle recognition errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'Speech recognition error';

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not available. Please check your device.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'aborted':
          // User stopped recording, not an error
          return;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      setError(new Error(errorMessage));
      setIsListening(false);
      setRecordingStartedAt(null);
      vibrate([100, 50, 100, 50, 100]);
    };

    // Handle recognition end
    recognition.onend = () => {
      setIsListening(false);
      setRecordingStartedAt(null);
    };

    // Handle recognition start
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setRecordingStartedAt(Date.now());
      vibrate(50);
      playVoiceBeep('start');
    };
  }, [language, useBackend]);

  // Waveform: rAF loop when recording (backend path with analyser)
  useEffect(() => {
    if (!isListening || !useBackend || !analyserRef.current) return;
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      if (!analyserRef.current) return;
      analyser.getByteFrequencyData(dataArray);
      const step = Math.floor(dataArray.length / FREQUENCY_BARS);
      const bars: number[] = [];
      for (let i = 0; i < FREQUENCY_BARS; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) sum += dataArray[i * step + j] ?? 0;
        bars.push(Math.min(255, Math.round(sum / step)));
      }
      setFrequencyData(bars);
      rafIdRef.current = requestAnimationFrame(tick);
    };
    rafIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setFrequencyData([]);
    };
  }, [isListening, useBackend]);

  // Error auto-reset after 3s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(t);
  }, [error]);

  // Start listening function
  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError(new Error(useBackend ? 'Recording not supported' : 'Speech recognition is not supported'));
      return;
    }

    if (isListening) {
      return; // Already listening
    }

    if (useBackend) {
      try {
        setTranscript('');
        setError(null);
        setOrbState('RECORDING');
        setIsListening(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunksRef.current = [];

        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = FFT_SIZE;
        analyser.smoothingTimeConstant = 0.8;
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
        audioContextRef.current = ctx;
        analyserRef.current = analyser;

        const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        // Optional: open streaming transcribe so TRANSCRIBING shows while still recording
        const languageCode = language === 'hi' ? 'hi-IN' : 'en-IN';
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const signal = controller.signal;
        apiClient
          .openTranscribeStream(languageCode, { signal, sampleRate: 16000 })
          .then((handle) => {
            if (signal.aborted || !audioContextRef.current || !source) return;
            transcribeStreamRef.current = { ...handle, lastFinal: '' };
            setOrbState('TRANSCRIBING');
            handle.onTranscript((ev) => {
              if (ev.type === 'final' && transcribeStreamRef.current)
                transcribeStreamRef.current.lastFinal = ev.transcript;
              setTranscript((prev) => (ev.type === 'final' ? ev.transcript : prev + ev.transcript));
            });
            const ctx = audioContextRef.current;
            const sampleRate = ctx.sampleRate;
            const ratio = sampleRate / 16000;
            const bufferLength = 4096;
            const processor = ctx.createScriptProcessor(bufferLength, 1, 1);
            processor.onaudioprocess = (e: AudioProcessingEvent) => {
              const ref = transcribeStreamRef.current;
              if (!ref) return;
              const input = e.inputBuffer.getChannelData(0);
              const outLength = Math.floor(input.length / ratio);
              const pcm = new Int16Array(outLength);
              for (let i = 0; i < outLength; i++) {
                const src = input[Math.min(Math.floor(i * ratio), input.length - 1)];
                pcm[i] = Math.max(-32768, Math.min(32767, Math.floor(src * 32767)));
              }
              ref.sendChunk(pcm.buffer);
            };
            source.connect(processor);
            processor.connect(ctx.destination);
            (processor as unknown as { _piritiyaDisconnect: () => void })._piritiyaDisconnect = () => {
              processor.disconnect();
              source.disconnect(processor);
            };
            (transcribeStreamRef.current as unknown as { _processor?: ScriptProcessorNode })._processor = processor;
          })
          .catch(() => {
            transcribeStreamRef.current = null;
          });

        recorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          mediaRecorderRef.current = null;
          setIsListening(false);
          setRecordingStartedAt(null);
          setFrequencyData([]);
          const streamRef = transcribeStreamRef.current;
          if (streamRef) {
            const proc = (streamRef as unknown as { _processor?: ScriptProcessorNode & { _piritiyaDisconnect?: () => void } })._processor;
            if (proc?._piritiyaDisconnect) proc._piritiyaDisconnect();
            streamRef.sendEnd();
            transcribeStreamRef.current = null;
          }
          if (audioContextRef.current) {
            try {
              await audioContextRef.current.close();
            } catch {
              // ignore
            }
            audioContextRef.current = null;
          }
          analyserRef.current = null;
          vibrate([50, 50, 50]);
          const blob = new Blob(chunksRef.current, { type: mime });
          const languageCode = language === 'hi' ? 'hi-IN' : 'en-IN';
          if (!streamRef && chunksRef.current.length === 0) {
            setOrbState('IDLE');
            return;
          }
          if (!streamRef) {
            abortControllerRef.current = controller;
          }
          const signal = controller.signal;
          if (!streamRef) setOrbState('TRANSCRIBING');
          setIsProcessing(true);
          setError(null);

          const handleAbort = () => {
            setOrbState('IDLE');
            setIsProcessing(false);
            abortControllerRef.current = null;
          };
          const handleError = (err: Error) => {
            setError(err);
            setOrbState('ERROR');
            vibrate([100, 50, 100, 50, 100]);
            setIsProcessing(false);
            abortControllerRef.current = null;
            setTimeout(() => setOrbState('IDLE'), 2000);
          };

          try {
            let text: string;
            if (streamRef) {
              await delay(700, signal);
              if (signal.aborted) {
                handleAbort();
                return;
              }
              text = (streamRef.lastFinal || '').trim() || (await apiClient.transcribeAudio(blob, languageCode, { signal }).then((r) => r.transcript || '')) || '';
            } else {
              const result = await apiClient.transcribeAudio(blob, languageCode, { signal });
              text = result.transcript || '';
            }
            setTranscript(text);
            if (signal.aborted) {
              handleAbort();
              return;
            }
            await delay(800, signal);
            if (signal.aborted) {
              handleAbort();
              return;
            }
            setOrbState('THINKING');
            if (!sendMessageOpt) {
              setOrbState('SUCCESS');
              await delay(1000);
              onComplete?.();
              setOrbState('IDLE');
              setIsProcessing(false);
              abortControllerRef.current = null;
              return;
            }
            await sendMessageOpt(text, { signal });
            if (signal.aborted) {
              handleAbort();
              return;
            }
            setOrbState('SUCCESS');
            await delay(1000, signal);
            if (signal.aborted) {
              handleAbort();
              return;
            }
            onComplete?.();
            setOrbState('IDLE');
            setIsProcessing(false);
            abortControllerRef.current = null;
          } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
              handleAbort();
              return;
            }
            handleError(err instanceof Error ? err : new Error('Request failed'));
            return;
          }
        };

        recorder.onerror = () => {
          setError(new Error('Recording failed'));
          setIsListening(false);
          setRecordingStartedAt(null);
          vibrate([100, 50, 100, 50, 100]);
        };

        recorder.start(100);
        setRecordingStartedAt(Date.now());
        vibrate(50);
        playVoiceBeep('start');
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to start recording'));
        setIsListening(false);
        setRecordingStartedAt(null);
        vibrate([100, 50, 100, 50, 100]);
      }
      return;
    }

    // Web Speech path
    if (!recognitionRef.current) return;
    try {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start speech recognition');
      setError(error);
      setIsListening(false);
      vibrate([100, 50, 100, 50, 100]);
    }
  }, [isSupported, isListening, useBackend, language, sendMessageOpt, onComplete]);

  // Stop listening function
  const stopListening = useCallback(() => {
    if (!isListening) return;

    if (useBackend && mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      return;
    }

    if (!useBackend && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to stop speech recognition');
        setError(error);
      }
    }
  }, [isListening, useBackend]);

  // Abort in-flight transcribe/chat and return orb to IDLE
  const cancelVoicePipeline = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setOrbState('IDLE');
    setIsProcessing(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (useBackend && mediaRecorderRef.current?.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (err) {
          // Ignore cleanup errors
        }
      }
      if (!useBackend && recognitionRef.current && isListening) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    };
  }, [isListening, useBackend]);

  return {
    isListening,
    isProcessing,
    transcript,
    error,
    recordingStartedAt,
    frequencyData,
    startListening,
    stopListening,
    isSupported,
    orbState,
    cancelVoicePipeline,
  };
}
