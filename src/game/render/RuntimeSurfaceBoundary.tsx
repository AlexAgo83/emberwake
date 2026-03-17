import { Component } from "react";
import type { ReactNode } from "react";

type RuntimeSurfaceBoundaryProps = {
  children: ReactNode;
  onError: (error: Error) => void;
};

type RuntimeSurfaceBoundaryState = {
  hasError: boolean;
};

export class RuntimeSurfaceBoundary extends Component<
  RuntimeSurfaceBoundaryProps,
  RuntimeSurfaceBoundaryState
> {
  override state: RuntimeSurfaceBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError() {
    return {
      hasError: true
    };
  }

  override componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  override render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
