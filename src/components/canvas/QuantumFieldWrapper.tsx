"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";

const QuantumField = dynamic(
  () => import("@/components/canvas/QuantumField"),
  { ssr: false },
);

interface QuantumFieldWrapperProps {
  scrollProgress: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <WebGLFallback />;
    }
    return this.props.children;
  }
}

function WebGLFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg)]">
      <div className="text-center max-w-md px-6">
        <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          FIELD PROJECT
        </h2>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
          The 3D quantum field requires WebGL.
        </p>
        <p className="text-[var(--text-tertiary)] text-xs leading-relaxed">
          Enable hardware acceleration: Chrome → Settings → System → &quot;Use
          hardware acceleration when available&quot;, then restart Chrome.
        </p>
      </div>
    </div>
  );
}

function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") || canvas.getContext("webgl");
    return gl !== null;
  } catch {
    return false;
  }
}

export default function QuantumFieldWrapper({
  scrollProgress,
}: QuantumFieldWrapperProps) {
  if (!isWebGLAvailable()) {
    return <WebGLFallback />;
  }

  return (
    <WebGLErrorBoundary>
      <QuantumField scrollProgress={scrollProgress} />
    </WebGLErrorBoundary>
  );
}
