"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useState, useEffect, useCallback } from "react";

const QuantumField = dynamic(
  () => import("@/components/canvas/QuantumField"),
  { ssr: false },
);

interface QuantumFieldWrapperProps {
  formationText?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<
  { children: ReactNode; onError?: () => void },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; onError?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  reset() {
    this.setState({ hasError: false });
  }

  render() {
    if (this.state.hasError) {
      return null; // Render nothing — will remount on recovery
    }
    return this.props.children;
  }
}

function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    return gl !== null;
  } catch {
    return false;
  }
}

export default function QuantumFieldWrapper({
  formationText,
}: QuantumFieldWrapperProps) {
  const [key, setKey] = useState(0);

  // Auto-recover from WebGL context loss by remounting
  const handleError = useCallback(() => {
    setTimeout(() => setKey((k) => k + 1), 1000);
  }, []);

  // Listen for webglcontextlost on the canvas
  useEffect(() => {
    const handleContextLost = (e: Event) => {
      e.preventDefault(); // Allow context restore
    };
    const handleContextRestored = () => {
      setKey((k) => k + 1); // Force remount
    };

    document.addEventListener("webglcontextlost", handleContextLost, true);
    document.addEventListener("webglcontextrestored", handleContextRestored, true);
    return () => {
      document.removeEventListener("webglcontextlost", handleContextLost, true);
      document.removeEventListener("webglcontextrestored", handleContextRestored, true);
    };
  }, []);

  if (!isWebGLAvailable()) {
    return null;
  }

  return (
    <div aria-hidden="true" className="absolute inset-0">
      <WebGLErrorBoundary key={key} onError={handleError}>
        <QuantumField formationText={formationText} />
      </WebGLErrorBoundary>
    </div>
  );
}
