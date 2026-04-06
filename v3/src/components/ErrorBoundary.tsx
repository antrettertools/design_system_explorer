import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  fallback: ReactNode
}

type State = {
  hasError: boolean
}

/**
 * Generic error boundary. Catches render errors in the subtree and shows
 * `fallback` instead of a blank screen. Logs to console for debugging.
 *
 * Co-locate the boundary close to the subtree it guards so each component
 * owns its own failure UX (see LivePreview, ExportPanel, DesignSystemViewer).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught render error:', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
