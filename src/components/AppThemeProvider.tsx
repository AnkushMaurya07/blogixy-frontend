import { CssBaseline } from '@mui/material';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SnackbarProvider } from 'notistack';
import { useMemo, type PropsWithChildren } from 'react';

import { useAppSelector } from '../features/auth/hooks';
import { createBlogixyTheme } from '../theme/createAppTheme';

function ToastHost({ children }: PropsWithChildren) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <SnackbarProvider
      maxSnack={4}
      dense
      preventDuplicate
      anchorOrigin={{ vertical: isXs ? 'top' : 'bottom', horizontal: 'center' }}
    >
      {children}
    </SnackbarProvider>
  );
}

export default function AppThemeProvider({ children }: PropsWithChildren) {
  const { primaryMain, themeMode, layoutDensity } = useAppSelector((s) => s.ui);

  const theme = useMemo(
    () =>
      createBlogixyTheme({
        mode: themeMode,
        primaryMain,
        layoutDensity,
      }),
    [layoutDensity, primaryMain, themeMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastHost>{children}</ToastHost>
    </ThemeProvider>
  );
}
