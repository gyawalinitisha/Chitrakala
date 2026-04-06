import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('App render error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8f8f8'
                }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#333', fontFamily: 'Playfair Display, serif' }}>
                        Something went wrong
                    </h2>
                    <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '400px' }}>
                        {this.state.error?.message || 'An unexpected error occurred. Please refresh the page.'}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'none',
                                color: '#d4af37',
                                border: '1px solid #d4af37',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => { window.location.href = '/'; }}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #d4af37, #f9d77e)',
                                color: '#000',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
