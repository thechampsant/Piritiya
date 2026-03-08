import { dbRepository } from '../services/DBRepository';
import type { Session } from '../types';
import { SESSION_TIMEOUT_MS } from './constants';

/**
 * Generate a unique session ID using UUID v4
 */
export function generateSessionId(): string {
  // UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Check if a session has expired (24 hours)
 */
export function isSessionExpired(session: Session): boolean {
  const now = Date.now();
  const timeSinceLastActivity = now - session.lastActivity;
  return timeSinceLastActivity > SESSION_TIMEOUT_MS;
}

/**
 * Get or create a session for a farmer
 * Returns existing session if valid, creates new one if expired or doesn't exist
 */
export async function getOrCreateSession(farmerId: string): Promise<Session> {
  // Try to get the latest session for this farmer
  const existingSession = await dbRepository.getLatestSession(farmerId);

  // If session exists and is not expired, return it
  if (existingSession && !isSessionExpired(existingSession)) {
    return existingSession;
  }

  // Create new session
  const newSession: Session = {
    id: generateSessionId(),
    farmerId,
    startTime: Date.now(),
    lastActivity: Date.now(),
    messageCount: 0,
  };

  await dbRepository.saveSession(newSession);
  return newSession;
}

/**
 * Update session activity timestamp
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  const session = await dbRepository.getSession(sessionId);
  if (session) {
    session.lastActivity = Date.now();
    await dbRepository.saveSession(session);
  }
}

/**
 * Increment session message count
 */
export async function incrementSessionMessageCount(
  sessionId: string
): Promise<void> {
  const session = await dbRepository.getSession(sessionId);
  if (session) {
    session.messageCount += 1;
    session.lastActivity = Date.now();
    await dbRepository.saveSession(session);
  }
}

/**
 * Create a new session (force new session creation)
 */
export async function createNewSession(farmerId: string): Promise<Session> {
  const newSession: Session = {
    id: generateSessionId(),
    farmerId,
    startTime: Date.now(),
    lastActivity: Date.now(),
    messageCount: 0,
  };

  await dbRepository.saveSession(newSession);
  return newSession;
}

/**
 * Get session duration in milliseconds
 */
export function getSessionDuration(session: Session): number {
  return Date.now() - session.startTime;
}

/**
 * Get time since last activity in milliseconds
 */
export function getTimeSinceLastActivity(session: Session): number {
  return Date.now() - session.lastActivity;
}

/**
 * Format session duration as human-readable string
 */
export function formatSessionDuration(session: Session): string {
  const duration = getSessionDuration(session);
  const minutes = Math.floor(duration / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}
