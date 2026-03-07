import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ErrorLogger } from '../utils/errorHandlers';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - Catches React component errors
 * Requirement 15.3, 15.6
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error without PII
    ErrorLogger.log('unknown', error, {
      componentStack: errorInfo.componentStack,
    });

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-b from-soil-dark to-soil flex items-center justify-center p-4">
          <div className="bg-cream/5 border border-alert/40 rounded-lg p-6 max-w-md w-full">
            <div className="text-center mb-4">
              <span className="text-6xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-cream mb-2 text-center">
              Something went wrong
            </h1>
            <p className="text-cream/70 text-sm mb-4 text-center">
              कुछ गलत हो गया
            </p>
            <p className="text-cream/60 text-xs mb-6 text-center">
              The app encountered an unexpected error. Please try refreshing the page.
            </p>
            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 min-h-[44px] px-4 py-3 bg-gradient-to-br from-terracotta-light to-terracotta hover:from-terracotta hover:to-clay rounded-lg text-cream font-semibold transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 min-h-[44px] px-4 py-3 bg-cream/10 border border-gold/25 hover:bg-cream/15 rounded-lg text-cream font-semibold transition-all"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
