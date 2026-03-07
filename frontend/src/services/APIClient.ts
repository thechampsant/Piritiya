import type {
  ChatRequest,
  ChatResponse,
  SoilMoistureData,
  CropAdviceResponse,
  MarketPricesResponse,
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
   * Fetch with retry logic and timeout
   */
  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
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
   * Send chat message to backend
   */
  async sendChatMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    const request: ChatRequest = {
      message,
      session_id: sessionId || this.sessionId,
      farmer_id: this.farmerId,
    };

    const url = `${this.baseURL}${API_ENDPOINTS.CHAT}?message=${encodeURIComponent(message)}${
      request.session_id ? `&session_id=${request.session_id}` : ''
    }`;

    return this.fetchWithRetry<ChatResponse>(url, {
      method: 'POST',
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
   * Get soil moisture data for a farmer
   */
  async getSoilMoisture(farmerId?: string): Promise<SoilMoistureData> {
    const id = farmerId || this.farmerId;
    if (!id) {
      throw new Error('Farmer ID is required');
    }

    const url = `${this.baseURL}${API_ENDPOINTS.SOIL_MOISTURE}/${id}`;
    return this.fetchWithRetry(url);
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
