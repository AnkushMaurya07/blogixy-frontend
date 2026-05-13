import { Box, CircularProgress, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

/** Full-width route loading UI (used with `React.Suspense`). */
export default function RouteFallback() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: { xs: '55dvh', md: '50dvh' },
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2.5,
        px: 2,
        py: 6,
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <CircularProgress
        size={48}
        thickness={4}
        disableShrink
        sx={{ color: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 1 : 0.9) }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 650, letterSpacing: '0.02em' }}>
        Loading view…
      </Typography>
    </Box>
  );
}
