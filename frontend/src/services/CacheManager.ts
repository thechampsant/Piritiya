import { dbRepository } from './DBRepository';
import type { CachedResponse } from '../types';
import {
  CACHE_SIZE_LIMIT_BYTES,
  CACHE_PRUNE_PERCENTAGE,
} from '../utils/constants';

/**
 * CacheManager - Manages API response caching with size limits
 * Implements LRU-style cache pruning when size limit is exceeded
 */
export class CacheManager {
  /**
   * Cache an API response with size tracking
   */
  async cacheAPIResponse(
    query: string,
    response: string
  ): Promise<void> {
    // Calculate size in bytes (approximate)
    const size = new Blob([query, response]).size;

    const cachedResponse: CachedResponse = {
      id: this.generateCacheId(query),
      query,
      response,
      timestamp: Date.now(),
      size,
    };

    // Check if adding this would exceed limit
    const currentSize = await this.getCacheSize();
    if (currentSize + size > CACHE_SIZE_LIMIT_BYTES) {
      await this.pruneOldCache();
    }

    await dbRepository.cacheResponse(cachedResponse);
  }

  /**
   * Get a cached response by exact query match
   */
  async getCachedResponse(query: string): Promise<string | null> {
    const cached = await dbRepository.findCachedResponse(query);
    return cached ? cached.response : null;
  }

  /**
   * Find similar cached responses using fuzzy matching
   * Returns the most recent match if found
   */
  async findSimilarCachedResponse(query: string): Promise<string | null> {
    const allCached = await dbRepository.getAllCachedResponses();
    
    if (allCached.length === 0) return null;

    // Normalize query for comparison
    const normalizedQuery = this.normalizeQuery(query);

    // Find similar queries (simple fuzzy matching)
    const similar = allCached.filter((cached) => {
      const normalizedCached = this.normalizeQuery(cached.query);
      return this.calculateSimilarity(normalizedQuery, normalizedCached) > 0.8;
    });

    if (similar.length === 0) return null;

    // Return most recent match
    similar.sort((a, b) => b.timestamp - a.timestamp);
    return similar[0].response;
  }

  /**
   * Prune oldest 20% of cache entries when limit is exceeded
   */
  async pruneOldCache(): Promise<void> {
    const allCached = await dbRepository.getAllCachedResponses();
    
    if (allCached.length === 0) return;

    // Sort by timestamp ascending (oldest first)
    allCached.sort((a, b) => a.timestamp - b.timestamp);

    // Calculate how many to remove (20%)
    const removeCount = Math.ceil(allCached.length * CACHE_PRUNE_PERCENTAGE);

    // Remove oldest entries
    const toRemove = allCached.slice(0, removeCount);
    await Promise.all(
      toRemove.map((cached) => dbRepository.deleteCachedResponse(cached.id))
    );
  }

  /**
   * Get total cache size in bytes
   */
  async getCacheSize(): Promise<number> {
    const allCached = await dbRepository.getAllCachedResponses();
    return allCached.reduce((total, cached) => total + cached.size, 0);
  }

  /**
   * Get cache size in megabytes
   */
  async getCacheSizeMB(): Promise<number> {
    const bytes = await this.getCacheSize();
    return bytes / (1024 * 1024);
  }

  /**
   * Clear all cached responses
   */
  async clearCache(): Promise<void> {
    await dbRepository.clearCache();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    count: number;
    sizeBytes: number;
    sizeMB: number;
    oldestTimestamp: number;
    newestTimestamp: number;
  }> {
    const allCached = await dbRepository.getAllCachedResponses();
    
    if (allCached.length === 0) {
      return {
        count: 0,
        sizeBytes: 0,
        sizeMB: 0,
        oldestTimestamp: 0,
        newestTimestamp: 0,
      };
    }

    const sizeBytes = allCached.reduce((total, cached) => total + cached.size, 0);
    const timestamps = allCached.map((c) => c.timestamp);

    return {
      count: allCached.length,
      sizeBytes,
      sizeMB: sizeBytes / (1024 * 1024),
      oldestTimestamp: Math.min(...timestamps),
      newestTimestamp: Math.max(...timestamps),
    };
  }

  // ==================== Private Helper Methods ====================

  /**
   * Generate a unique cache ID from query
   */
  private generateCacheId(query: string): string {
    // Simple hash function for cache ID
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `cache-${Math.abs(hash)}-${Date.now()}`;
  }

  /**
   * Normalize query for comparison (lowercase, trim, remove extra spaces)
   */
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, ''); // Remove punctuation
  }

  /**
   * Calculate similarity between two strings (0-1)
   * Uses simple Levenshtein distance ratio
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
