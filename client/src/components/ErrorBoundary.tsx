import { cn } from "@/lib/utils";
import { WarningCircle, ArrowClockwise } from "@phosphor-icons/react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[100dvh] p-8 circuit-bg">
          <div className="tx-card flex flex-col items-center w-full max-w-2xl p-8">
            <WarningCircle
              size={48}
              weight="regular"
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl font-semibold mb-4 text-zinc-950 font-sans">
              An unexpected error occurred.
            </h2>

            <div className="p-4 w-full rounded-xl bg-zinc-50 border border-zinc-200/70 overflow-auto mb-6">
              <pre className="text-xs font-mono text-zinc-600 whitespace-break-spaces">
                {this.state.error?.stack}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="tx-btn-primary px-5 h-10 text-xs font-medium inline-flex items-center gap-2"
            >
              <ArrowClockwise size={16} weight="regular" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
