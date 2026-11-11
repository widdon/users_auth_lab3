'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  /** Что показать вместо упавшей части интерфейса. reset — попробовать отрисовать заново. */
  fallback: (props: { error: Error; reset: () => void }) => ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Локальный error boundary. Ловит ошибку рендера в своём поддереве
 * (в том числе ошибку асинхронного серверного компонента внутри <Suspense>)
 * и заменяет только эту часть страницы, а не всю страницу, как error.tsx.
 *
 * Error boundary можно написать только классом: у функциональных компонентов
 * нет аналога getDerivedStateFromError / componentDidCatch.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Ошибка в секции страницы:', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) return this.props.fallback({ error: this.state.error, reset: this.reset });
    return this.props.children;
  }
}
