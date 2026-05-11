import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type UILayoutDensity = 'comfortable' | 'standard' | 'compact';
export type UIShellMaxWidth = 'full' | 'xl' | 'lg' | 'md';
export type DashboardMascot = 'cat' | 'dog';

export type UIState = {
  themeMode: 'light' | 'dark';
  primaryMain: string;
  layoutDensity: UILayoutDensity;
  shellMaxWidth: UIShellMaxWidth;
  /** Tiny Three.js companion on the author dashboard (Settings → companion). */
  dashboardMascot: DashboardMascot;
};

const STORAGE_KEY = 'blogixy-ui-v1';

const defaults: UIState = {
  themeMode: 'light',
  primaryMain: '#2563eb',
  layoutDensity: 'standard',
  shellMaxWidth: 'xl',
  dashboardMascot: 'cat',
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
    setDashboardMascot(state, action: PayloadAction<DashboardMascot>) {
      state.dashboardMascot = action.payload;
    },
    resetUiPreferences(state) {
      Object.assign(state, defaults);
    },
  },
});

export const {
  setPrimaryMain,
  setThemeMode,
  toggleThemeMode,
  setLayoutDensity,
  setShellMaxWidth,
  setDashboardMascot,
  resetUiPreferences,
} = uiSlice.actions;

export default uiSlice.reducer;

export function persistUiState(state: UIState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}
