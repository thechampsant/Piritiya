import { describe, it, expect } from 'vitest';
import { generateSessionId, isSessionExpired } from '../utils/session';
import { getTranslation, formatNumber, formatCurrency } from '../utils/i18n';
import {
  validateFarmerId,
  validateMessage,
  sanitizeInput,
} from '../utils/validation';
import type { Session } from '../types';

describe('Session Utilities', () => {
  it('should generate valid UUID v4 session IDs', () => {
    const sessionId = generateSessionId();
    expect(sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('should detect expired sessions', () => {
    const expiredSession: Session = {
      id: 'test-id',
      farmerId: 'F001',
      startTime: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
      lastActivity: Date.now() - 25 * 60 * 60 * 1000,
      messageCount: 0,
    };
    expect(isSessionExpired(expiredSession)).toBe(true);
  });

  it('should detect active sessions', () => {
    const activeSession: Session = {
      id: 'test-id',
      farmerId: 'F001',
      startTime: Date.now(),
      lastActivity: Date.now(),
      messageCount: 0,
    };
    expect(isSessionExpired(activeSession)).toBe(false);
  });
});

describe('i18n Utilities', () => {
  it('should translate to Hindi', () => {
    expect(getTranslation('appName', 'hi')).toBe('पिरितिया');
    expect(getTranslation('online', 'hi')).toBe('ऑनलाइन');
  });

  it('should translate to English', () => {
    expect(getTranslation('appName', 'en')).toBe('Piritiya');
    expect(getTranslation('online', 'en')).toBe('Online');
  });

  it('should format numbers in Devanagari', () => {
    expect(formatNumber(123, 'hi')).toBe('१२३');
    expect(formatNumber(456, 'hi')).toBe('४५६');
  });

  it('should format numbers in Arabic numerals', () => {
    expect(formatNumber(123, 'en')).toBe('123');
    expect(formatNumber(456, 'en')).toBe('456');
  });

  it('should format currency', () => {
    expect(formatCurrency(1000, 'en')).toBe('₹1000');
    expect(formatCurrency(1000, 'hi')).toBe('₹१०००');
  });
});

describe('Validation Utilities', () => {
  it('should validate correct farmer ID format', () => {
    const result = validateFarmerId('UP-LUCKNOW-MALIHABAD-00001');
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid farmer ID format', () => {
    const result = validateFarmerId('INVALID-ID');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should validate non-empty messages', () => {
    const result = validateMessage('Hello, this is a test message');
    expect(result.isValid).toBe(true);
  });

  it('should reject empty messages', () => {
    const result = validateMessage('');
    expect(result.isValid).toBe(false);
  });

  it('should reject messages that are too long', () => {
    const longMessage = 'a'.repeat(1001);
    const result = validateMessage(longMessage);
    expect(result.isValid).toBe(false);
  });

  it('should sanitize XSS attempts', () => {
    const malicious = '<script>alert("xss")</script>';
    const sanitized = sanitizeInput(malicious);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('</script>');
  });

  it('should remove javascript: protocol', () => {
    const malicious = 'javascript:alert("xss")';
    const sanitized = sanitizeInput(malicious);
    expect(sanitized).not.toContain('javascript:');
  });
});
