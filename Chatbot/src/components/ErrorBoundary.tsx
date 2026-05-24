import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center bg-gray-50 p-8">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
            <div className="text-5xl mb-4">💥</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              页面渲染出错
            </h2>
            <pre className="text-left text-xs bg-red-50 text-red-700 p-4 rounded-lg mb-6 overflow-auto max-h-40 font-mono">
              {this.state.error?.message}
            </pre>
            <button
              onClick={this.handleReset}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              重试
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
