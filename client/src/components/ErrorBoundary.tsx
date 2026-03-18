import { Component, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="text-3xl">!</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Something went wrong
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-sm">
              {this.state.error?.message || 'An unexpected error occurred. Your data is safe.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="btn btn-primary inline-flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try again</span>
              </button>
              <button
                onClick={() => window.location.href = '/app/dashboard'}
                className="btn btn-outline"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
