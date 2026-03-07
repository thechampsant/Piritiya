import { describe, it, expect, vi, beforeEach } from 'vitest';
import { APIClient } from './APIClient';

describe('APIClient', () => {
  const baseURL = 'http://test.example.com';
  let client: APIClient;

  beforeEach(() => {
    client = new APIClient(baseURL);
    vi.stubGlobal('fetch', vi.fn());
  });

  it('healthCheck returns status when backend responds', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'healthy', service: 'piritiya-api' }),
    } as Response);

    const result = await client.healthCheck();
    expect(result.status).toBe('healthy');
    expect(result.service).toBe('piritiya-api');
    expect(mockFetch).toHaveBeenCalledWith(
      `${baseURL}/health`,
      expect.objectContaining({ headers: expect.any(Object) })
    );
  });

  it('synthesizeSpeech returns Blob on success', async () => {
    const mockFetch = vi.mocked(fetch);
    const fakeAudio = new Blob(['fake-mp3'], { type: 'audio/mpeg' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => fakeAudio,
    } as Response);

    const result = await client.synthesizeSpeech('hello', 'en');
    expect(result).toBeInstanceOf(Blob);
    expect(mockFetch).toHaveBeenCalledWith(
      `${baseURL}/speech/synthesize`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'hello', language: 'en' }),
      })
    );
  });

  it('synthesizeSpeech throws on non-ok response', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Server error',
    } as Response);

    await expect(client.synthesizeSpeech('hi', 'hi')).rejects.toThrow(/Synthesize failed/);
  });

  it('transcribeAudio sends FormData and returns transcript', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ transcript: 'नमस्ते' }),
    } as Response);

    const blob = new Blob(['audio'], { type: 'audio/webm' });
    const result = await client.transcribeAudio(blob, 'hi-IN');
    expect(result.transcript).toBe('नमस्ते');
    expect(mockFetch).toHaveBeenCalledWith(
      `${baseURL}/speech/transcribe`,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );
  });

  it('transcribeAudio throws on non-ok response', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: async () => 'Transcribe not configured',
    } as Response);

    const blob = new Blob(['x'], { type: 'audio/webm' });
    await expect(client.transcribeAudio(blob, 'en-IN')).rejects.toThrow(/Transcribe failed/);
  });

  it('getSoilMoisture uses set farmerId', async () => {
    client.setFarmerId('F001');
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ moisture_index: 42, moisture_category: 'Optimal' }),
    } as Response);

    const result = await client.getSoilMoisture();
    expect(result.moisture_index).toBe(42);
    expect(mockFetch).toHaveBeenCalledWith(
      `${baseURL}/soil-moisture/F001`,
      expect.any(Object)
    );
  });

  it('testConnection returns true when healthCheck succeeds', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'healthy', service: 'piritiya-api' }),
    } as Response);

    const ok = await client.testConnection();
    expect(ok).toBe(true);
  });

  it('testConnection returns false when healthCheck fails', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const ok = await client.testConnection();
    expect(ok).toBe(false);
  });
});
