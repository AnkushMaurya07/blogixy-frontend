import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useMemo, type PropsWithChildren } from 'react';

import { useAppSelector } from '../features/auth/hooks';
import { createBlogixyTheme } from '../theme/createAppTheme';

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
      {children}
    </ThemeProvider>
  );
}
