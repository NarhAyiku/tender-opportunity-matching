import { Component } from 'react';
import { logError, ErrorLevel, ErrorCategory } from '../services/errorLogger';
import Button from './ui/Button';
import Card from './ui/Card';

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them, and displays a fallback UI.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    logError(error, {
      level: ErrorLevel.CRITICAL,
      category: ErrorCategory.UI,
      component: this.props.name || 'ErrorBoundary',
      action: 'componentDidCatch',
      metadata: {
        componentStack: errorInfo?.componentStack
      }
    });

    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center space-y-4">
            <div className="text-4xl">😵</div>
            <h2 className="text-xl font-semibold text-slate-900">
              Oops! Something went wrong
            </h2>
            <p className="text-sm text-slate-600">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="text-left bg-red-50 border border-red-200 rounded-lg p-3 text-xs">
                <p className="font-semibold text-red-700 mb-1">Error Details:</p>
                <pre className="text-red-600 whitespace-pre-wrap overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <Button onClick={this.handleRetry} variant="outline">
                Try Again
              </Button>
              <Button onClick={this.handleReload}>
                Reload Page
              </Button>
            </div>

            <p className="text-xs text-slate-500">
              If this keeps happening, please contact support.
            </p>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
