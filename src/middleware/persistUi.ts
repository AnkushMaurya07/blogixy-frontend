import type { Middleware } from '@reduxjs/toolkit';

import { persistUiState } from '../features/ui/uiSlice';

export const persistUiMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const prev = storeApi.getState().ui;
  const result = next(action);
  const after = storeApi.getState().ui;

  const type =
    typeof action === 'object' && action !== null && 'type' in action
      ? String((action as { type: unknown }).type)
      : '';

  if (prev !== after && type.startsWith('ui/')) {
    persistUiState(after);
  }

  return result;
};
