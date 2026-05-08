import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import AppThemeProvider from './components/AppThemeProvider';

import './index.css';
import { store } from './store';
import { queryClient } from './tanstackQuery';

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppThemeProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </AppThemeProvider>
    </Provider>
  </React.StrictMode>,
);
