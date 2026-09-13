import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Never let the app crash silently — log for debugging.
    // eslint-disable-next-line no-console
    console.error('Digital Dukaan crashed:', error, info)
  }

  handleReset = () => {
    try {
      window.localStorage.clear()
    } catch {
      /* ignore */
    }
    window.location.hash = '#/'
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="crash-screen">
        <div className="crash-card">
          <div className="crash-emoji">🛍️</div>
          <h2>Something went wrong</h2>
          <p>
            Digital Dukaan hit an unexpected problem. Your store data is safe in this
            browser — reloading usually fixes it.
          </p>
          <div className="crash-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                this.setState({ error: null })
                window.location.hash = '#/'
              }}
            >
              Try again
            </button>
            <button className="btn btn-ghost" onClick={this.handleReset}>
              Reset app data
            </button>
          </div>
        </div>
      </div>
    )
  }
}
