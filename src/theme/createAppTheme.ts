import { alpha, createTheme } from '@mui/material/styles';
import type { UILayoutDensity } from '../features/ui/uiSlice';

export function createBlogixyTheme(opts: {
  mode: 'light' | 'dark';
  primaryMain: string;
  layoutDensity: UILayoutDensity;
}) {
  const { mode, primaryMain, layoutDensity } = opts;
  const spacingUnit = layoutDensity === 'compact' ? 6 : layoutDensity === 'comfortable' ? 10 : 8;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryMain,
        contrastText: mode === 'light' ? '#ffffff' : '#0b1220',
      },
      secondary: {
        main: mode === 'light' ? '#64748b' : '#94a3b8',
      },
      background:
        mode === 'light'
          ? { default: '#f4f7fb', paper: '#ffffff' }
          : { default: '#0b0f17', paper: '#141b27' },
      divider:
        mode === 'light'
          ? alpha(primaryMain, 0.06)
          : alpha('#cbd5f5', 0.06),
      text:
        mode === 'light'
          ? { primary: '#0f172a', secondary: '#475569' }
          : { primary: '#e7edf7', secondary: '#9fb4d9' },
    },
    spacing: spacingUnit,
    shape: {
      borderRadius: 14,
    },
    typography: {
      fontFamily: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
      h3: { fontWeight: 800, letterSpacing: -0.5 },
      h5: { fontWeight: 800, letterSpacing: -0.15 },
      h6: { fontWeight: 700 },
      body1: { lineHeight: 1.68 },
      body2: { lineHeight: 1.62 },
      button: { letterSpacing: 0.03, fontWeight: 650 },
      caption: { fontWeight: 500 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            scrollbarColor: `${alpha(primaryMain, 0.55)} transparent`,
          },
          '::-webkit-scrollbar': { height: '8px', width: '8px' },
          '::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(primaryMain, 0.42),
            borderRadius: '99px',
          },
          '::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: '12px',
            paddingInline: '1.125rem',
            fontWeight: 650,
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${alpha(mode === 'light' ? '#0f172a' : '#e7edf7', mode === 'light' ? 0.06 : 0.06)}`,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
          },
        },
      },
    },
  });
}
