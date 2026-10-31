"use client";

import { Component, type ReactNode } from "react";

/* A crash inside an interactive section (canvas, carousel, intro, video) must
   not take the page down. The section is swapped for a plain fallback and the
   rest of the page keeps rendering. The error is logged for the console only. */
export default class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error("Section failed to render:", error.message);
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
