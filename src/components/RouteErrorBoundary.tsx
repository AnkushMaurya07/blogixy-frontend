import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

const SAFE_ERROR_MESSAGE = 'Something went wrong while loading this page.';

/** Catches render errors in lazy-loaded routes and offers recovery. */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: SAFE_ERROR_MESSAGE };

  static getDerivedStateFromError(err: Error): State {
    return {
      hasError: true,
      message: import.meta.env.DEV ? err.message || SAFE_ERROR_MESSAGE : SAFE_ERROR_MESSAGE,
    };
  }

  override componentDidCatch(err: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console -- intentional for local debugging
      console.error('[RouteErrorBoundary]', err, info.componentStack);
    }
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Box sx={{ px: 2, py: 6, maxWidth: 520, mx: 'auto' }}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Something went wrong
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.95 }}>
              Please try again or go back to the previous page.
            </Typography>
          </Alert>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Reload page
            </Button>
            <Button variant="outlined" onClick={() => window.history.back()}>
              Go back
            </Button>
          </Stack>
        </Box>
      );
    }
    return this.props.children;
  }
}
