import { cleanup, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ProtectedRoute } from '../App';
import { logout, setTokens } from '../features/auth/authSlice';
import { store } from '../store';

function renderProtectedRoute() {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route
            path="/private"
            element={
              <ProtectedRoute>
                <h1>Private page</h1>
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<h1>Sign in</h1>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

beforeEach(() => {
  store.dispatch(logout());
});

afterEach(() => {
  cleanup();
  store.dispatch(logout());
});

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to sign in', () => {
    renderProtectedRoute();

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Private page' })).not.toBeInTheDocument();
  });

  it('renders protected content when an access token exists', () => {
    store.dispatch(setTokens({ access: 'valid-access', refresh: 'valid-refresh' }));

    renderProtectedRoute();

    expect(screen.getByRole('heading', { name: 'Private page' })).toBeInTheDocument();
  });
});