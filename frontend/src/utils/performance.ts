/**
 * Performance utilities for the Piritiya app
 * Requirements: 14.6
 */

/**
 * Debounce function - delays execution until after wait time has elapsed
 * since the last time it was invoked
 * 
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - ensures function is called at most once per specified time period
 * 
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Lazy load images with Intersection Observer
 * 
 * @param imageElement - Image element to lazy load
 * @param src - Image source URL
 */
export function lazyLoadImage(imageElement: HTMLImageElement, src: string): void {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          imageElement.src = src;
          observer.unobserve(imageElement);
        }
      });
    });

    observer.observe(imageElement);
  } else {
    // Fallback for browsers without Intersection Observer
    imageElement.src = src;
  }
}

/**
 * Measure performance of a function
 * 
 * @param name - Name of the measurement
 * @param func - Function to measure
 * @returns Result of the function
 */
export async function measurePerformance<T>(
  name: string,
  func: () => T | Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await func();
  const end = performance.now();
  
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  }
  
  return result;
}

/**
 * Check if device is low-end based on hardware concurrency
 */
export function isLowEndDevice(): boolean {
  return navigator.hardwareConcurrency <= 2;
}

/**
 * Get network information (if available)
 */
export function getNetworkInfo(): {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
} {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) {
    return {};
  }

  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
}

/**
 * Check if connection is slow (3G or slower)
 */
export function isSlowConnection(): boolean {
  const networkInfo = getNetworkInfo();
  return networkInfo.effectiveType === 'slow-2g' || 
         networkInfo.effectiveType === '2g' || 
         networkInfo.effectiveType === '3g';
}

/**
 * Preload critical resources
 */
export function preloadResource(url: string, type: 'image' | 'script' | 'style' | 'font'): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  
  switch (type) {
    case 'image':
      link.as = 'image';
      break;
    case 'script':
      link.as = 'script';
      break;
    case 'style':
      link.as = 'style';
      break;
    case 'font':
      link.as = 'font';
      link.crossOrigin = 'anonymous';
      break;
  }
  
  document.head.appendChild(link);
}

/**
 * Request idle callback wrapper with fallback
 */
export function requestIdleCallback(callback: () => void, timeout: number = 2000): void {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}
