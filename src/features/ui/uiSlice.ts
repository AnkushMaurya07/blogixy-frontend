import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type UILayoutDensity = 'comfortable' | 'standard' | 'compact';
export type UIShellMaxWidth = 'full' | 'xl' | 'lg' | 'md';

export type UIState = {
  themeMode: 'light' | 'dark';
  primaryMain: string;
  layoutDensity: UILayoutDensity;
  shellMaxWidth: UIShellMaxWidth;
};

const STORAGE_KEY = 'blogixy-ui-v1';

const defaults: UIState = {
  themeMode: 'light',
  primaryMain: '#2563eb',
  layoutDensity: 'standard',
  shellMaxWidth: 'xl',
};

function loadStored(): Partial<UIState> {
  if (typeof localStorage === 'undefined') {
    return {};
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as Partial<UIState>;
  } catch {
    return {};
  }
}

const initialState: UIState = { ...defaults, ...loadStored() };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setPrimaryMain(state, action: PayloadAction<string>) {
      state.primaryMain = action.payload;
    },
    setThemeMode(state, action: PayloadAction<'light' | 'dark'>) {
      state.themeMode = action.payload;
    },
    toggleThemeMode(state) {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
    },
    setLayoutDensity(state, action: PayloadAction<UILayoutDensity>) {
      state.layoutDensity = action.payload;
    },
    setShellMaxWidth(state, action: PayloadAction<UIShellMaxWidth>) {
      state.shellMaxWidth = action.payload;
    },
    resetUiPreferences(state) {
      Object.assign(state, defaults);
    },
  },
});

export const { setPrimaryMain, setThemeMode, toggleThemeMode, setLayoutDensity, setShellMaxWidth, resetUiPreferences } =
  uiSlice.actions;

export default uiSlice.reducer;

export function persistUiState(state: UIState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}
