import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('pk_welcome_banner_dismissed');
      // Session beibehalten, aber Welcome-Portal wieder aktivieren
      window.location.href = window.location.origin;
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              Ups! Ein kleiner Fehler ist aufgetreten
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Der Projektkompass konnte eine Ansicht nicht korrekt laden. Deine bisherigen Daten in der Datenbank sind sicher gespeichert.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 bg-[#0B7BA7] hover:bg-[#00558F] active:scale-95 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Seite neu laden</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <Home className="w-4 h-4 text-slate-500" />
                <span>Zur Startseite</span>
              </button>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details className="mt-6 text-left bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-500 font-mono overflow-auto max-h-40">
                <summary className="cursor-pointer font-bold text-slate-700 mb-1">
                  Technische Fehlerdetails
                </summary>
                {this.state.error.toString()}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
