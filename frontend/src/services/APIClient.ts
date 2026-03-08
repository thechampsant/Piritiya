import type {
  ChatRequest,
  ChatResponse,
  SoilMoistureData,
  CropAdviceResponse,
  MarketPricesResponse,
  GovtSchemesResponse,
} from '../types';
import {
  API_BASE_URL,
  API_ENDPOINTS,
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
   * Pass farmerIdOverride to ensure farmer_id is sent for this request (e.g. schemes flow).
   * Pass options.signal to allow aborting the request (e.g. voice orb cancel).
   */
  async sendChatMessage(
    message: string,
    sessionId?: string,
    farmerIdOverride?: string,
    options?: { signal?: AbortSignal }
  ): Promise<ChatResponse> {
    const request: ChatRequest = {
      message,
      session_id: sessionId || this.sessionId,
      farmer_id: farmerIdOverride ?? this.farmerId,
    };

    const url = `${this.baseURL}${API_ENDPOINTS.CHAT}`;
    return this.fetchWithRetry<ChatResponse>(url, {
      method: 'POST',
      body: JSON.stringify(request),
      signal: options?.signal,
    });
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
