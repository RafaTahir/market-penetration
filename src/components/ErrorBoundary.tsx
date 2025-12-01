import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-red-500/20 p-4 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
                <p className="text-slate-400 mt-1">
                  An unexpected error occurred in the application
                </p>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6">
              <h2 className="text-sm font-semibold text-red-400 mb-2">Error Details:</h2>
              <p className="text-sm text-slate-300 font-mono break-all">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6">
                <summary className="text-sm font-semibold text-slate-400 cursor-pointer hover:text-slate-300">
                  Component Stack (Development Only)
                </summary>
                <pre className="text-xs text-slate-400 mt-2 overflow-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Go to Home
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                If this problem persists, please:
              </p>
              <ul className="text-sm text-slate-400 mt-2 space-y-1 list-disc list-inside">
                <li>Check your internet connection</li>
                <li>Clear your browser cache and reload</li>
                <li>Check the browser console for more details</li>
                <li>Ensure Supabase connection is configured correctly</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
