import { alpha, createTheme } from '@mui/material/styles';
import type { UILayoutDensity } from '../features/ui/uiSlice';

export function createBlogixyTheme(opts: {
  mode: 'light' | 'dark';
  primaryMain: string;
  layoutDensity: UILayoutDensity;
}) {
  const { mode, primaryMain, layoutDensity } = opts;
  const spacingUnit = layoutDensity === 'compact' ? 6 : layoutDensity === 'comfortable' ? 10 : 8;
  const isLight = mode === 'light';

  const paperBorder = isLight ? alpha('#0f172a', 0.075) : alpha('#e7edf7', 0.07);
  const paperShadow = isLight
    ? `0 1px 2px ${alpha('#0f172a', 0.04)}, 0 14px 40px -18px ${alpha('#0f172a', 0.1)}`
    : `0 1px 0 ${alpha('#000', 0.35)}, 0 22px 48px -20px ${alpha('#000', 0.55)}`;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryMain,
        contrastText: '#ffffff',
      },
      secondary: {
        main: mode === 'light' ? '#5b6b82' : '#94a3b8',
      },
      background: isLight
        ? { default: '#f1f5f9', paper: '#ffffff' }
        : { default: '#0b0f17', paper: '#141b27' },
      divider: isLight ? alpha('#0f172a', 0.09) : alpha('#cbd5f5', 0.07),
      text: isLight
        ? { primary: '#0b1220', secondary: '#3d5066' }
        : { primary: '#e7edf7', secondary: '#9fb4d9' },
    },
    spacing: spacingUnit,
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
      h3: { fontWeight: 850, letterSpacing: -0.55, ...(isLight ? { color: '#0b1220' } : {}) },
      h4: { fontWeight: 850, letterSpacing: -0.45, ...(isLight ? { color: '#0b1220' } : {}) },
      h5: { fontWeight: 800, letterSpacing: -0.2, ...(isLight ? { color: '#0b1220' } : {}) },
      h6: { fontWeight: 750, letterSpacing: -0.12, ...(isLight ? { color: '#0f172a' } : {}) },
      subtitle1: { fontWeight: 650, letterSpacing: -0.02 },
      subtitle2: { fontWeight: 650 },
      body1: { lineHeight: 1.68 },
      body2: { lineHeight: 1.65 },
      button: { letterSpacing: 0.03, fontWeight: 650 },
      caption: { fontWeight: 550, letterSpacing: 0.02 },
      overline: { fontWeight: 780, letterSpacing: '0.14em' },
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
            transition: 'transform 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${paperBorder}`,
            boxShadow: paperShadow,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${paperBorder}`,
            boxShadow: paperShadow,
            transition: 'box-shadow 0.22s ease, border-color 0.22s ease, transform 0.22s ease',
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
