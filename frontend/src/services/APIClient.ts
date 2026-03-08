import type {
  ChatRequest,
  ChatResponse,
  SoilMoistureData,
  CropAdviceResponse,
  MarketPricesResponse,
  GovtSchemesResponse,
} from '../types';
import { dbRepository } from './DBRepository';
import {
  API_BASE_URL,
  API_ENDPOINTS,
  getTranscribeStreamWsUrl,
  PREFETCH_KEYS,
  PREFETCH_TTL_CROP_MS,
  PREFETCH_TTL_GOVT_MS,
  PREFETCH_TTL_MARKET_MS,
  PREFETCH_TTL_SOIL_MS,
  MAX_RETRY_ATTEMPTS,
  RETRY_DELAY_MS,
  RETRY_BACKOFF_MULTIPLIER,
  API_TIMEOUT_MS,
} from '../utils/constants';

/**
 * APIClient - HTTP client for backend API with retry logic
 * Handles all communication with the FastAPI backend
 */
export class APIClient {
  private baseURL: string;
  private farmerId: string = '';
  private sessionId: string = '';

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Set farmer ID for request interceptor
   */
  setFarmerId(farmerId: string): void {
    this.farmerId = farmerId;
  }

  /**
   * Set session ID for request interceptor
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * Fetch with retry logic and timeout.
   * If options.signal is provided, the request aborts when that signal or the timeout fires.
   */
  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit & { signal?: AbortSignal } = {},
    retryCount: number = 0
  ): Promise<T> {
    const controller = new AbortController();
    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const { signal: _omit, ...rest } = options;
      const response = await fetch(url, {
        ...rest,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(rest.headers as Record<string, string>),
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      // Check if it's a timeout or network error
      const isNetworkError =
        error instanceof TypeError ||
        (error as Error).name === 'AbortError';

      // Retry on network errors
      if (isNetworkError && retryCount < MAX_RETRY_ATTEMPTS) {
        const delay = RETRY_DELAY_MS * Math.pow(RETRY_BACKOFF_MULTIPLIER, retryCount);
        await this.sleep(delay);
        return this.fetchWithRetry<T>(url, options, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Send chat message to backend (includes farmer_id so agent can use it for soil/crop etc.)
   * Backend returns SSE stream; this method consumes the stream and returns the full response.
   * Pass cachedPrefetch from getPrefetchData() so the agent can use cached data and skip Lambda calls.
   */
  async sendChatMessage(
    message: string,
    sessionId?: string,
    farmerIdOverride?: string,
    options?: { signal?: AbortSignal; cachedPrefetch?: Record<string, unknown> }
  ): Promise<ChatResponse> {
    return this.sendChatMessageStream(message, sessionId, farmerIdOverride, {
      ...options,
      onChunk: () => {},
    });
  }

  /**
   * Send chat message and stream response via SSE. Calls onChunk(delta) for each token; returns full ChatResponse when done.
   */
  async sendChatMessageStream(
    message: string,
    sessionId?: string,
    farmerIdOverride?: string,
    options?: {
      signal?: AbortSignal;
      cachedPrefetch?: Record<string, unknown>;
      onChunk: (delta: string) => void;
    }
  ): Promise<ChatResponse> {
    const request: ChatRequest = {
      message,
      session_id: sessionId || this.sessionId,
      farmer_id: farmerIdOverride ?? this.farmerId,
      cached_prefetch: options?.cachedPrefetch,
    };
    const url = `${this.baseURL}${API_ENDPOINTS.CHAT}`;
    const controller = new AbortController();
    if (options?.signal) options.signal.addEventListener('abort', () => controller.abort());
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Chat failed: ${res.status} ${res.statusText}`);
    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');
    const decoder = new TextDecoder();
    let full = '';
    let buffer = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6);
            if (payload === '[DONE]' || payload === '') continue;
            try {
              const obj = JSON.parse(payload) as { delta?: string };
              if (typeof obj.delta === 'string') {
                full += obj.delta;
                options?.onChunk(obj.delta);
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    return {
      response: full,
      session_id: request.session_id ?? this.sessionId,
      message: request.message ?? message,
    };
  }

  /**
   * Get valid prefetch cache for /chat (non-expired slots only). Pass to sendChatMessage/sendChatMessageStream as cachedPrefetch.
   */
  async getPrefetchData(): Promise<Record<string, unknown>> {
    return dbRepository.getValidPrefetch();
  }

  /**
   * Pre-fetch soil, crop, market, govt data and cache in IndexedDB with TTL. Call on app open when farmerId is set.
   */
  async prefetchAll(farmerId: string): Promise<void> {
    const id = farmerId?.trim();
    if (!id) return;
    const now = Date.now();
    const soilExpiry = now + PREFETCH_TTL_SOIL_MS;
    const cropExpiry = now + PREFETCH_TTL_CROP_MS;
    const marketExpiry = now + PREFETCH_TTL_MARKET_MS;
    const govtExpiry = now + PREFETCH_TTL_GOVT_MS;

    const [soil, crop, market, govt] = await Promise.allSettled([
      this.getSoilMoisture(id).catch(() => null),
      this.getCropAdvice(id).catch(() => null),
      this.getMarketPrices().catch(() => null),
      this.getGovtSchemes(id).catch(() => null),
    ]);

    await Promise.all([
      soil.status === 'fulfilled' && soil.value != null
        ? dbRepository.setPrefetchSlot(PREFETCH_KEYS.SOIL_MOISTURE, soil.value, soilExpiry)
        : Promise.resolve(),
      crop.status === 'fulfilled' && crop.value != null
        ? dbRepository.setPrefetchSlot(PREFETCH_KEYS.CROP_ADVICE, crop.value, cropExpiry)
        : Promise.resolve(),
      market.status === 'fulfilled' && market.value != null
        ? dbRepository.setPrefetchSlot(PREFETCH_KEYS.MARKET_PRICES, market.value, marketExpiry)
        : Promise.resolve(),
      govt.status === 'fulfilled' && govt.value != null
        ? dbRepository.setPrefetchSlot(PREFETCH_KEYS.GOVT_SCHEMES, govt.value, govtExpiry)
        : Promise.resolve(),
    ]);
  }

  /**
   * Get list of farmers
   */
  async getFarmers(): Promise<{ farmers: any[] }> {
    const url = `${this.baseURL}${API_ENDPOINTS.FARMERS}`;
    return this.fetchWithRetry(url);
  }

  /**
   * Get a single farmer's details (e.g. for personalized greeting)
   */
  async getFarmer(farmerId: string): Promise<{ farmer_id: string; farmer_name?: string; location?: { district?: string; block?: string }; land_details?: { total_area_hectares?: number } } | null> {
    if (!farmerId?.trim()) return null;
    const url = `${this.baseURL}${API_ENDPOINTS.FARMERS}/${encodeURIComponent(farmerId.trim())}`;
    try {
      return await this.fetchWithRetry(url);
    } catch {
      return null;
    }
  }

  /**
   * Update farmer profile (name, location, land_details). Partial update.
   */
  async updateFarmer(
    farmerId: string,
    payload: { farmer_name?: string; location?: { district?: string; block?: string }; land_details?: { total_area_hectares?: number } }
  ): Promise<unknown> {
    if (!farmerId?.trim()) throw new Error('Farmer ID is required');
    const url = `${this.baseURL}${API_ENDPOINTS.FARMERS}/${encodeURIComponent(farmerId.trim())}`;
    return this.fetchWithRetry(url, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get soil moisture data for a farmer
   */
  async getSoilMoisture(farmerId?: string): Promise<SoilMoistureData> {
    const id = farmerId || this.farmerId;
    if (!id) {
      throw new Error('Farmer ID is required');
    }

    const url = `${this.baseURL}${API_ENDPOINTS.SOIL_MOISTURE}/${id}`;
    const data = await this.fetchWithRetry<SoilMoistureData | { statusCode: number; body: string }>(url);
    if (data && typeof (data as { statusCode?: number; body?: string }).body === 'string' && (data as { statusCode?: number }).statusCode === 200) {
      return JSON.parse((data as { body: string }).body) as SoilMoistureData;
    }
    return data as SoilMoistureData;
  }

  /**
   * Get crop advice for a farmer
   */
  async getCropAdvice(
    farmerId?: string,
    soilMoisture?: number
  ): Promise<CropAdviceResponse> {
    const id = farmerId || this.farmerId;
    if (!id) {
      throw new Error('Farmer ID is required');
    }

    const url = `${this.baseURL}${API_ENDPOINTS.CROP_ADVICE}`;
    const body: any = { farmer_id: id };
    if (soilMoisture !== undefined) {
      body.soil_moisture = soilMoisture;
    }

    return this.fetchWithRetry(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Get market prices
   */
  async getMarketPrices(
    crop?: string,
    district?: string
  ): Promise<MarketPricesResponse> {
    const params = new URLSearchParams();
    if (crop) params.append('crop', crop);
    if (district) params.append('district', district);

    const url = `${this.baseURL}${API_ENDPOINTS.MARKET_PRICES}${
      params.toString() ? `?${params.toString()}` : ''
    }`;

    return this.fetchWithRetry(url);
  }

  /**
   * Get government schemes for the farmer (filtered by profile when farmer_id provided).
   */
  async getGovtSchemes(
    farmerId?: string,
    district?: string
  ): Promise<GovtSchemesResponse> {
    const params = new URLSearchParams();
    const id = farmerId || this.farmerId;
    if (id) params.append('farmer_id', id);
    if (district) params.append('district', district);

    const url = `${this.baseURL}${API_ENDPOINTS.GOVT_SCHEMES}${
      params.toString() ? `?${params.toString()}` : ''
    }`;

    return this.fetchWithRetry(url);
  }

  /**
   * Get complete advice (soil moisture + crop advice + market prices)
   */
  async getAdvice(farmerId?: string): Promise<{
    farmer_id: string;
    soil_moisture: SoilMoistureData;
    crop_advice: CropAdviceResponse;
    market_prices: MarketPricesResponse;
  }> {
    const id = farmerId || this.farmerId;
    if (!id) {
      throw new Error('Farmer ID is required');
    }

    const url = `${this.baseURL}${API_ENDPOINTS.ADVICE}/${id}`;
    return this.fetchWithRetry(url);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
    const url = `${this.baseURL}${API_ENDPOINTS.HEALTH}`;
    return this.fetchWithRetry(url);
  }

  /**
   * Open a streaming transcription WebSocket. Send PCM chunks (16-bit, 16 kHz mono) via sendChunk.
   * Caller must send "end" (text message) or close the socket when done to get final transcript.
   * @param languageCode - 'hi-IN' or 'en-IN'
   * @param options.signal - Optional AbortSignal; closing the socket when aborted.
   */
  openTranscribeStream(
    languageCode: string,
    options?: { signal?: AbortSignal; sampleRate?: number }
  ): Promise<{
    ws: WebSocket;
    sendChunk: (chunk: ArrayBuffer) => void;
    onTranscript: (cb: (event: { type: 'partial' | 'final'; transcript: string }) => void) => void;
    sendEnd: () => void;
  }> {
    const sampleRate = options?.sampleRate ?? 16000;
    const url = `${getTranscribeStreamWsUrl()}?language_code=${encodeURIComponent(languageCode)}&sample_rate=${sampleRate}`;
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      let transcriptCb: (event: { type: 'partial' | 'final'; transcript: string }) => void = () => {};

      ws.binaryType = 'arraybuffer';
      ws.onopen = () => {
        if (options?.signal?.aborted) {
          ws.close();
          return;
        }
        options?.signal?.addEventListener('abort', () => ws.close());
        resolve({
          ws,
          sendChunk: (chunk: ArrayBuffer) => {
            if (ws.readyState === WebSocket.OPEN) ws.send(chunk);
          },
          onTranscript: (cb) => {
            transcriptCb = cb;
          },
          sendEnd: () => {
            if (ws.readyState === WebSocket.OPEN) ws.send('end');
          },
        });
      };
      ws.onmessage = (event) => {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : null;
          if (data && typeof data.type === 'string' && typeof data.transcript === 'string')
            transcriptCb({ type: data.type as 'partial' | 'final', transcript: data.transcript });
        } catch {
          // ignore non-JSON
        }
      };
      ws.onerror = () => reject(new Error('Transcribe stream failed'));
      ws.onclose = () => {};
    });
  }

  /**
   * Transcribe audio to text via backend (Amazon Transcribe).
   * @param audioBlob - Recorded audio blob (e.g. from MediaRecorder)
   * @param languageCode - 'hi-IN' or 'en-IN'
   * @param options.signal - Optional AbortSignal to cancel the request (e.g. voice orb cancel).
   */
  async transcribeAudio(
    audioBlob: Blob,
    languageCode: string,
    options?: { signal?: AbortSignal }
  ): Promise<{ transcript: string }> {
    const url = `${this.baseURL}${API_ENDPOINTS.TRANSCRIBE}`;
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('language_code', languageCode);

    const controller = new AbortController();
    if (options?.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Transcribe failed: ${response.status} ${errBody}`);
    }

    return response.json();
  }

  /**
   * Synthesize speech from text via backend (Amazon Polly).
   * @returns Blob of audio/mpeg
   */
  async synthesizeSpeech(
    text: string,
    language: 'hi' | 'en'
  ): Promise<Blob> {
    const url = `${this.baseURL}${API_ENDPOINTS.SYNTHESIZE}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Synthesize failed: ${response.status} ${errBody}`);
    }

    return response.blob();
  }

  /**
   * Test connection to backend
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }

  // ==================== Private Helper Methods ====================

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const apiClient = new APIClient();
