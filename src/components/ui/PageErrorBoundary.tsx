"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class PageErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.fallback) {
        return this.fallback;
      }

      const modName = this.props.moduleName || "Module";

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-6 bg-surface-secondary/40 border border-border/60 rounded-2xl shadow-soft">
          <div className="p-4 bg-danger/10 text-danger rounded-full mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-foreground/60 text-center max-w-md mb-6">
            The {modName} failed to load or experienced a runtime error. This has been captured and logged.
          </p>

          <div className="flex gap-3 mb-4">
            <Button 
              variant="primary" 
              onClick={this.handleReset}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Try Again
            </Button>
            <Button
              variant="ghost"
              onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
              icon={this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            >
              Error Details
            </Button>
          </div>

          {this.state.showDetails && this.state.error && (
            <div className="w-full max-w-lg mt-4 p-4 bg-surface rounded-xl border border-border/80 text-left overflow-x-auto text-xs font-mono text-foreground/75">
              <p className="font-bold text-danger mb-1">{this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <pre className="whitespace-pre-wrap mt-2 leading-relaxed opacity-80">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }

  // Helper getter to avoid standard typing clash on this.fallback vs this.props.fallback
  private get fallback(): ReactNode {
    return this.props.fallback;
  }
}
