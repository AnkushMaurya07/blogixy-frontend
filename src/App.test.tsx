import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import App from './App';
import AppThemeProvider from './components/AppThemeProvider';
import { RouteErrorBoundary } from './components/RouteErrorBoundary';
import { logout } from './features/auth/authSlice';
import { store } from './store';

const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderApp = (initialEntries = ['/missing']) =>
  render(
    <Provider store={store}>
      <AppThemeProvider>
        <QueryClientProvider client={testQueryClient}>
          <MemoryRouter initialEntries={initialEntries}>
            <App />
          </MemoryRouter>
        </QueryClientProvider>
      </AppThemeProvider>
    </Provider>,
  );

beforeEach(() => {
  testQueryClient.clear();
  store.dispatch(logout());
  localStorage.clear();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('App routing and error handling', () => {
  it('shows a friendly not-found page for unknown routes', () => {
    renderApp();

    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
  });

  it('renders a safe fallback when a route crashes', () => {
    render(
      <RouteErrorBoundary>
        <ThrowingComponent />
      </RouteErrorBoundary>,
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.queryByText(/secret backend detail/i)).not.toBeInTheDocument();
  });
});

function ThrowingComponent(): React.ReactElement {
  throw new Error('secret backend detail');
}
