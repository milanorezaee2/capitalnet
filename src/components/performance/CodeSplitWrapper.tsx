/**
 * Enterprise Code Split Wrapper Component
 * Wrapper for code-split components with loading states
 */

import React, { Suspense, lazy } from 'react';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/ErrorState';

export interface CodeSplitWrapperProps {
  componentLoader: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  componentProps?: any;
}

export const CodeSplitWrapper: React.FC<CodeSplitWrapperProps> = ({
  componentLoader,
  fallback,
  errorFallback,
  componentProps = {},
}) => {
  const LazyComponent = lazy(componentLoader);

  return (
    <Suspense fallback={fallback || <LoadingState />}>
      <ErrorBoundary fallback={errorFallback || <ErrorState message="خطا در بارگذاری کامپوننت" />}>
        <LazyComponent {...componentProps} />
      </ErrorBoundary>
    </Suspense>
  );
};

class ErrorBoundary extends React.Component<
  { fallback?: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback?: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
